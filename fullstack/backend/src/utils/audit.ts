import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export async function logAudit(
  req: AuthRequest,
  action: AuditAction,
  modul: string,
  rekordId: string | null,
  przedZmiana: object | null,
  poZmianie: object | null
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        akcja: action,
        modul,
        rekordId,
        przedZmiana: przedZmiana ? JSON.parse(JSON.stringify(przedZmiana)) : null,
        poZmianie: poZmianie ? JSON.parse(JSON.stringify(poZmianie)) : null,
        ip: req.ip || req.socket.remoteAddress || null,
        userAgent: req.get('user-agent') || null
      }
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
