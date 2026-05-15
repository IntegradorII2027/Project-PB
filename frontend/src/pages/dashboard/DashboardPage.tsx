import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ClipboardList, Grid2X2, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../../components/shared/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { reportesService } from '../../services/reportes.service';
import { formatCurrency, formatDate } from '../../utils/cn';
import type { DashboardStats } from '../../types';

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: reportesService.getDashboard,
    refetchInterval: 60000, // fallback — Realtime lo actualiza al instante
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card border border-border rounded-l" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data!;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Ventas del día"
          value={formatCurrency(stats.ventasHoy)}
          subtitle="Ingresos hoy"
          icon={<TrendingUp size={16} className="text-success" />}
          iconBg="bg-success-bg"
        />
        <MetricCard
          title="Pedidos completados"
          value={stats.pedidosHoy}
          subtitle="Hoy"
          icon={<ClipboardList size={16} className="text-info" />}
          iconBg="bg-info-bg"
        />
        <MetricCard
          title="Mesas ocupadas"
          value={`${stats.mesasOcupadas} / ${stats.totalMesas}`}
          subtitle="En este momento"
          icon={<Grid2X2 size={16} className="text-warning" />}
          iconBg="bg-warning-bg"
        />
        <MetricCard
          title="Alertas de stock"
          value={stats.alertasCount}
          subtitle={stats.alertasCount > 0 ? 'Requieren atención' : 'Todo en orden'}
          icon={<AlertTriangle size={16} className="text-error" />}
          iconBg="bg-error-bg"
          alert={stats.alertasCount > 0}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="col-span-2 bg-card border border-border rounded-l">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Pedidos Recientes</h2>
            <a href="/pedidos" className="text-xs text-primary hover:underline">Ver todos →</a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Mesa</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Productos</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.pedidosRecientes.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Sin pedidos recientes</td></tr>
              ) : stats.pedidosRecientes.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-5 py-3 text-foreground font-medium">
                    {p.mesa ? `Mesa ${p.mesa.numero}` : 'Para llevar'}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.items.slice(0, 2).map(i => i.producto.nombre).join(', ')}
                    {p.items.length > 2 && ` +${p.items.length - 2}`}
                  </td>
                  <td className="px-5 py-3 text-foreground">{formatCurrency(Number(p.total ?? 0))}</td>
                  <td className="px-5 py-3">
                    <StatusBadge variant={p.estado.toLowerCase()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stock Alerts */}
        <div className="bg-card border border-border rounded-l">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Alertas de Stock</h2>
            <a href="/inventario" className="text-xs text-primary hover:underline">Ver inventario →</a>
          </div>
          <div className="divide-y divide-border/50">
            {stats.alertasDetalle.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Stock en niveles normales</p>
            ) : stats.alertasDetalle.map((ins) => (
              <div key={ins.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{ins.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(ins.stockActual).toFixed(1)} {ins.unidad} / mín {Number(ins.stockMinimo).toFixed(1)} {ins.unidad}
                  </p>
                </div>
                <StatusBadge variant={ins.estado.toLowerCase()} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
