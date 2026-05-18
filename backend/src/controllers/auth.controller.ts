import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = '8h';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña requeridos' });
    return;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { sucursal: true },
  });

  if (!usuario) {
    res.status(401).json({ error: 'Credenciales incorrectas' });
    return;
  }

  const ok = await bcrypt.compare(password, usuario.passwordHash);

  if (!ok || !usuario.activo) {
    res.status(401).json({ error: 'Credenciales incorrectas' });
    return;
  }

  if (usuario.rol !== 'DUENO' && !usuario.sucursal?.abierto) {
    res.status(403).json({ error: 'La sucursal está cerrada' });
    return;
  }

  const token = jwt.sign(
    {
      userId: usuario.id,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.json({
    token,
    user: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
      sucursal: usuario.sucursal
        ? { id: usuario.sucursal.id, nombre: usuario.sucursal.nombre }
        : null,
    },
  });
}

export const me = async (req: Request, res: Response) => {};