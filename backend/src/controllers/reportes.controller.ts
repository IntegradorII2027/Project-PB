import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getPeriodRange(periodo: string): { gte: Date; lte: Date } {
  const now = new Date();
  const lte = new Date(now);
  let gte: Date;

  if (periodo === 'hoy') {
    gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (periodo === 'semana') {
    gte = new Date(now);
    gte.setDate(gte.getDate() - 6);
    gte.setHours(0, 0, 0, 0);
  } else {
    gte = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return { gte, lte };
}

export async function getVentas(req: Request, res: Response): Promise<void> {
  const periodo = (req.query.periodo as string) || 'semana';
  const range = getPeriodRange(periodo);

  const pedidos = await prisma.pedido.findMany({
    where: {
      restauranteId: req.restauranteId!,
      estado: 'PAGADO',
      creadoEn: range,
    },
  });

  const totalVentas = pedidos.reduce((s, p) => s + Number(p.total ?? 0), 0);
  const totalPedidos = pedidos.length;

  const byDay: Record<string, number> = {};
  for (const p of pedidos) {
    const day = p.creadoEn.toISOString().split('T')[0];
    byDay[day] = (byDay[day] ?? 0) + Number(p.total ?? 0);
  }

  const chartData = Object.entries(byDay).map(([fecha, ventas]) => ({ fecha, ventas }));
  chartData.sort((a, b) => a.fecha.localeCompare(b.fecha));

  res.json({ totalVentas, totalPedidos, chartData, periodo });
}

export async function getTopProductos(req: Request, res: Response): Promise<void> {
  const range = getPeriodRange('mes');

  const items = await prisma.itemPedido.findMany({
    where: {
      pedido: {
        restauranteId: req.restauranteId!,
        estado: 'PAGADO',
        creadoEn: range,
      },
    },
    include: { producto: { select: { nombre: true } } },
  });

  const byProducto: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {};
  for (const item of items) {
    const key = item.productoId;
    if (!byProducto[key]) byProducto[key] = { nombre: item.producto.nombre, cantidad: 0, ingresos: 0 };
    byProducto[key].cantidad += item.cantidad;
    byProducto[key].ingresos += Number(item.subtotal);
  }

  const totalIngresos = Object.values(byProducto).reduce((s, p) => s + p.ingresos, 0);
  const result = Object.values(byProducto)
    .map((p) => ({ ...p, porcentaje: totalIngresos ? Math.round((p.ingresos / totalIngresos) * 100) : 0 }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  res.json(result);
}

export async function getProductividad(req: Request, res: Response): Promise<void> {
  const range = getPeriodRange('semana');

  const pedidos = await prisma.pedido.findMany({
    where: {
      restauranteId: req.restauranteId!,
      estado: { in: ['LISTO', 'ENTREGADO', 'PAGADO'] },
      tiempoInicio: { not: null },
      tiempoListo: { not: null },
      creadoEn: range,
    },
    include: { mesero: { select: { nombre: true } } },
  });

  const byMesero: Record<string, { nombre: string; pedidos: number; tiempoTotal: number }> = {};
  for (const p of pedidos) {
    if (!p.mesero) continue;
    const key = p.meseroId!;
    if (!byMesero[key]) byMesero[key] = { nombre: p.mesero.nombre, pedidos: 0, tiempoTotal: 0 };
    byMesero[key].pedidos++;
    if (p.tiempoInicio && p.tiempoListo) {
      byMesero[key].tiempoTotal += (new Date(p.tiempoListo).getTime() - new Date(p.tiempoInicio).getTime()) / 60000;
    }
  }

  const result = Object.values(byMesero).map((m) => ({
    nombre: m.nombre,
    pedidos: m.pedidos,
    tiempoPromedio: m.pedidos ? Math.round(m.tiempoTotal / m.pedidos) : 0,
  }));

  res.json(result);
}
