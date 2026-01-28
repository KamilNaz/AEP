import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats - Statystyki ogólne
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.data = {};
      if (dateFrom) dateFilter.data.gte = new Date(dateFrom as string);
      if (dateTo) dateFilter.data.lte = new Date(dateTo as string);
    }

    const [
      patroleCount,
      wykroczeniaCount,
      wkrdCount,
      sankcjeCount,
      konwojeCount,
      spbCount,
      pilotazeCount,
      zdarzeniaCount
    ] = await Promise.all([
      prisma.patrol.count({ where: dateFilter }),
      prisma.wykroczenie.count({ where: dateFilter }),
      prisma.wKRD.count({ where: dateFilter }),
      prisma.sankcja.count({ where: dateFilter }),
      prisma.konwoj.count({ where: dateFilter }),
      prisma.sPB.count({ where: dateFilter }),
      prisma.pilotaz.count({ where: dateFilter }),
      prisma.zdarzenie.count({ where: dateFilter })
    ]);

    res.json({
      data: {
        patrole: patroleCount,
        wykroczenia: wykroczeniaCount,
        wkrd: wkrdCount,
        sankcje: sankcjeCount,
        konwoje: konwojeCount,
        spb: spbCount,
        pilotaze: pilotazeCount,
        zdarzenia: zdarzeniaCount,
        total: patroleCount + wykroczeniaCount + wkrdCount + sankcjeCount + konwojeCount + spbCount + pilotazeCount + zdarzeniaCount
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/dashboard/recent - Ostatnie aktywności
router.get('/recent', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const [recentPatrole, recentWykroczenia, recentZdarzenia] = await Promise.all([
      prisma.patrol.findMany({ take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, data: true, nazwaJw: true, miejsce: true, createdAt: true } }),
      prisma.wykroczenie.findMany({ take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, data: true, rodzaj: true, miejsce: true, createdAt: true } }),
      prisma.zdarzenie.findMany({ take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, data: true, rodzajZdarzenia: true, miejsce: true, createdAt: true } })
    ]);

    res.json({
      data: {
        patrole: recentPatrole,
        wykroczenia: recentWykroczenia,
        zdarzenia: recentZdarzenia
      }
    });
  } catch (error) {
    console.error('Dashboard recent error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

// GET /api/dashboard/charts - Dane do wykresów
router.get('/charts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Grupowanie po dniach dla patroli
    const patroleByDay = await prisma.patrol.groupBy({
      by: ['data'],
      where: { data: { gte: startDate } },
      _count: { id: true },
      orderBy: { data: 'asc' }
    });

    // Grupowanie po rodzaju dla wykroczeń
    const wykroczeniaByType = await prisma.wykroczenie.groupBy({
      by: ['rodzaj'],
      where: { data: { gte: startDate } },
      _count: { id: true }
    });

    // Grupowanie po statusie
    const statusDistribution = await prisma.patrol.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json({
      data: {
        patroleByDay: patroleByDay.map(p => ({ date: p.data, count: p._count.id })),
        wykroczeniaByType: wykroczeniaByType.map(w => ({ type: w.rodzaj || 'Nieznany', count: w._count.id })),
        statusDistribution: statusDistribution.map(s => ({ status: s.status || 'Brak', count: s._count.id }))
      }
    });
  } catch (error) {
    console.error('Dashboard charts error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

export default router;
