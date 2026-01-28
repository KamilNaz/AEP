import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth.routes';
import patroleRoutes from './routes/patrole.routes';
import wykroczeniaRoutes from './routes/wykroczenia.routes';
import wkrdRoutes from './routes/wkrd.routes';
import sankcjeRoutes from './routes/sankcje.routes';
import konwojeRoutes from './routes/konwoje.routes';
import spbRoutes from './routes/spb.routes';
import pilotazeRoutes from './routes/pilotaze.routes';
import zdarzeniaRoutes from './routes/zdarzenia.routes';
import kalendarzRoutes from './routes/kalendarz.routes';
import mapRoutes from './routes/map.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patrole', patroleRoutes);
app.use('/api/wykroczenia', wykroczeniaRoutes);
app.use('/api/wkrd', wkrdRoutes);
app.use('/api/sankcje', sankcjeRoutes);
app.use('/api/konwoje', konwojeRoutes);
app.use('/api/spb', spbRoutes);
app.use('/api/pilotaze', pilotazeRoutes);
app.use('/api/zdarzenia', zdarzeniaRoutes);
app.use('/api/kalendarz', kalendarzRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   AEP Backend Server                              ║
  ║   Arkusz Ewidencji Prewencyjnej                   ║
  ║                                                   ║
  ║   Server running on: http://localhost:${PORT}       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                       ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

export { prisma };
