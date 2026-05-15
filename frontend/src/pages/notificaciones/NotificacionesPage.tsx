import { useQuery } from '@tanstack/react-query';
import { ChefHat, Package, ClipboardList, CheckCheck } from 'lucide-react';
import { pedidosService } from '../../services/pedidos.service';
import { inventarioService } from '../../services/inventario.service';
import { cn } from '../../utils/cn';
import type { Pedido, Insumo } from '../../types';

interface Notif {
  id: string;
  tipo: 'pedido_listo' | 'stock_critico' | 'stock_bajo' | 'pedido_activo';
  titulo: string;
  desc: string;
  urgente: boolean;
}

const tipoConfig = {
  pedido_listo:   { icon: ChefHat,       iconBg: 'bg-success-bg', iconColor: 'text-success' },
  stock_critico:  { icon: Package,       iconBg: 'bg-error-bg',   iconColor: 'text-error' },
  stock_bajo:     { icon: Package,       iconBg: 'bg-warning-bg', iconColor: 'text-warning' },
  pedido_activo:  { icon: ClipboardList, iconBg: 'bg-info-bg',    iconColor: 'text-info' },
};

export default function NotificacionesPage() {
  const { data: pedidos = [] } = useQuery<Pedido[]>({
    queryKey: ['pedidosActivos'],
    queryFn: pedidosService.getActivos,
    refetchInterval: 60000, // fallback — Realtime lo actualiza al instante
  });

  const { data: alertas = [] } = useQuery<Insumo[]>({
    queryKey: ['alertasInventario'],
    queryFn: inventarioService.getAlertas,
    refetchInterval: 60000,
  });

  const notifs: Notif[] = [
    ...pedidos
      .filter((p) => p.estado === 'LISTO')
      .map((p): Notif => ({
        id: `pedido-listo-${p.id}`,
        tipo: 'pedido_listo',
        titulo: 'Pedido listo para entregar',
        desc: `${p.mesa ? `Mesa ${p.mesa.numero}` : 'Para llevar'} — ${p.items.map((i) => i.producto.nombre).slice(0, 2).join(', ')}${p.items.length > 2 ? ` +${p.items.length - 2}` : ''}`,
        urgente: true,
      })),
    ...pedidos
      .filter((p) => p.estado === 'EN_COCINA' || p.estado === 'EN_PREPARACION')
      .map((p): Notif => ({
        id: `pedido-activo-${p.id}`,
        tipo: 'pedido_activo',
        titulo: p.estado === 'EN_COCINA' ? 'Pedido en cocina' : 'Pedido en preparación',
        desc: `${p.mesa ? `Mesa ${p.mesa.numero}` : 'Para llevar'} — ${p.items.length} items`,
        urgente: false,
      })),
    ...alertas
      .filter((i: any) => Number(i.stockActual) < Number(i.stockMinimo))
      .map((i: any): Notif => ({
        id: `stock-critico-${i.id}`,
        tipo: 'stock_critico',
        titulo: `Stock crítico: ${i.nombre}`,
        desc: `${i.stockActual} ${i.unidad} disponibles / mínimo ${i.stockMinimo} ${i.unidad}`,
        urgente: true,
      })),
    ...alertas
      .filter((i: any) => Number(i.stockActual) >= Number(i.stockMinimo) && Number(i.stockActual) < Number(i.stockMinimo) * 1.5)
      .map((i: any): Notif => ({
        id: `stock-bajo-${i.id}`,
        tipo: 'stock_bajo',
        titulo: `Stock bajo: ${i.nombre}`,
        desc: `${i.stockActual} ${i.unidad} disponibles / mínimo ${i.stockMinimo} ${i.unidad}`,
        urgente: false,
      })),
  ];

  const urgentes = notifs.filter((n) => n.urgente);
  const normales = notifs.filter((n) => !n.urgente);

  if (notifs.length === 0) {
    return (
      <div className="max-w-2xl flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <CheckCheck size={40} className="opacity-20" />
        <p>Todo en orden — sin notificaciones pendientes</p>
      </div>
    );
  }

  const renderGroup = (titulo: string, items: Notif[]) => {
    if (!items.length) return null;
    return (
      <div key={titulo}>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 mt-4">{titulo}</p>
        <div className="space-y-1">
          {items.map((n) => {
            const conf = tipoConfig[n.tipo];
            const Icon = conf.icon;
            return (
              <div key={n.id} className={cn(
                'flex items-start gap-3 p-4 bg-card border rounded-l transition-colors',
                n.urgente ? 'border-primary/30' : 'border-border'
              )}>
                <div className="w-1.5 h-1.5 rounded-pill mt-1.5 flex-shrink-0" style={{ background: n.urgente ? 'var(--color-primary)' : 'transparent' }} />
                <div className={cn('w-9 h-9 rounded-m flex items-center justify-center flex-shrink-0', conf.iconBg)}>
                  <Icon size={16} className={conf.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', n.urgente ? 'text-foreground font-semibold' : 'text-muted-foreground')}>{n.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </div>
                {n.urgente && <span className="text-xs bg-error text-white px-2 py-0.5 rounded font-bold flex-shrink-0">Urgente</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl space-y-2">
      <p className="text-sm text-muted-foreground mb-2">{urgentes.length} requieren atención inmediata</p>
      {renderGroup('REQUIEREN ATENCIÓN', urgentes)}
      {renderGroup('EN CURSO', normales)}
    </div>
  );
}
