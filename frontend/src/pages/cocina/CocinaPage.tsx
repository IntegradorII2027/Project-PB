import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Utensils, Clock, LogOut } from 'lucide-react';
import { pedidosService } from '../../services/pedidos.service';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import type { Pedido } from '../../types';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

function minutesSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

function getUrgencyStyle(mins: number) {
  if (mins < 10) return 'border-success/60';
  if (mins <= 20) return 'border-warning/60';
  return 'border-error/60';
}

function ElapsedTimer({ start }: { start: string }) {
  const [elapsed, setElapsed] = useState(minutesSince(start));
  useEffect(() => {
    const id = setInterval(() => setElapsed(minutesSince(start)), 10000);
    return () => clearInterval(id);
  }, [start]);
  return <span>{elapsed} min</span>;
}

const FILTROS = ['TODOS', 'EN_COCINA', 'EN_PREPARACION', 'LISTO'];

export default function CocinaPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('TODOS');
  const [time, setTime] = useState(new Date().toLocaleTimeString('es-PE'));

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString('es-PE')), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: pedidos = [] } = useQuery<Pedido[]>({
    queryKey: ['pedidosActivos'],
    queryFn: pedidosService.getActivos,
    refetchInterval: 60000, // fallback — Realtime lo actualiza al instante
  });

  const updateEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => pedidosService.updateEstado(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidosActivos'] }); },
    onError: () => toast.error('Error al actualizar estado'),
  });

  const visible = pedidos.filter((p) =>
    filtro === 'TODOS'
      ? ['EN_COCINA', 'EN_PREPARACION', 'LISTO'].includes(p.estado)
      : p.estado === filtro
  );

  const counts = {
    EN_COCINA: pedidos.filter(p => p.estado === 'EN_COCINA').length,
    EN_PREPARACION: pedidos.filter(p => p.estado === 'EN_PREPARACION').length,
    LISTO: pedidos.filter(p => p.estado === 'LISTO').length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header simplificado */}
      <header className="h-14 bg-sidebar-bg border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            <LogOut size={14} className="rotate-180" />
            Salir
          </button>
          <span className="text-border">|</span>
          <Utensils size={16} className="text-primary" />
          <span className="font-bold text-foreground text-sm">RestaurantOS</span>
          <span className="text-muted-foreground text-sm mx-2">—</span>
          <span className="text-sm text-muted-foreground">Vista Cocina</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {(['TODOS', 'EN_COCINA', 'EN_PREPARACION', 'LISTO'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  filtro === f ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {f === 'TODOS' ? `Todos (${visible.length})` : f === 'EN_COCINA' ? `Pendientes (${counts.EN_COCINA})` : f === 'EN_PREPARACION' ? `En prep. (${counts.EN_PREPARACION})` : `Listos (${counts.LISTO})`}
              </button>
            ))}
          </div>
          <span className="text-sm font-mono text-muted-foreground">{time}</span>
        </div>
      </header>

      <main className="flex-1 p-5">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Utensils size={40} className="mb-3 opacity-20" />
            <p>Sin pedidos activos</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {visible.map((pedido) => {
              const mins = minutesSince(pedido.creadoEn);
              const isUrgent = mins > 20;
              return (
                <div
                  key={pedido.id}
                  className={cn('bg-card border-2 rounded-l flex flex-col', getUrgencyStyle(mins))}
                >
                  {/* Card Header */}
                  <div className={cn('px-4 py-3 flex items-center justify-between border-b border-border/50', isUrgent ? 'bg-error-bg/30' : '')}>
                    <div>
                      <span className="font-bold text-foreground">
                        {pedido.mesa ? `Mesa ${pedido.mesa.numero}` : 'Para llevar'}
                      </span>
                      <div className="text-xs text-muted-foreground">#{pedido.numero}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isUrgent && <span className="text-xs bg-error text-white px-2 py-0.5 rounded font-bold">URGENTE</span>}
                      <StatusBadge variant={pedido.estado.toLowerCase()} />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex-1 p-4 space-y-2">
                    {pedido.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{item.producto.nombre}</span>
                        <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded text-xs">x{item.cantidad}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timer + Actions */}
                  <div className="px-4 pb-4 space-y-2">
                    <div className={cn('flex items-center gap-1.5 text-xs font-medium', isUrgent ? 'text-error' : 'text-muted-foreground')}>
                      <Clock size={12} />
                      <ElapsedTimer start={pedido.creadoEn} />
                    </div>

                    {pedido.estado === 'EN_COCINA' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        loading={updateEstado.isPending}
                        onClick={() => updateEstado.mutate({ id: pedido.id, estado: 'EN_PREPARACION' })}
                      >
                        Iniciar preparación
                      </Button>
                    )}
                    {pedido.estado === 'EN_PREPARACION' && (
                      <Button
                        size="sm"
                        className="w-full"
                        loading={updateEstado.isPending}
                        onClick={() => updateEstado.mutate({ id: pedido.id, estado: 'LISTO' })}
                      >
                        ✓ Marcar como listo
                      </Button>
                    )}
                    {pedido.estado === 'LISTO' && (
                      <div className="text-center text-xs text-success font-medium py-1">
                        ✓ Listo para servir
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
