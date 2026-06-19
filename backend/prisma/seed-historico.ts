import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const METODOS_PAGO = ['EFECTIVO', 'EFECTIVO', 'EFECTIVO', 'YAPE', 'PLIN', 'TARJETA'];

// Distribución de pedidos por hora — pesos relativos
// Refleja: apertura lenta, pico almuerzo 12-2pm, baja tarde, pico cena 7-9pm
const HORAS = [
  { hora: 11, peso: 2  },
  { hora: 12, peso: 15 },
  { hora: 13, peso: 20 },
  { hora: 14, peso: 18 },
  { hora: 15, peso: 8  },
  { hora: 16, peso: 4  },
  { hora: 17, peso: 4  },
  { hora: 18, peso: 6  },
  { hora: 19, peso: 12 },
  { hora: 20, peso: 10 },
  { hora: 21, peso: 5  },
];

const TOTAL_PESO = HORAS.reduce((s, h) => s + h.peso, 0);

function horaAleatoria(): number {
  let rand = Math.random() * TOTAL_PESO;
  for (const h of HORAS) {
    rand -= h.peso;
    if (rand <= 0) return h.hora;
  }
  return 13;
}

// PAGADO en horario pico, CANCELADO en horario muerto, ENTREGADO al cierre
function estadoSegunHora(hora: number): string {
  if (hora >= 21) {
    const r = Math.random();
    if (r < 0.6) return 'PAGADO';
    if (r < 0.8) return 'ENTREGADO';
    return 'CANCELADO';
  }
  const r = Math.random();
  if (r < 0.75) return 'PAGADO';
  if (r < 0.88) return 'ENTREGADO';
  if (r < 0.95) return 'LISTO';
  return 'CANCELADO';
}

async function seedAsistencias(
  usuarios: { id: string; rol: string }[],
  sucursalId: string,
  fecha: Date,
) {
  const esFinde = [0, 6].includes(fecha.getDay());

  for (const u of usuarios) {
    if (!['MESERO', 'COCINERO'].includes(u.rol)) continue;

    // Ausencias: 8% entre semana, 5% finde
    const ausente = Math.random() < (esFinde ? 0.05 : 0.08);

    let presente = !ausente;
    let tardanza = false;
    let horaEntrada: Date | null = null;
    let horaSalida: Date | null = null;

    if (presente) {
      // Meseros entran 10am, cocineros 9am — con variación de ±40min
      const horaBase = u.rol === 'COCINERO' ? 9 : 10;
      const minutosDesvio = randomBetween(-10, 40);
      tardanza = minutosDesvio > 15;

      horaEntrada = new Date(fecha);
      horaEntrada.setHours(horaBase, Math.max(0, minutosDesvio), 0, 0);

      horaSalida = new Date(fecha);
      horaSalida.setHours(21, randomBetween(30, 59), 0, 0);
    }

    const fechaSolo = new Date(fecha);
    fechaSolo.setHours(0, 0, 0, 0);

    await prisma.asistencia.create({
      data: {
        id: randomUUID(),
        usuarioId: u.id,
        sucursalId,
        fecha: fechaSolo,
        presente,
        tardanza,
        horaEntrada,
        horaSalida,
        creadoEn: new Date(fecha),
        actualizadoEn: new Date(fecha),
      },
    });
  }
}

async function main() {
  // Verificar que el seed base ya fue ejecutado
  const meseroBase = await prisma.usuario.findFirst({
    where: { email: 'mesero@polleria.com' },
  });
  if (!meseroBase) {
    console.error('❌ Primero corre el seed base: npm run db:seed');
    process.exit(1);
  }

  // Buscar la primera sucursal disponible
  const sucursal = await prisma.sucursal.findFirst({
    where: { id: 'sucursal-1' },
  }) ?? await prisma.sucursal.findFirst();

  if (!sucursal) {
    console.error('❌ No se encontró ninguna sucursal');
    process.exit(1);
  }
  console.log(`📍 Usando sucursal: ${sucursal.nombre} (${sucursal.id})`);

  // Cargar productos disponibles dinámicamente desde la BD
  const productos = await prisma.producto.findMany({
    where: { sucursalId: sucursal.id, disponible: true },
    select: { id: true, precio: true, nombre: true },
  });

  if (productos.length === 0) {
    console.error('❌ No hay productos en la sucursal. Corre el seed base primero.');
    process.exit(1);
  }
  console.log(`🍗 ${productos.length} productos cargados`);

  // Cargar mesas
  const mesas = await prisma.mesa.findMany({
    where: { sucursalId: sucursal.id },
    select: { id: true },
  });

  if (mesas.length === 0) {
    console.error('❌ No hay mesas en la sucursal.');
    process.exit(1);
  }

  // Personal operativo (para asistencias y pedidos)
  const personalOperativo = await prisma.usuario.findMany({
    where: {
      sucursalId: sucursal.id,
      rol: { in: ['MESERO', 'COCINERO'] as any },
    },
    select: { id: true, rol: true },
  });

  const meseros = personalOperativo.filter(u => u.rol === 'MESERO');

  if (meseros.length === 0) {
    console.error('❌ No hay meseros en la sucursal.');
    process.exit(1);
  }

  const today = new Date();
  let totalPedidos = 0;
  let totalAsistencias = 0;

  console.log('\n🕐 Insertando 15 días de historial...\n');

  for (let daysAgo = 15; daysAgo >= 1; daysAgo--) {
    const fecha = new Date(today);
    fecha.setDate(today.getDate() - daysAgo);
    fecha.setHours(0, 0, 0, 0);

    const esFinde = [0, 6].includes(fecha.getDay());
    const cantidadPedidos = randomBetween(
      esFinde ? 50 : 20,
      esFinde ? 80 : 40,
    );

    // Asistencias
    await seedAsistencias(personalOperativo, sucursal.id, fecha);
    totalAsistencias += personalOperativo.length;

    // Pedidos
    for (let i = 0; i < cantidadPedidos; i++) {
      const hora = horaAleatoria();
      const minuto = randomBetween(0, 59);
      const creadoEn = new Date(fecha);
      creadoEn.setHours(hora, minuto, 0, 0);

      const esParaLlevar = Math.random() < 0.2;
      const tipo = esParaLlevar ? 'PARA_LLEVAR' : 'EN_MESA';
      const mesaId = esParaLlevar ? null : randomItem(mesas).id;
      const meseroAsignado = randomItem(meseros);

      const estado = estadoSegunHora(hora);
      const pagado = estado === 'PAGADO';
      const metodoPago = pagado ? randomItem(METODOS_PAGO) : null;

      const numItems = randomBetween(1, 5);
      const productosSeleccionados = [...productos]
        .sort(() => Math.random() - 0.5)
        .slice(0, numItems);

      const items = productosSeleccionados.map(p => {
        const cant = randomBetween(1, 3);
        const precio = Number(p.precio);
        return {
          id: randomUUID(),
          productoId: p.id,
          cantidad: cant,
          precio,
          subtotal: precio * cant,
          servido: ['ENTREGADO', 'PAGADO'].includes(estado),
          enviadoACocina: estado !== 'PENDIENTE',
        };
      });

      const total = items.reduce((acc, item) => acc + item.subtotal, 0);

      await prisma.pedido.create({
        data: {
          id: randomUUID(),
          tipo: tipo as any,
          estado: estado as any,
          mesaId,
          meseroId: meseroAsignado.id,
          sucursalId: sucursal.id,
          pagado,
          metodoPago,
          total,
          creadoEn,
          actualizadoEn: creadoEn,
          items: {
            create: items,
          },
        },
      });

      totalPedidos++;
    }

    const fechaStr = fecha.toLocaleDateString('es-PE', {
      weekday: 'short', day: '2-digit', month: '2-digit',
    });
    const tipo = esFinde ? '🔥 finde' : '📅 semana';
    console.log(
      `✅ ${fechaStr} ${tipo} — ${cantidadPedidos} pedidos, ${personalOperativo.length} asistencias`,
    );
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 HISTORIAL COMPLETADO
📦 Pedidos insertados  : ${totalPedidos}
📅 Asistencias creadas : ${totalAsistencias}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
