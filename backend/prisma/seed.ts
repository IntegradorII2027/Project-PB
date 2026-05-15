import { PrismaClient, Rol, EstadoMesa } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const restaurante = await prisma.restaurante.upsert({
    where: { id: 'restaurante-huaca-1' },
    update: {},
    create: {
      id: 'restaurante-huaca-1',
      nombre: 'La Huaca Bistró',
      direccion: 'Av. La Mar 123, Miraflores, Lima',
      telefono: '01-445-6789',
      timerMesa: 45,
    },
  });

  console.log('✅ Restaurante creado:', restaurante.nombre);

  const usuarios = [
    { nombre: 'Carla Mendoza', email: 'carla@huacabistro.com', password: 'Admin123!', rol: Rol.ADMIN },
    { nombre: 'Luis Quispe', email: 'luis@huacabistro.com', password: 'Mesero123!', rol: Rol.MESERO },
    { nombre: 'Roberto Ccari', email: 'roberto@huacabistro.com', password: 'Cocina123!', rol: Rol.COCINERO },
    { nombre: 'Andrea Flores', email: 'andrea@huacabistro.com', password: 'Caja123!', rol: Rol.CAJERO },
  ];

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombre: u.nombre,
        email: u.email,
        passwordHash: hash,
        rol: u.rol,
        restauranteId: restaurante.id,
      },
    });
    console.log(`✅ Usuario: ${u.nombre} (${u.rol})`);
  }

  for (let i = 1; i <= 12; i++) {
    await prisma.mesa.upsert({
      where: { id: `mesa-${i}` },
      update: {},
      create: {
        id: `mesa-${i}`,
        numero: i,
        capacidad: 4,
        estado: EstadoMesa.LIBRE,
        restauranteId: restaurante.id,
      },
    });
  }
  console.log('✅ 12 mesas creadas');

  const categorias = ['Entradas', 'Platos de fondo', 'Bebidas', 'Postres'];
  const catMap: Record<string, string> = {};

  for (const nombre of categorias) {
    const id = `cat-${nombre.toLowerCase().replace(/ /g, '-')}`;
    const cat = await prisma.categoria.upsert({
      where: { id },
      update: {},
      create: { id, nombre, restauranteId: restaurante.id },
    });
    catMap[nombre] = cat.id;
  }
  console.log('✅ Categorías creadas');

  const productos = [
    { nombre: 'Ceviche Mixto', cat: 'Entradas', precio: 28.0 },
    { nombre: 'Lomo Saltado', cat: 'Platos de fondo', precio: 32.0 },
    { nombre: 'Ají de Gallina', cat: 'Platos de fondo', precio: 25.0 },
    { nombre: 'Arroz con Leche', cat: 'Postres', precio: 10.0 },
    { nombre: 'Chicha Morada', cat: 'Bebidas', precio: 8.0 },
    { nombre: 'Inca Kola', cat: 'Bebidas', precio: 7.0 },
  ];

  for (const p of productos) {
    const id = `prod-${p.nombre.toLowerCase().replace(/ /g, '-')}`;
    await prisma.producto.upsert({
      where: { id },
      update: {},
      create: {
        id,
        nombre: p.nombre,
        precio: p.precio,
        disponible: true,
        categoriaId: catMap[p.cat],
        restauranteId: restaurante.id,
      },
    });
  }
  console.log('✅ Productos creados');

  const insumos = [
    { nombre: 'Filete de res', categoria: 'Carnes', unidad: 'kg', stockActual: 12.5, stockMinimo: 5 },
    { nombre: 'Limones', categoria: 'Verduras', unidad: 'kg', stockActual: 2, stockMinimo: 5 },
    { nombre: 'Ají Amarillo', categoria: 'Especias', unidad: 'kg', stockActual: 0.8, stockMinimo: 2 },
    { nombre: 'Papa blanca', categoria: 'Verduras', unidad: 'kg', stockActual: 8, stockMinimo: 5 },
    { nombre: 'Aceite Vegetal', categoria: 'Aceites', unidad: 'L', stockActual: 1.5, stockMinimo: 4 },
  ];

  for (const ins of insumos) {
    const id = `insumo-${ins.nombre.toLowerCase().replace(/ /g, '-')}`;
    await prisma.insumo.upsert({
      where: { id },
      update: {},
      create: {
        id,
        ...ins,
        restauranteId: restaurante.id,
      },
    });
  }
  console.log('✅ Insumos creados');

  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
