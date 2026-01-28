import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { logAudit } from '../utils/audit';

const router = Router();
const prisma = new PrismaClient();

// GET /api/patrole - Lista wszystkich patroli
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      sortBy = 'data',
      sortOrder = 'desc',
      search,
      dateFrom,
      dateTo,
      status,
      jednostka
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    // Filters
    if (search) {
      where.OR = [
        { nazwaJw: { contains: search as string, mode: 'insensitive' } },
        { miejsce: { contains: search as string, mode: 'insensitive' } },
        { trasa: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (dateFrom || dateTo) {
      where.data = {};
      if (dateFrom) where.data.gte = new Date(dateFrom as string);
      if (dateTo) where.data.lte = new Date(dateTo as string);
    }
    if (status) where.status = status;
    if (jednostka) where.nazwaJw = { contains: jednostka as string, mode: 'insensitive' };

    const [patrole, total] = await Promise.all([
      prisma.patrol.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.patrol.count({ where })
    ]);

    res.json({
      data: patrole,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get patrole error:', error);
    res.status(500).json({ error: 'Failed to fetch patrole' });
  }
});

// GET /api/patrole/:id - Pojedynczy patrol
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const patrol = await prisma.patrol.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    if (!patrol) {
      res.status(404).json({ error: 'Patrol not found' });
      return;
    }

    res.json({ data: patrol });
  } catch (error) {
    console.error('Get patrol error:', error);
    res.status(500).json({ error: 'Failed to fetch patrol' });
  }
});

// POST /api/patrole - Nowy patrol
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = {
      ...req.body,
      data: req.body.data ? new Date(req.body.data) : new Date(),
      createdBy: req.user!.id
    };

    const patrol = await prisma.patrol.create({ data });

    await logAudit(req, 'CREATE', 'patrole', patrol.id, null, patrol);

    res.status(201).json({ data: patrol, message: 'Patrol created successfully' });
  } catch (error) {
    console.error('Create patrol error:', error);
    res.status(500).json({ error: 'Failed to create patrol' });
  }
});

// PUT /api/patrole/:id - Aktualizacja patrolu
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.patrol.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Patrol not found' });
      return;
    }

    const data = {
      ...req.body,
      data: req.body.data ? new Date(req.body.data) : existing.data
    };

    const patrol = await prisma.patrol.update({
      where: { id: req.params.id },
      data
    });

    await logAudit(req, 'UPDATE', 'patrole', patrol.id, existing, patrol);

    res.json({ data: patrol, message: 'Patrol updated successfully' });
  } catch (error) {
    console.error('Update patrol error:', error);
    res.status(500).json({ error: 'Failed to update patrol' });
  }
});

// DELETE /api/patrole/:id - Usunięcie patrolu
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.patrol.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Patrol not found' });
      return;
    }

    await prisma.patrol.delete({ where: { id: req.params.id } });

    await logAudit(req, 'DELETE', 'patrole', req.params.id, existing, null);

    res.json({ message: 'Patrol deleted successfully' });
  } catch (error) {
    console.error('Delete patrol error:', error);
    res.status(500).json({ error: 'Failed to delete patrol' });
  }
});

// POST /api/patrole/bulk - Masowe operacje
router.post('/bulk', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { action, ids } = req.body;

    if (!action || !ids || !Array.isArray(ids)) {
      res.status(400).json({ error: 'Action and ids array are required' });
      return;
    }

    if (action === 'delete') {
      await prisma.patrol.deleteMany({ where: { id: { in: ids } } });
      res.json({ message: `${ids.length} patrols deleted successfully` });
    } else {
      res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

export default router;
