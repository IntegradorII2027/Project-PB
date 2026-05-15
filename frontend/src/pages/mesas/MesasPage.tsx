import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, User, Pencil, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { mesasService } from '../../services/mesas.service';
import { pedidosService } from '../../services/pedidos.service';
import type { Mesa } from '../../types';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

function getTimerColor(t: number | null | undefined): React.CSSProperties {
  if (t == null) return {};
  if (t <= 10)   return { color: 'var(--color-error)' };   /* rosa magenta */
  if (t <= 20)   return { color: 'var(--color-warning)' }; /* ámbar */
  return { color: 'var(--color-success)' };                 /* cyan */
}

function getMesaBorder(m: Mesa) {
  /* colores accesibles — cyan=libre, rosa=ocupada, ámbar=espera */
  if (m.estado === 'LIBRE')    return 'border-[#22D3EE]/40';
  if (m.estado === 'OCUPADA')  return 'border-[#F472B6]/40';
  if (m.estado === 'EN_ESPERA') return 'border-[#FBBF24]/40';
  return 'border-border';
}

const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Yape / Plin', 'Transferencia'];

export default function MesasPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [numero, setNumero] = useState('');
  const [capacidad, setCapacidad] = useState('4');

  // Edit modal state
  const [editMesa, setEditMesa] = useState<Mesa | null>(null);
  const [editNumero, setEditNumero] = useState('');
  const [editCapacidad, setEditCapacidad] = useState('');

  // Pago modal state
  const [pagoMesa, setPagoMesa] = useState<Mesa | null>(null);
  const [metodoPago, setMetodoPago] = useState('Efectivo');

  const { data: mesas = [], isLoading } = useQuery<Mesa[]>({
    queryKey: ['mesas'],
    queryFn: mesasService.getAll,
    refetchInterval: 60000, // fallback — Realtime lo actualiza al instante
  });

  const createMesa = useMutation({
    mutationFn: () => mesasService.create({ numero: parseInt(numero), capacidad: parseInt(capacidad) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mesas'] }); setShowCreate(false); toast.success('Mesa creada'); },
    onError: () => toast.error('Error al crear mesa'),
  });

  const updateMesa = useMutation({
    mutationFn: ({ id, numero, capacidad }: { id: string; numero: number; capacidad: number }) =>
      mesasService.update(id, { numero, capacidad }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mesas'] });
      setEditMesa(null);
      toast.success('Mesa actualizada');
    },
    onError: () => toast.error('Error al actualizar mesa'),
  });

  const entregar = useMutation({
    mutationFn: (pedidoId: string) => pedidosService.updateEstado(pedidoId, 'ENTREGADO'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mesas'] }); toast.success('Pedido entregado al cliente'); },
    onError: () => toast.error('Error al entregar pedido'),
  });

  const registrarPago = useMutation({
    mutationFn: ({ pedidoId, metodo }: { pedidoId: string; metodo: string }) =>
      pedidosService.registrarPago(pedidoId, metodo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mesas'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setPagoMesa(null);
      toast.success('¡Pago registrado! Mesa liberada');
    },
    onError: () => toast.error('Error al registrar pago'),
  });

  const openEdit = (mesa: Mesa) => {
    setEditMesa(mesa);
    setEditNumero(String(mesa.numero));
    setEditCapacidad(String(mesa.capacidad));
  };

  const openPago = (mesa: Mesa) => {
    setPagoMesa(mesa);
    setMetodoPago('Efectivo');
  };

  const libres = mesas.filter((m) => m.estado === 'LIBRE').length;
  const ocupadas = mesas.filter((m) => m.estado === 'OCUPADA').length;
  const enEspera = mesas.filter((m) => m.estado === 'EN_ESPERA').length;

  if (isLoading) {
    return <div className="grid grid-cols-5 gap-4">{[...Array(10)].map((_, i) => <div key={i} className="h-40 bg-card border border-border rounded-l animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-5">
      {/* Stats + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-pill inline-block" style={{ background: 'var(--color-success)' }} aria-hidden="true" />
            <span className="text-foreground font-medium">○ {libres} Libres</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-pill inline-block" style={{ background: 'var(--color-error)' }} aria-hidden="true" />
            <span className="text-foreground font-medium">● {ocupadas} Ocupadas</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-pill inline-block" style={{ background: 'var(--color-warning)' }} aria-hidden="true" />
            <span className="text-foreground font-medium">◔ {enEspera} En espera</span>
          </span>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus size={14} /> Nueva Mesa
        </Button>
      </div>

      {/* Mesa Grid */}
      <div className="grid grid-cols-5 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            className={cn('bg-card border rounded-l p-4 flex flex-col gap-3', getMesaBorder(mesa))}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">Mesa {mesa.numero}</span>
              <div className="flex items-center gap-1.5">
                <StatusBadge variant={mesa.estado.toLowerCase()} />
                <button
                  onClick={() => openEdit(mesa)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Editar mesa ${mesa.numero}`}
                  title="Editar mesa"
                >
                  <Pencil size={12} />
                </button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">{mesa.capacidad} personas</div>

            {mesa.estado === 'OCUPADA' && (
              <div className="space-y-1">
                {mesa.mesero && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User size={12} aria-hidden="true" /> {mesa.mesero}
                  </div>
                )}
                {mesa.timerRestante != null && (
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={getTimerColor(mesa.timerRestante)}>
                    <Clock size={12} aria-hidden="true" />
                    {mesa.timerRestante <= 0 ? 'TIEMPO AGOTADO' : `${mesa.timerRestante} min restantes`}
                  </div>
                )}
              </div>
            )}

            <div className="mt-auto space-y-2">
              {mesa.estado === 'LIBRE' ? (
                <Button size="sm" className="w-full" onClick={() => navigate(`/pedidos/nuevo?mesaId=${mesa.id}`)}>
                  Asignar Pedido
                </Button>
              ) : mesa.pedidoActivo?.estado === 'LISTO' ? (
                <>
                  <div className="text-xs text-center font-semibold text-success py-0.5">✓ Listo para servir</div>
                  <Button
                    size="sm"
                    className="w-full"
                    loading={entregar.isPending}
                    onClick={() => entregar.mutate(mesa.pedidoActivo!.id)}
                  >
                    Entregar al cliente
                  </Button>
                </>
              ) : mesa.pedidoActivo?.estado === 'ENTREGADO' ? (
                <>
                  <div className="text-xs text-center font-medium text-info py-0.5">Entregado — esperando pago</div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full border-success/50 text-success hover:bg-success/10"
                    onClick={() => openPago(mesa)}
                  >
                    <CreditCard size={13} /> Cliente pagó
                  </Button>
                </>
              ) : (
                <div className="text-xs text-center text-muted-foreground py-1">
                  {mesa.pedidoActivo?.estado === 'EN_COCINA' ? '🍳 En cocina...' :
                   mesa.pedidoActivo?.estado === 'EN_PREPARACION' ? '👨‍🍳 Preparando...' : 'Ocupada'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Mesa */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nueva Mesa">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Número de mesa</label>
            <input
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: 13"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Capacidad (personas)</label>
            <input
              type="number"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button className="flex-1" loading={createMesa.isPending} onClick={() => createMesa.mutate()}>Crear Mesa</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Mesa */}
      <Modal open={!!editMesa} onClose={() => setEditMesa(null)} title={`Editar Mesa ${editMesa?.numero}`}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Número de mesa</label>
            <input
              type="number"
              value={editNumero}
              onChange={(e) => setEditNumero(e.target.value)}
              className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Capacidad (personas)</label>
            <input
              type="number"
              value={editCapacidad}
              onChange={(e) => setEditCapacidad(e.target.value)}
              className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditMesa(null)}>Cancelar</Button>
            <Button
              className="flex-1"
              loading={updateMesa.isPending}
              onClick={() => editMesa && updateMesa.mutate({
                id: editMesa.id,
                numero: parseInt(editNumero),
                capacidad: parseInt(editCapacidad),
              })}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Registrar Pago */}
      <Modal open={!!pagoMesa} onClose={() => setPagoMesa(null)} title={`Pago — Mesa ${pagoMesa?.numero}`}>
        <div className="space-y-4">
          {pagoMesa?.pedidoActivo && (
            <div className="bg-muted rounded-m p-3">
              <p className="text-sm text-muted-foreground mb-1">Total a cobrar</p>
              <p className="text-2xl font-bold text-foreground">
                S/ {Number(pagoMesa.pedidoActivo.total ?? 0).toFixed(2)}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Método de pago</label>
            <div className="grid grid-cols-2 gap-2">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={cn(
                    'px-3 py-2.5 rounded-m text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
                    metodoPago === m
                      ? 'bg-primary text-white border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setPagoMesa(null)}>Cancelar</Button>
            <Button
              className="flex-1"
              loading={registrarPago.isPending}
              onClick={() => pagoMesa?.pedidoActivo && registrarPago.mutate({
                pedidoId: pagoMesa.pedidoActivo.id,
                metodo: metodoPago,
              })}
            >
              Confirmar pago
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
