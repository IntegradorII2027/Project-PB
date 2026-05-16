import { PrismaClient, Rol, EstadoMesa } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando base de datos...');
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.mesa.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.sucursal.deleteMany();
  await prisma.dueno.deleteMany();
  console.log('✅ BD limpia\n');

  // ── Dueño ──────────────────────────────────────────────────────────────
  const dueno = await prisma.dueno.create({
    data: {
      id: 'dueno-1',
      nombre: 'Propietario',
      email: 'dueno@polleria.com',
      passwordHash: await bcrypt.hash('Dueno123!', 10),
    },
  });
  console.log(`✅ Dueño: ${dueno.email} / Dueno123!`);

  // ── Sucursal demo ──────────────────────────────────────────────────────
  const sucursal = await prisma.sucursal.create({
    data: {
      id: 'sucursal-1',
      nombre: 'Pollería El Gallo de Oro - Centro',
      direccion: 'Av. Principal 456',
      telefono: '01-234-5678',
      abierto: true,
      horarioApertura: '08:00',
      horarioCierre: '22:00',
      diasOperacion: 'LUN-DOM',
      duenoId: dueno.id,
    },
  });
  console.log(`✅ Sucursal: ${sucursal.nombre}`);

  // ── Usuarios ────────────────────────────────────────────────────────────
  const usuarios = [
    { nombre: 'Administrador', email: 'admin@polleria.com',  password: 'Admin123!',  rol: Rol.ADMIN },
    { nombre: 'Carlos Mesero', email: 'mesero@polleria.com', password: 'Mesero123!', rol: Rol.MESERO },
    { nombre: 'Juan Cocinero', email: 'cocina@polleria.com', password: 'Cocina123!', rol: Rol.COCINERO },
  ];

  for (const u of usuarios) {
    await prisma.usuario.create({
      data: {
        nombre: u.nombre,
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        rol: u.rol,
        sucursalId: sucursal.id,
      },
    });
    console.log(`   👤 ${u.email} / ${u.password} (${u.rol})`);
  }

  // ── Mesas ────────────────────────────────────────────────────────────────
  const caps = [2, 2, 4, 4, 4, 4, 4, 4, 6, 6, 6, 8];
  for (let i = 1; i <= 12; i++) {
    await prisma.mesa.create({
      data: { id: `mesa-${i}`, numero: i, capacidad: caps[i - 1], estado: EstadoMesa.LIBRE, sucursalId: sucursal.id },
    });
  }
  console.log('✅ 12 mesas creadas');

  // ── Categorías ───────────────────────────────────────────────────────────
  const cats = [
    { id: 'cat-pollos',  nombre: 'Pollos a la Brasa' },
    { id: 'cat-combos',  nombre: 'Combos' },
    { id: 'cat-acomp',   nombre: 'Acompañamientos' },
    { id: 'cat-bebidas', nombre: 'Bebidas' },
    { id: 'cat-extras',  nombre: 'Extras y Salsas' },
  ];
  for (const c of cats) {
    await prisma.categoria.create({ data: { ...c, sucursalId: sucursal.id } });
  }
  console.log('✅ 5 categorías creadas');

  // ── Productos ────────────────────────────────────────────────────────────
  const productos = [
    { id: 'p-entero',   nombre: 'Pollo entero',       precio: 55, cat: 'cat-pollos',  cocina: true },
    { id: 'p-medio',    nombre: 'Medio pollo',         precio: 29, cat: 'cat-pollos',  cocina: true },
    { id: 'p-cuarto',   nombre: '1/4 de pollo',        precio: 16, cat: 'cat-pollos',  cocina: true },
    { id: 'p-octavo',   nombre: '1/8 de pollo',        precio: 10, cat: 'cat-pollos',  cocina: true },
    { id: 'p-cpersonal',nombre: 'Combo Personal',      precio: 22, cat: 'cat-combos',  cocina: true },
    { id: 'p-cduo',     nombre: 'Combo Dúo',           precio: 42, cat: 'cat-combos',  cocina: true },
    { id: 'p-cfamiliar',nombre: 'Combo Familiar',      precio: 65, cat: 'cat-combos',  cocina: true },
    { id: 'p-papas',    nombre: 'Papas fritas',        precio: 8,  cat: 'cat-acomp',   cocina: true },
    { id: 'p-yuca',     nombre: 'Yuca frita',          precio: 8,  cat: 'cat-acomp',   cocina: true },
    { id: 'p-ensalada', nombre: 'Ensalada',            precio: 5,  cat: 'cat-acomp',   cocina: true },
    { id: 'p-inca-p',   nombre: 'Inca Kola personal',  precio: 5,  cat: 'cat-bebidas', cocina: false },
    { id: 'p-inca-g',   nombre: 'Inca Kola 1.5L',      precio: 10, cat: 'cat-bebidas', cocina: false },
    { id: 'p-chicha',   nombre: 'Chicha morada',       precio: 6,  cat: 'cat-bebidas', cocina: false },
    { id: 'p-agua',     nombre: 'Agua San Luis',       precio: 3,  cat: 'cat-bebidas', cocina: false },
    { id: 'p-aji',      nombre: 'Ají verde',           precio: 2,  cat: 'cat-extras',  cocina: false },
    { id: 'p-criolla',  nombre: 'Salsa criolla',       precio: 2,  cat: 'cat-extras',  cocina: false },
  ];

  for (const p of productos) {
    await prisma.producto.create({
      data: {
        id: p.id, nombre: p.nombre, precio: p.precio,
        disponible: true, requiereCocina: p.cocina,
        categoriaId: p.cat, sucursalId: sucursal.id,
      },
    });
  }
  console.log(`✅ ${productos.length} productos creados`);

  console.log('\n🎉 Seed completado!\n');
  console.log('ACCESOS:');
  console.log('  Dueño:    dueno@polleria.com   / Dueno123!');
  console.log('  Admin:    admin@polleria.com   / Admin123!');
  console.log('  Mesero:   mesero@polleria.com  / Mesero123!');
  console.log('  Cocinero: cocina@polleria.com  / Cocina123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
