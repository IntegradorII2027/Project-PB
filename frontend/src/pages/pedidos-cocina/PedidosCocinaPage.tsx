import { Clock3, CheckCircle2, ChefHat } from 'lucide-react';

const pedidos = [
  {
    id: 1,
    mesa: 'Mesa 5',
    cliente: 'Juan Pérez',
    tiempo: '10 min',
    estado: 'Pendiente',
    platos: ['Lomo Saltado x2', 'Chicha Morada'],
  },
  {
    id: 2,
    mesa: 'Mesa 2',
    cliente: 'María López',
    tiempo: '5 min',
    estado: 'En preparación',
    platos: ['Hamburguesa BBQ', 'Papas fritas'],
  },
  {
    id: 3,
    mesa: 'Mesa 8',
    cliente: 'Carlos Ruiz',
    tiempo: '15 min',
    estado: 'Pendiente',
    platos: ['Pizza Familiar', 'Inca Kola'],
  },
];

export default function PedidosCocinaPage() {
  const marcarListo = (id: number) => {
    alert(`Pedido ${id} listo`);
  };

  return (
    <div className="p-6 bg-background min-h-screen">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <ChefHat className="text-primary" size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text">
            Pedidos de Cocina
          </h1>
          <p className="text-text-muted text-sm">
            Gestiona los pedidos pendientes y en preparación
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-white border border-border rounded-2xl shadow-sm p-5 flex flex-col gap-4"
          >

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-text">
                  {pedido.mesa}
                </h2>

                <p className="text-sm text-text-muted">
                  Cliente: {pedido.cliente}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold
                ${
                  pedido.estado === 'Pendiente'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {pedido.estado}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Clock3 size={16} />
              <span>Hace {pedido.tiempo}</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-text mb-2">
                Platos solicitados
              </p>

              <div className="space-y-2">
                {pedido.platos.map((plato, index) => (
                  <div
                    key={index}
                    className="bg-background rounded-lg px-3 py-2 text-sm"
                  >
                    {plato}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => marcarListo(pedido.id)}
              className="mt-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-colors"
            >
              <CheckCircle2 size={18} />
              Pedido listo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}