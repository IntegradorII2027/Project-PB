const plan = {
  etiqueta: 'K6_VOLUMEN_V1',
  semilla: 20260713,
  periodo: {
    desde: '2026-01-01',
    hasta: '2026-06-30',
  },
  infraestructura: {
    sucursales: 3,
    meserosPorSucursal: 5,
    mesasPorSucursal: 12,
    categoriasPorSucursal: 5,
    productosPorSucursal: 16,
  },
  pedidos: {
    total: 10000,
    porSucursal: [6000, 2500, 1500],
    estados: {
      PAGADO: 9200,
      CANCELADO: 750,
      ACTIVOS: 50,
    },
    metodosPago: {
      Efectivo: 3680,
      Yape: 2300,
      Tarjeta: 1840,
      Plin: 1380,
    },
    itemsEstimados: {
      minimo: 30000,
      maximo: 40000,
      promedioPorPedido: 3.5,
    },
  },
};

const sumaSucursales = plan.pedidos.porSucursal.reduce(
  (total, cantidad) => total + cantidad,
  0
);

const sumaEstados =
  plan.pedidos.estados.PAGADO +
  plan.pedidos.estados.CANCELADO +
  plan.pedidos.estados.ACTIVOS;

const sumaMetodos = Object.values(
  plan.pedidos.metodosPago
).reduce((total, cantidad) => total + cantidad, 0);

if (sumaSucursales !== plan.pedidos.total) {
  throw new Error('La distribución por sucursal no suma 10000.');
}

if (sumaEstados !== plan.pedidos.total) {
  throw new Error('La distribución por estado no suma 10000.');
}

if (sumaMetodos !== plan.pedidos.estados.PAGADO) {
  throw new Error(
    'Los métodos de pago no coinciden con los pedidos pagados.'
  );
}

console.log('');
console.log('=== PREVIEW DATASET RESTAURANTOS ===');
console.log('');
console.log(JSON.stringify(plan, null, 2));
console.log('');
console.log('VALIDACIONES: OK');
console.log('CONEXION A BD: NO');
console.log('REGISTROS MODIFICADOS: 0');
