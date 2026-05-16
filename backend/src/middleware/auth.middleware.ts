import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'Token requerido' }); return; }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { userId: payload.userId, rol: payload.rol, sucursalId: payload.sucursalId };

    // El dueño siempre pasa
    if (payload.rol === 'DUENO') { next(); return; }

    // Para el resto, verificar que la sucursal esté abierta
    const sucursal = await prisma.sucursal.findUnique({ where: { id: payload.sucursalId } });
    if (!sucursal) { res.status(404).json({ error: 'Sucursal no encontrada' }); return; }
    if (!sucursal.abierto) { res.status(403).json({ error: 'La sucursal está cerrada' }); return; }

    req.sucursalId = payload.sucursalId;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function roleMiddleware(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Sin permisos para esta acción' });
      return;
    }
    next();
  };
}
