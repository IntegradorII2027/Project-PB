import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calcularEstado(stockActual: number, stockMinimo: number): 'OK' | 'BAJO' | 'CRITICO' {
  if (stockActual < stockMinimo) return 'CRITICO';
  if (stockActual < stockMinimo * 1.5) return 'BAJO';
  return 'OK';
}

export async function getInventario(req: Request, res: Response): Promise<void> {
  const insumos = await prisma.insumo.findMany({
    where: { restauranteId: req.restauranteId! },
    orderBy: { nombre: 'asc' },
  });
  const result = insumos.map((i) => ({
    ...i,
    estado: calcularEstado(Number(i.stockActual), Number(i.stockMinimo)),
  }));
  res.json(result);
}

export async function getAlertas(req: Request, res: Response): Promise<void> {
  const insumos = await prisma.insumo.findMany({
    where: { restauranteId: req.restauranteId! },
  });
  const alertas = insumos
    .map((i) => ({ ...i, estado: calcularEstado(Number(i.stockActual), Number(i.stockMinimo)) }))
    .filter((i) => i.estado !== 'OK');
  res.json(alertas);
}

export async function createInsumo(req: Request, res: Response): Promise<void> {
  const { nombre, categoria, unidad, stockActual, stockMinimo, proveedor } = req.body;
  const insumo = await prisma.insumo.create({
    data: { nombre, categoria, unidad, stockActual, stockMinimo, proveedor, restauranteId: req.restauranteId! },
  });
  res.status(201).json({ ...insumo, estado: calcularEstado(Number(insumo.stockActual), Number(insumo.stockMinimo)) });
}

export async function updateInsumo(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nombre, categoria, unidad, stockActual, stockMinimo, proveedor } = req.body;
  const insumo = await prisma.insumo.update({
    where: { id, restauranteId: req.restauranteId! },
    data: { nombre, categoria, unidad, stockActual, stockMinimo, proveedor },
  });
  res.json({ ...insumo, estado: calcularEstado(Number(insumo.stockActual), Number(insumo.stockMinimo)) });
}

export async function deleteInsumo(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await prisma.insumo.delete({ where: { id, restauranteId: req.restauranteId! } });
  res.status(204).send();
}
