import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Catch-all para errores que escapen de los controladores.
 * Convierte errores de Prisma en respuestas HTTP útiles.
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Ya existe un registro con esos datos únicos' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(409).json({ error: 'No se puede eliminar: hay registros relacionados' });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ error: 'Datos inválidos para la operación' });
    return;
  }

  // Logging para debug en dev
  console.error('[Error no manejado]', err);

  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? undefined : err?.message,
  });
}
