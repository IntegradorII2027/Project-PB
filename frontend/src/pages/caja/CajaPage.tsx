import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { pedidosService } from '../../services/pedidos.service';
import { formatCurrency } from '../../utils/cn';
import type { Pedido } from '../../types';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const METODOS = [
  { key: 'Efectivo', label: 'Efectivo', icon: Banknote },
  { key: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
  { key: 'Yape/Plin', label: 'Yape/Plin', icon: Smartphone },
];

export default function CajaPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [metodo, setMetodo] = useState('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');

  const { data: pedidos = [] } = useQuery<Pedido[]>({
    queryKey: ['pedidosActivos'],
    queryFn: pedidosService.getActivos,
    refetchInterval: 20000,
  });

  const pendientesPago = pedidos.filter((p) => p.estado === 'ENTREGADO');

  const pagar = useMutation({
    mutationFn: () => pedidosService.registrarPago(selected!.id, metodo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidosActivos'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setSelected(null);
      setMontoRecibido('');
      toast.success('Pago registrado correctamente');
    },
    onError: () => toast.error('Error al registrar pago'),
  });

  const total = Number(selected?.total ?? 0);
  const recibido = parseFloat(montoRecibido) || 0;
  const vuelto = recibido - total;

  return (
    <div className="flex gap-5 h-full">
      {/* Pending List */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-card border border-border rounded-l">
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Pendientes de pago</h3>
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-pill font-bold">{pendientesPago.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {pendientesPago.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">Sin pedidos pendientes</p>
          ) : pendientesPago.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setMontoRecibido(''); }}
              className={cn(
                'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                selected?.id === p.id && 'bg-muted/70 border-l-2 border-primary'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {p.mesa ? `Mesa ${p.mesa.numero}` : 'Para llevar'}
                </span>
                <span className="text-sm font-bold text-primary">{formatCurrency(Number(p.total ?? 0))}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {p.mesero?.nombre ?? ''} · {p.items.length} items
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Panel */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-l">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-muted-foreground">
            <CheckCircle size={48} className="opacity-20" />
            <p>Selecciona un pedido para cobrar</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Cuenta — {selected.mesa ? `Mesa ${selected.mesa.numero}` : 'Para llevar'}
                </h3>
              </div>
              <StatusBadge variant={selected.estado.toLowerCase()} />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {selected.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {item.cantidad}x {item.producto.nombre}
                    </span>
                    <span className="text-muted-foreground">{formatCurrency(Number(item.subtotal))}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-2xl font-bold text-foreground">
                  <span>TOTAL A PAGAR</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Método de pago</p>
                <div className="grid grid-cols-3 gap-3">
                  {METODOS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setMetodo(key)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-l border-2 transition-colors',
                        metodo === key ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Efectivo */}
              {metodo === 'Efectivo' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Monto recibido (S/)</label>
                    <input
                      type="number"
                      step="0.50"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-muted border border-border rounded-m px-3 py-2 text-lg font-bold text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  {recibido > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vuelto</span>
                      <span className={cn('font-bold', vuelto >= 0 ? 'text-success' : 'text-error')}>
                        {formatCurrency(Math.abs(vuelto))}
                        {vuelto < 0 ? ' (falta)' : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border space-y-3">
              <Button
                className="w-full"
                size="lg"
                loading={pagar.isPending}
                disabled={metodo === 'Efectivo' && recibido < total}
                onClick={() => pagar.mutate()}
              >
                <CheckCircle size={16} /> Registrar pago
              </Button>
              <button onClick={() => setSelected(null)} className="w-full text-xs text-muted-foreground hover:text-foreground text-center">
                Imprimir comprobante
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
