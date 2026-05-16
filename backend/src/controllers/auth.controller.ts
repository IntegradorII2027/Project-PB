import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = '8h';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: 'Email y contraseña requeridos' }); return; }

  // 1. Buscar primero como Dueño
  const dueno = await prisma.dueno.findUnique({ where: { email } });
  if (dueno) {
    const ok = await bcrypt.compare(password, dueno.passwordHash);
    if (!ok || !dueno.activo) { res.status(401).json({ error: 'Credenciales incorrectas' }); return; }

    const token = jwt.sign({ userId: dueno.id, rol: 'DUENO' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({
      token,
      user: { id: dueno.id, nombre: dueno.nombre, email: dueno.email, rol: 'DUENO' },
    });
    return;
  }

  // 2. Buscar como Usuario de sucursal
  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { sucursal: true },
  });

  if (!usuario) { res.status(401).json({ error: 'Credenciales incorrectas' }); return; }
  if (!usuario.activo) { res.status(403).json({ error: 'Usuario desactivado' }); return; }

  const ok = await bcrypt.compare(password, usuario.passwordHash);
  if (!ok) { res.status(401).json({ error: 'Credenciales incorrectas' }); return; }

  // Verificar que la sucursal esté abierta
  if (!usuario.sucursal.abierto) {
    res.status(403).json({ error: 'La sucursal está cerrada. Contacta al administrador.' });
    return;
  }

  const token = jwt.sign(
    { userId: usuario.id, rol: usuario.rol, sucursalId: usuario.sucursalId },
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
      sucursal: { id: usuario.sucursal.id, nombre: usuario.sucursal.nombre },
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const { userId, rol } = req.user!;

  if (rol === 'DUENO') {
    const dueno = await prisma.dueno.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, email: true, activo: true },
    });
    if (!dueno) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    res.json({ ...dueno, rol: 'DUENO' });
    return;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true, nombre: true, email: true, rol: true, activo: true, sucursalId: true,
      sucursal: { select: { id: true, nombre: true } },
    },
  });
  if (!usuario) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
  res.json(usuario);
}
