import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { logAudit } from '../utils/audit';

const router = Router();
const prisma = new PrismaClient();

// GET /api/wykroczenia
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', sortBy = 'data', sortOrder = 'desc', search, dateFrom, dateTo, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (search) {
      where.OR = [
        { sprawca: { contains: search as string, mode: 'insensitive' } },
        { miejsce: { contains: search as string, mode: 'insensitive' } },
        { rodzaj: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (dateFrom || dateTo) {
      where.data = {};
      if (dateFrom) where.data.gte = new Date(dateFrom as string);
      if (dateTo) where.data.lte = new Date(dateTo as string);
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.wykroczenie.findMany({ where, skip, take, orderBy: { [sortBy as string]: sortOrder } }),
      prisma.wykroczenie.count({ where })
    ]);

    res.json({ data, pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) } });
  } catch (error) {
    console.error('Get wykroczenia error:', error);
    res.status(500).json({ error: 'Failed to fetch wykroczenia' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.wykroczenie.findUnique({ where: { id: req.params.id } });
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, data: req.body.data ? new Date(req.body.data) : new Date(), createdBy: req.user!.id };
    const item = await prisma.wykroczenie.create({ data });
    await logAudit(req, 'CREATE', 'wykroczenia', item.id, null, item);
    res.status(201).json({ data: item });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.wykroczenie.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const data = { ...req.body, data: req.body.data ? new Date(req.body.data) : existing.data };
    const item = await prisma.wykroczenie.update({ where: { id: req.params.id }, data });
    await logAudit(req, 'UPDATE', 'wykroczenia', item.id, existing, item);
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.wykroczenie.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    await prisma.wykroczenie.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'wykroczenia', req.params.id, existing, null);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

export default router;
