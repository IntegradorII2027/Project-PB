import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProductos(req: Request, res: Response): Promise<void> {
  const productos = await prisma.producto.findMany({
    where: { restauranteId: req.restauranteId! },
    include: { categoria: true },
    orderBy: { nombre: 'asc' },
  });
  res.json(productos);
}

export async function createProducto(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, precio, imagen, disponible, categoriaId } = req.body;
  const producto = await prisma.producto.create({
    data: { nombre, descripcion, precio, imagen, disponible: disponible ?? true, categoriaId, restauranteId: req.restauranteId! },
    include: { categoria: true },
  });
  res.status(201).json(producto);
}

export async function updateProducto(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nombre, descripcion, precio, imagen, disponible, categoriaId } = req.body;
  const producto = await prisma.producto.update({
    where: { id, restauranteId: req.restauranteId! },
    data: { nombre, descripcion, precio, imagen, disponible, categoriaId },
    include: { categoria: true },
  });
  res.json(producto);
}

export async function deleteProducto(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await prisma.producto.delete({ where: { id, restauranteId: req.restauranteId! } });
  res.status(204).send();
}

export async function getCategorias(req: Request, res: Response): Promise<void> {
  const categorias = await prisma.categoria.findMany({
    where: { restauranteId: req.restauranteId! },
    orderBy: { nombre: 'asc' },
  });
  res.json(categorias);
}

export async function createCategoria(req: Request, res: Response): Promise<void> {
  const { nombre } = req.body;
  const categoria = await prisma.categoria.create({
    data: { nombre, restauranteId: req.restauranteId! },
  });
  res.status(201).json(categoria);
}
