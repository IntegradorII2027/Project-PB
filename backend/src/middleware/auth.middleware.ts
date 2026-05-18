import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;

        const user = await prisma.usuario.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                rol: true,
                sucursalId: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuario no existe' });
        }

        req.user = {
            userId: user.id,
            rol: user.rol,
            sucursalId: user.sucursalId,
        };

        next();

    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
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
