import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function getUsuarios(req: Request, res: Response): Promise<void> {
  const usuarios = await prisma.usuario.findMany({
    where: { restauranteId: req.restauranteId! },
    select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true },
    orderBy: { nombre: 'asc' },
  });
  res.json(usuarios);
}

export async function createUsuario(req: Request, res: Response): Promise<void> {
  const { nombre, email, password, rol } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, email, passwordHash: hash, rol, restauranteId: req.restauranteId! },
    select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true },
  });
  res.status(201).json(usuario);
}

export async function updateUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nombre, email, password, rol, activo } = req.body;
  const data: any = { nombre, email, rol, activo };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.update({
    where: { id, restauranteId: req.restauranteId! },
    data,
    select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true },
  });
  res.json(usuario);
}

export async function getPerfil(req: Request, res: Response): Promise<void> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true,
      restaurante: { select: { nombre: true } } },
  });
  res.json(usuario);
}

export async function updatePerfil(req: Request, res: Response): Promise<void> {
  const { nombre, email } = req.body;
  const usuario = await prisma.usuario.update({
    where: { id: req.user!.userId },
    data: { nombre, email },
    select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true },
  });
  res.json(usuario);
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { passwordActual, passwordNuevo } = req.body;
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user!.userId } });
  if (!usuario) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

  const valido = await bcrypt.compare(passwordActual, usuario.passwordHash);
  if (!valido) { res.status(400).json({ error: 'Contraseña actual incorrecta' }); return; }

  await prisma.usuario.update({
    where: { id: req.user!.userId },
    data: { passwordHash: await bcrypt.hash(passwordNuevo, 10) },
  });
  res.json({ ok: true });
}

export async function deleteUsuario(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await prisma.usuario.update({
    where: { id, restauranteId: req.restauranteId! },
    data: { activo: false },
  });
  res.status(204).send();
}

export async function getRestaurante(req: Request, res: Response): Promise<void> {
  const restaurante = await prisma.restaurante.findUnique({
    where: { id: req.restauranteId! },
  });
  res.json(restaurante);
}

export async function updateRestaurante(req: Request, res: Response): Promise<void> {
  const { nombre, direccion, telefono, timerMesa } = req.body;
  const restaurante = await prisma.restaurante.update({
    where: { id: req.restauranteId! },
    data: { nombre, direccion, telefono, timerMesa },
  });
  res.json(restaurante);
}

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  // Inicio del día en hora local del servidor.
  // setHours(0,0,0,0) muta el Date — usamos un new Date() fresco.
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);

  const [ventasHoy, pedidosHoy, mesasOcupadas, totalMesas, alertas] = await Promise.all([
    prisma.pedido.aggregate({
      where: { restauranteId: req.restauranteId!, estado: { in: ['ENTREGADO', 'PAGADO'] }, creadoEn: { gte: inicio } },
      _sum: { total: true },
    }),
    prisma.pedido.count({
      where: { restauranteId: req.restauranteId!, estado: { in: ['LISTO', 'ENTREGADO', 'PAGADO'] }, creadoEn: { gte: inicio } },
    }),
    prisma.mesa.count({
      where: { restauranteId: req.restauranteId!, estado: 'OCUPADA' },
    }),
    prisma.mesa.count({ where: { restauranteId: req.restauranteId! } }),
    prisma.insumo.findMany({ where: { restauranteId: req.restauranteId! } }),
  ]);

  const alertasCount = alertas.filter((i) => {
    const stock = Number(i.stockActual);
    const min = Number(i.stockMinimo);
    return stock < min * 1.5;
  }).length;

  const pedidosRecientes = await prisma.pedido.findMany({
    where: { restauranteId: req.restauranteId! },
    orderBy: { creadoEn: 'desc' },
    take: 5,
    include: {
      mesa: { select: { numero: true } },
      items: { include: { producto: { select: { nombre: true } } } },
    },
  });

  const alertasDetalle = alertas
    .map((i) => {
      const stock = Number(i.stockActual);
      const min = Number(i.stockMinimo);
      let estado: 'CRITICO' | 'BAJO' | 'OK' = 'OK';
      if (stock < min) estado = 'CRITICO';
      else if (stock < min * 1.5) estado = 'BAJO';
      return { ...i, estado };
    })
    .filter((i) => i.estado !== 'OK');

  res.json({
    ventasHoy: Number(ventasHoy._sum.total ?? 0),
    pedidosHoy,
    mesasOcupadas,
    totalMesas,
    alertasCount,
    pedidosRecientes,
    alertasDetalle,
  });
}
