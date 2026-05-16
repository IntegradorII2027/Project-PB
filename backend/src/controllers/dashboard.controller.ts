import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /dashboard — resumen para el dueño (todas las sucursales)
export async function getDashboardDueno(req: Request, res: Response): Promise<void> {
  const duenoId = req.user!.userId;

  const sucursales = await prisma.sucursal.findMany({
    where: { duenoId },
    include: {
      _count: { select: { usuarios: true, mesas: true } },
    },
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const resumen = await Promise.all(
    sucursales.map(async (s) => {
      const [ventasHoy, pedidosHoy, mesasOcupadas] = await Promise.all([
        prisma.pedido.aggregate({
          where: { sucursalId: s.id, estado: 'PAGADO', creadoEn: { gte: hoy } },
          _sum: { total: true },
        }),
        prisma.pedido.count({ where: { sucursalId: s.id, creadoEn: { gte: hoy } } }),
        prisma.mesa.count({ where: { sucursalId: s.id, estado: { not: 'LIBRE' } } }),
      ]);
      return {
        ...s,
        ventasHoy: Number(ventasHoy._sum.total ?? 0),
        pedidosHoy,
        mesasOcupadas,
      };
    })
  );

  res.json({ sucursales: resumen });
}

// GET /dashboard/sucursal/:id — resumen para el admin de una sucursal
export async function getDashboardSucursal(req: Request, res: Response): Promise<void> {
  const sucursalId = req.user!.rol === 'DUENO' ? req.params.id : req.user!.sucursalId!;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [ventasHoy, pedidosHoy, mesasOcupadas, totalMesas, pedidosActivos] = await Promise.all([
    prisma.pedido.aggregate({
      where: { sucursalId, estado: 'PAGADO', creadoEn: { gte: hoy } },
      _sum: { total: true },
    }),
    prisma.pedido.count({ where: { sucursalId, creadoEn: { gte: hoy } } }),
    prisma.mesa.count({ where: { sucursalId, estado: { not: 'LIBRE' } } }),
    prisma.mesa.count({ where: { sucursalId } }),
    prisma.pedido.findMany({
      where: { sucursalId, estado: { notIn: ['PAGADO', 'CANCELADO'] } },
      orderBy: { creadoEn: 'desc' },
      take: 5,
      include: { mesa: { select: { numero: true } } },
    }),
  ]);

  res.json({
    ventasHoy: Number(ventasHoy._sum.total ?? 0),
    pedidosHoy,
    mesasOcupadas,
    totalMesas,
    pedidosActivos,
  });
}
