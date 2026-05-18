import { CalendarDays, Download, DollarSign, ClipboardList, } from 'lucide-react';

const ventasData = [
  { dia: 'Lun', monto: 1200 },
  { dia: 'Mar', monto: 1800 },
  { dia: 'Mié', monto: 1500 },
  { dia: 'Jue', monto: 2200 },
  { dia: 'Vie', monto: 3100 },
  { dia: 'Sáb', monto: 4200 },
  { dia: 'Dom', monto: 3900 },
];

const pedidosData = [
  { dia: 'Lun', pedidos: 20 },
  { dia: 'Mar', pedidos: 35 },
  { dia: 'Mié', pedidos: 28 },
  { dia: 'Jue', pedidos: 40 },
  { dia: 'Vie', pedidos: 55 },
  { dia: 'Sáb', pedidos: 72 },
  { dia: 'Dom', pedidos: 68 },
];

const meserosData = [
  { nombre: 'Carlos', pedidos: 48 },
  { nombre: 'Andrea', pedidos: 63 },
  { nombre: 'Luis', pedidos: 37 },
  { nombre: 'María', pedidos: 58 },
];

export default function ReportesPage() {
  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">
            Reportes
          </h1>

          <p className="text-text-muted mt-1">
            Visualiza estadísticas del restaurante
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div>
                <label className="block text-sm font-medium text-text mb-2">
                Desde
                </label>
                <div className="relative">
                <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"/>
                <input
                    type="date"
                    className="bg-white border border-border rounded-xl pl-11 pr-4 py-3 outline-none"/>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text mb-2">Hasta</label>
                <div className="relative">
                <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"/>
                <input
                    type="date"
                    className="bg-white border border-border rounded-xl pl-11 pr-4 py-3 outline-none"/>
                </div>
            </div>
            <button className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                <Download size={18} />
                Exportar Excel
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-2">
                Total de ventas
              </p>
              <h2 className="text-4xl font-bold text-text">
                S/ 15,920
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <DollarSign
                size={24}
                className="text-green-600"/>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm mb-2">
                Cantidad de pedidos
              </p>
              <h2 className="text-4xl font-bold text-text">
                318
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <ClipboardList
                size={24}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-1">
            Ventas por día
          </h3>
          <p className="text-sm text-text-muted mb-6">
            Ingresos generados diariamente
          </p>
          <div className="space-y-4">
            {ventasData.map((item) => (
              <div key={item.dia}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.dia}</span>
                  <span>S/ {item.monto}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{
                      width: `${(item.monto / 4500) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-1">
            Pedidos por día
          </h3>
          <p className="text-sm text-text-muted mb-6">
            Cantidad de pedidos diarios
          </p>
          <div className="space-y-4">
            {pedidosData.map((item) => (
              <div key={item.dia}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.dia}</span>
                  <span>{item.pedidos} pedidos</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${(item.pedidos / 80) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold">
              Rendimiento de meseros
            </h3>
            <p className="text-sm text-text-muted">
              Pedidos atendidos por mesero
            </p>
          </div>
          <select className="bg-background border border-border rounded-xl px-4 py-3 outline-none">
            <option>Todos los meseros</option>
            <option>Carlos</option>
            <option>Andrea</option>
            <option>Luis</option>
            <option>María</option>
          </select>
        </div>

        <div className="space-y-5">
          {meserosData.map((mesero) => (
            <div key={mesero.nombre}>
              <div className="flex justify-between text-sm mb-1">
                <span>{mesero.nombre}</span>
                <span>{mesero.pedidos} pedidos</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full"
                  style={{
                    width: `${(mesero.pedidos / 70) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}