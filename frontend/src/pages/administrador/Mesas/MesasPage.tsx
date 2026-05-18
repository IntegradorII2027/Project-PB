import { useState } from 'react';
import { Plus, Pencil, Users, X, } from 'lucide-react';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'LIBRE' | 'OCUPADA';
}

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([
    {
      id: 1,
      numero: 1,
      capacidad: 4,
      estado: 'LIBRE',
    },
    {
      id: 2,
      numero: 2,
      capacidad: 6,
      estado: 'OCUPADA',
    },
    {
      id: 3,
      numero: 3,
      capacidad: 2,
      estado: 'LIBRE',
    },
    {
      id: 4,
      numero: 4,
      capacidad: 8,
      estado: 'OCUPADA',
    },
  ]);

  const [modalNuevaMesa, setModalNuevaMesa] =
    useState(false);

  const [modalEditarMesa, setModalEditarMesa] =
    useState(false);

  const [mesaEditando, setMesaEditando] =
    useState<Mesa | null>(null);

  const [nuevaMesa, setNuevaMesa] = useState({
    numero: '',
    capacidad: '',
  });

  const mesasLibres = mesas.filter(
    (mesa) => mesa.estado === 'LIBRE'
  ).length;

  const mesasOcupadas = mesas.filter(
    (mesa) => mesa.estado === 'OCUPADA'
  ).length;

  const crearMesa = () => {
    if (
      !nuevaMesa.numero ||
      !nuevaMesa.capacidad
    ) {
      return;
    }

    const mesa: Mesa = {
      id: Date.now(),
      numero: Number(nuevaMesa.numero),
      capacidad: Number(nuevaMesa.capacidad),
      estado: 'LIBRE',
    };

    setMesas([...mesas, mesa]);

    setNuevaMesa({
      numero: '',
      capacidad: '',
    });

    setModalNuevaMesa(false);
  };

  const actualizarMesa = () => {
    if (!mesaEditando) return;

    setMesas((prev) =>
      prev.map((mesa) =>
        mesa.id === mesaEditando.id
          ? mesaEditando
          : mesa
      )
    );

    setMesaEditando(null);
    setModalEditarMesa(false);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3 bg-white border border-border rounded-2xl px-5 py-4 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-sky-400" />
            <div>
              <p className="text-sm text-text-muted">
                Mesas libres
              </p>
              <h2 className="text-2xl font-bold text-text">
                {mesasLibres}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-border rounded-2xl px-5 py-4 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-red-400" />
            <div>
              <p className="text-sm text-text-muted">
                Mesas ocupadas
              </p>
              <h2 className="text-2xl font-bold text-text">
                {mesasOcupadas}
              </h2>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalNuevaMesa(true)}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus size={18} />
          Nueva mesa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-text">
                  Mesa {mesa.numero}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`w-3 h-3 rounded-full
                    ${
                      mesa.estado === 'LIBRE'
                        ? 'bg-sky-400'
                        : 'bg-red-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium
                    ${
                      mesa.estado === 'LIBRE'
                        ? 'text-sky-500'
                        : 'text-red-500'
                    }`}>
                    {mesa.estado === 'LIBRE'
                      ? 'Libre'
                      : 'Ocupada'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setMesaEditando(mesa);
                  setModalEditarMesa(true);
                }}
                className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-background transition-colors">
                <Pencil size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-background rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users
                  size={20}
                  className="text-primary"/>
              </div>
              <div>
                <p className="text-sm text-text-muted">
                  Capacidad
                </p>
                <h3 className="font-semibold text-text">
                  {mesa.capacidad} personas
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalNuevaMesa && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Nueva mesa
              </h2>
              <button
                onClick={() =>
                  setModalNuevaMesa(false)
                }>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Número de mesa
                </label>
                <input
                  type="number"
                  value={nuevaMesa.numero}
                  onChange={(e) =>
                    setNuevaMesa({
                      ...nuevaMesa,
                      numero: e.target.value,
                    })
                  }
                  className="w-full border border-border rounded-xl px-4 py-3 outline-none"/>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Capacidad de personas
                </label>
                <input
                  type="number"
                  value={nuevaMesa.capacidad}
                  onChange={(e) =>
                    setNuevaMesa({
                      ...nuevaMesa,
                      capacidad: e.target.value,
                    })
                  }
                  className="w-full border border-border rounded-xl px-4 py-3 outline-none"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() =>
                  setModalNuevaMesa(false)
                }
                className="px-4 py-2 rounded-xl border border-border">
                Cancelar
              </button>
              <button
                onClick={crearMesa}
                className="px-4 py-2 rounded-xl bg-primary text-white">
                Crear mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditarMesa && mesaEditando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Editar mesa
              </h2>
              <button
                onClick={() => {
                  setMesaEditando(null);
                  setModalEditarMesa(false);
                }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Número de mesa
                </label>
                <input
                  type="number"
                  value={mesaEditando.numero}
                  onChange={(e) =>
                    setMesaEditando({
                      ...mesaEditando,
                      numero: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="w-full border border-border rounded-xl px-4 py-3 outline-none"/>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Capacidad de personas
                </label>
                <input
                  type="number"
                  value={mesaEditando.capacidad}
                  onChange={(e) =>
                    setMesaEditando({
                      ...mesaEditando,
                      capacidad: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="w-full border border-border rounded-xl px-4 py-3 outline-none"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setMesaEditando(null);
                  setModalEditarMesa(false);
                }}
                className="px-4 py-2 rounded-xl border border-border">
                Cancelar
              </button>
              <button
                onClick={actualizarMesa}
                className="px-4 py-2 rounded-xl bg-primary text-white">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}