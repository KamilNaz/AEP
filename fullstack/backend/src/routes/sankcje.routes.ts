import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { logAudit } from '../utils/audit';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', sortBy = 'data', sortOrder = 'desc', search, dateFrom, dateTo } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);
    const where: any = {};
    if (search) { where.OR = [{ osoba: { contains: search as string, mode: 'insensitive' } }, { rodzajSankcji: { contains: search as string, mode: 'insensitive' } }]; }
    if (dateFrom || dateTo) { where.data = {}; if (dateFrom) where.data.gte = new Date(dateFrom as string); if (dateTo) where.data.lte = new Date(dateTo as string); }
    const [data, total] = await Promise.all([prisma.sankcja.findMany({ where, skip, take, orderBy: { [sortBy as string]: sortOrder } }), prisma.sankcja.count({ where })]);
    res.json({ data, pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) } });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try { const item = await prisma.sankcja.findUnique({ where: { id: req.params.id } }); if (!item) { res.status(404).json({ error: 'Not found' }); return; } res.json({ data: item }); } catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, data: req.body.data ? new Date(req.body.data) : new Date(), dataWykonania: req.body.dataWykonania ? new Date(req.body.dataWykonania) : null, createdBy: req.user!.id };
    const item = await prisma.sankcja.create({ data });
    await logAudit(req, 'CREATE', 'sankcje', item.id, null, item);
    res.status(201).json({ data: item });
  } catch (error) { res.status(500).json({ error: 'Failed to create' }); }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.sankcja.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const item = await prisma.sankcja.update({ where: { id: req.params.id }, data: { ...req.body, data: req.body.data ? new Date(req.body.data) : existing.data } });
    await logAudit(req, 'UPDATE', 'sankcje', item.id, existing, item);
    res.json({ data: item });
  } catch (error) { res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.sankcja.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    await prisma.sankcja.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'sankcje', req.params.id, existing, null);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete' }); }
});

export default router;
