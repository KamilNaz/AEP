import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo, typ } = req.query;
    const where: any = {};
    if (dateFrom || dateTo) { where.data = {}; if (dateFrom) where.data.gte = new Date(dateFrom as string); if (dateTo) where.data.lte = new Date(dateTo as string); }
    if (typ) where.typ = typ;
    const data = await prisma.kalendarzEvent.findMany({ where, orderBy: { data: 'asc' } });
    res.json({ data });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try { const item = await prisma.kalendarzEvent.findUnique({ where: { id: req.params.id } }); if (!item) { res.status(404).json({ error: 'Not found' }); return; } res.json({ data: item }); } catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.kalendarzEvent.create({ data: { ...req.body, data: req.body.data ? new Date(req.body.data) : new Date() } });
    res.status(201).json({ data: item });
  } catch (error) { res.status(500).json({ error: 'Failed to create' }); }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.kalendarzEvent.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const item = await prisma.kalendarzEvent.update({ where: { id: req.params.id }, data: { ...req.body, data: req.body.data ? new Date(req.body.data) : existing.data } });
    res.json({ data: item });
  } catch (error) { res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.kalendarzEvent.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    await prisma.kalendarzEvent.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete' }); }
});

export default router;
