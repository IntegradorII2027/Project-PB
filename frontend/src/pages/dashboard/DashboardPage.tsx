import { useQuery } from '@tanstack/react-query';
import { Building2, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/cn';
import { Badge } from '../../components/ui/Badge';

function StatCard({ label, value, icon: Icon, color = 'text-primary' }: {
  label: string; value: string | number; icon: any; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isDueno = user?.rol === 'DUENO';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', isDueno],
    queryFn: async () => {
      if (isDueno) {
        const { data } = await api.get('/dashboard');
        return data;
      } else {
        const { data } = await api.get(`/dashboard/sucursal/${user?.sucursalId}`);
        return data;
      }
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  // ── Vista Dueño: resumen de todas las sucursales ──────────────────────────
  if (isDueno && data?.sucursales) {
    const total = data.sucursales.reduce((s: number, x: any) => s + x.ventasHoy, 0);
    const abiertas = data.sucursales.filter((s: any) => s.abierto).length;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-text">Resumen general</h2>
          <p className="text-sm text-text-muted">Hoy · todas las sucursales</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Ventas hoy (total)" value={formatCurrency(total)} icon={TrendingUp} />
          <StatCard label="Sucursales activas" value={`${abiertas} / ${data.sucursales.length}`} icon={Building2} />
          <StatCard label="Pedidos hoy" value={data.sucursales.reduce((s: number, x: any) => s + x.pedidosHoy, 0)} icon={ShoppingBag} />
          <StatCard label="Sucursales totales" value={data.sucursales.length} icon={Building2} color="text-blue-600" />
        </div>

        {/* Tabla de sucursales */}
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-text">Estado de sucursales</h3>
          </div>
          <div className="divide-y divide-border">
            {data.sucursales.map((s: any) => (
              <div key={s.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-text">{s.nombre}</p>
                  <p className="text-xs text-text-muted">{s.direccion}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-text-muted">{s.pedidosHoy} pedidos</span>
                  <span className="font-semibold text-text">{formatCurrency(s.ventasHoy)}</span>
                  <Badge variant={s.abierto ? 'success' : 'neutral'}>
                    {s.abierto ? 'Abierto' : 'Cerrado'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Vista Admin: resumen de su sucursal ──────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Resumen del día</h2>
        <p className="text-sm text-text-muted">{user?.sucursal?.nombre}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ventas hoy" value={formatCurrency(data?.ventasHoy ?? 0)} icon={TrendingUp} />
        <StatCard label="Pedidos hoy" value={data?.pedidosHoy ?? 0} icon={ShoppingBag} />
        <StatCard label="Mesas ocupadas" value={`${data?.mesasOcupadas ?? 0} / ${data?.totalMesas ?? 0}`} icon={Users} />
        <StatCard label="Pedidos activos" value={data?.pedidosActivos?.length ?? 0} icon={ShoppingBag} color="text-warning" />
      </div>

      {/* Placeholder para gráficas — el equipo las implementa */}
      <div className="bg-white rounded-xl border border-border shadow-card p-8 flex items-center justify-center text-text-muted">
        <p className="text-sm">📊 Aquí irán los gráficos de ventas</p>
      </div>
    </div>
  );
}
