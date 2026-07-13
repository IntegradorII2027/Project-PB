import { Request, Response } from 'express';
import {
  PrismaClient,
  EstadoPedido,
  Rol,
} from '@prisma/client';

const prisma = new PrismaClient();

export async function getPedidosAdmin(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as {
      userId: string;
      rol: Rol;
      sucursalId?: string;
    };

    const {
      busqueda,
      estado,
      sucursalId,
      page: pageQuery,
      limit: limitQuery,
    } = req.query as {
      busqueda?: string;
      estado?: string;
      sucursalId?: string;
      page?: string;
      limit?: string;
    };

    const pageParsed = Number(pageQuery ?? 1);
    const limitParsed = Number(limitQuery ?? 20);

    const page =
      Number.isInteger(pageParsed) && pageParsed > 0
        ? pageParsed
        : 1;

    const limit =
      Number.isInteger(limitParsed) && limitParsed > 0
        ? Math.min(limitParsed, 100)
        : 20;

    const where: any = {};

    if (user.rol === 'ADMIN') {
      where.sucursalId = user.sucursalId;
    }

    if (user.rol === 'DUENO') {
      if (!sucursalId) {
        res.status(400).json({
          error:
            'Sucursal requerida para consultar pedidos en vista administrador',
        });
        return;
      }

      const sucursalPermitida =
        await prisma.sucursal.findFirst({
          where: {
            id: sucursalId,
            duenoId: user.userId,
          },
          select: {
            id: true,
          },
        });

      if (!sucursalPermitida) {
        res.status(403).json({
          error: 'No tienes acceso a esta sucursal',
        });
        return;
      }

      where.sucursalId = sucursalId;
    }

    if (estado && estado !== 'TODOS') {
      where.estado = estado as EstadoPedido;
    }

    if (busqueda) {
      const numeroBusqueda = Number(busqueda);

      if (!Number.isNaN(numeroBusqueda)) {
        where.OR = [
          {
            numero: numeroBusqueda,
          },
          {
            mesa: {
              numero: numeroBusqueda,
            },
          },
        ];
      } else {
        where.id = '__sin_resultados__';
      }
    }

    const [total, pedidos] = await prisma.$transaction([
      prisma.pedido.count({
        where,
      }),

      prisma.pedido.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          numero: true,
          estado: true,
          creadoEn: true,
          actualizadoEn: true,
          total: true,

          mesa: {
            select: {
              numero: true,
            },
          },

          mesero: {
            select: {
              nombre: true,
            },
          },

          items: {
            select: {
              cantidad: true,
              precio: true,

              producto: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            actualizadoEn: 'desc',
          },
          {
            id: 'desc',
          },
        ],
      }),
    ]);

    const pedidosFormateados = pedidos.map((pedido) => ({
      id: pedido.numero,
      pedidoId: pedido.id,
      mesa: pedido.mesa?.numero ?? 0,
      estado: pedido.estado,
      usuario: pedido.mesero?.nombre ?? 'Sin usuario',
      creadoEn: pedido.creadoEn,
      actualizadoEn: pedido.actualizadoEn,

      productos: pedido.items.map((item) => ({
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio: Number(item.precio),
      })),

      total: Number(pedido.total ?? 0),
    }));

    const totalPages =
      total === 0 ? 0 : Math.ceil(total / limit);

    res.json({
      data: pedidosFormateados,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error obteniendo pedidos',
    });
  }
}