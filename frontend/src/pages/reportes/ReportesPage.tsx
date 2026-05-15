import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { MetricCard } from '../../components/shared/MetricCard';
import { TableWrapper, Tr, Td } from '../../components/shared/TableWrapper';
import { reportesService } from '../../services/reportes.service';
import { formatCurrency } from '../../utils/cn';
import type { VentasReport, TopProducto } from '../../types';
import { cn } from '../../utils/cn';

const PERIODOS = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mes' },
];

const TABS = ['Ventas', 'Pedidos', 'Productividad'];

export default function ReportesPage() {
  const [tab, setTab] = useState('Ventas');
  const [periodo, setPeriodo] = useState('semana');

  const { data: ventas } = useQuery<VentasReport>({
    queryKey: ['ventas', periodo],
    queryFn: () => reportesService.getVentas(periodo),
  });

  const { data: topProductos = [] } = useQuery<TopProducto[]>({
    queryKey: ['topProductos'],
    queryFn: reportesService.getTopProductos,
  });

  const { data: productividad = [] } = useQuery<any[]>({
    queryKey: ['productividad'],
    queryFn: reportesService.getProductividad,
  });

  const exportCSV = () => {
    const rows = [
      ['Fecha', 'Ventas (S/)'],
      ...(ventas?.chartData ?? []).map((d) => [d.fecha, d.ventas.toFixed(2)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ventas_${periodo}.csv`; a.click();
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px', tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Ventas' && (
        <div className="space-y-5">
          {/* Period Selector */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {PERIODOS.map(({ key, label }) => (
                <button key={key} onClick={() => setPeriodo(key)}
                  className={cn('px-4 py-1.5 rounded-m text-sm font-medium transition-colors', periodo === key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-m text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Download size={14} /> Exportar CSV
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard title="Total ventas" value={formatCurrency(ventas?.totalVentas ?? 0)} icon={<TrendingUp size={16} className="text-success" />} iconBg="bg-success-bg" />
            <MetricCard title="Pedidos pagados" value={ventas?.totalPedidos ?? 0} icon={<TrendingUp size={16} className="text-info" />} iconBg="bg-info-bg" />
            <MetricCard title="Promedio por pedido" value={formatCurrency(ventas?.totalPedidos ? (ventas.totalVentas / ventas.totalPedidos) : 0)} icon={<TrendingUp size={16} className="text-warning" />} iconBg="bg-warning-bg" />
          </div>

          {/* Chart */}
          <div className="bg-card border border-border rounded-l p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Ventas por día</h3>
            {ventas?.chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sin datos para el período</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ventas?.chartData ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="fecha" tick={{ fill: '#888888', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#888888', fontSize: 11 }} tickFormatter={(v) => `S/${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                    labelStyle={{ color: '#F5F0E8' }}
                    formatter={(v: number) => [formatCurrency(v), 'Ventas']}
                  />
                  <Bar dataKey="ventas" fill="#E8590C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Productos */}
          <div className="bg-card border border-border rounded-l">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Top Productos</h3>
            </div>
            <TableWrapper headers={['Producto', 'Cantidad vendida', 'Ingresos', '% del total']} isEmpty={topProductos.length === 0} emptyMessage="Sin datos">
              {topProductos.map((p, i) => (
                <Tr key={i}>
                  <Td className="font-medium">{p.nombre}</Td>
                  <Td>{p.cantidad}</Td>
                  <Td>{formatCurrency(p.ingresos)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-pill overflow-hidden">
                        <div className="h-full bg-primary rounded-pill" style={{ width: `${p.porcentaje}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{p.porcentaje}%</span>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TableWrapper>
          </div>
        </div>
      )}

      {tab === 'Productividad' && (
        <div className="bg-card border border-border rounded-l">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Productividad por cocinero</h3>
          </div>
          <TableWrapper headers={['Nombre', 'Pedidos atendidos', 'Tiempo promedio (min)']} isEmpty={productividad.length === 0} emptyMessage="Sin datos">
            {productividad.map((p, i) => (
              <Tr key={i}>
                <Td className="font-medium">{p.nombre}</Td>
                <Td>{p.pedidos}</Td>
                <Td>{p.tiempoPromedio} min</Td>
              </Tr>
            ))}
          </TableWrapper>
        </div>
      )}

      {tab === 'Pedidos' && (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Estadísticas de pedidos disponibles próximamente
        </div>
      )}
    </div>
  );
}
