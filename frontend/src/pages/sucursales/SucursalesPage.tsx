import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MapPin, Phone, Clock, Power, Pencil, Trash2, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { sucursalesService } from '../../services/sucursales.service';
import type { Sucursal } from '../../types';
import toast from 'react-hot-toast';

interface FormState {
  nombre: string; direccion: string; telefono: string;
  horarioApertura: string; horarioCierre: string; diasOperacion: string;
}

const emptyForm: FormState = {
  nombre: '', direccion: '', telefono: '',
  horarioApertura: '08:00', horarioCierre: '22:00', diasOperacion: 'LUN-DOM',
};

export default function SucursalesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Sucursal | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: sucursales = [], isLoading } = useQuery({
    queryKey: ['sucursales'],
    queryFn: sucursalesService.getAll,
  });

  const crear = useMutation({
    mutationFn: () => sucursalesService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sucursales'] }); toast.success('Sucursal creada'); closeModal(); },
    onError: () => toast.error('Error al crear sucursal'),
  });

  const actualizar = useMutation({
    mutationFn: () => sucursalesService.update(editing!.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sucursales'] }); toast.success('Sucursal actualizada'); closeModal(); },
    onError: () => toast.error('Error al actualizar'),
  });

  const toggle = useMutation({
    mutationFn: (id: string) => sucursalesService.toggle(id),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['sucursales'] }); toast.success(data.mensaje); },
    onError: () => toast.error('Error al cambiar estado'),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => sucursalesService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sucursales'] }); toast.success('Sucursal eliminada'); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al eliminar'),
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: Sucursal) => {
    setEditing(s);
    setForm({ nombre: s.nombre, direccion: s.direccion ?? '', telefono: s.telefono ?? '',
      horarioApertura: s.horarioApertura ?? '08:00', horarioCierre: s.horarioCierre ?? '22:00',
      diasOperacion: s.diasOperacion ?? 'LUN-DOM' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleChange = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); editing ? actualizar.mutate() : crear.mutate(); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Mis sucursales</h2>
          <p className="text-sm text-text-muted">{sucursales.length} sucursal{sucursales.length !== 1 ? 'es' : ''} registrada{sucursales.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> Nueva sucursal</Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-48" />)}
        </div>
      ) : sucursales.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Building2 size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">No tienes sucursales aún</p>
          <p className="text-sm mt-1">Crea tu primera sucursal para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sucursales.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text truncate">{s.nombre}</h3>
                  <Badge variant={s.abierto ? 'success' : 'neutral'} className="mt-1">
                    {s.abierto ? '● Abierto' : '○ Cerrado'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-text-muted">
                {s.direccion && <p className="flex items-center gap-2"><MapPin size={13} />{s.direccion}</p>}
                {s.telefono && <p className="flex items-center gap-2"><Phone size={13} />{s.telefono}</p>}
                {s.horarioApertura && (
                  <p className="flex items-center gap-2">
                    <Clock size={13} />{s.horarioApertura} – {s.horarioCierre}
                    {s.diasOperacion && <span className="ml-1 text-xs">({s.diasOperacion})</span>}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1 border-t border-border">
                <button
                  onClick={() => toggle.mutate(s.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    s.abierto ? 'bg-red-50 text-error hover:bg-red-100' : 'bg-green-50 text-primary hover:bg-green-100'
                  }`}
                >
                  <Power size={14} />
                  {s.abierto ? 'Cerrar local' : 'Abrir local'}
                </button>
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-text transition-colors">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar esta sucursal?')) eliminar.mutate(s.id); }}
                  className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-error transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h3 className="font-semibold text-text text-lg mb-5">{editing ? 'Editar sucursal' : 'Nueva sucursal'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { k: 'nombre', label: 'Nombre *', placeholder: 'Ej: Local Centro' },
                { k: 'direccion', label: 'Dirección', placeholder: 'Av. Principal 123' },
                { k: 'telefono', label: 'Teléfono', placeholder: '01-234-5678' },
                { k: 'diasOperacion', label: 'Días de operación', placeholder: 'LUN-DOM' },
              ].map(({ k, label, placeholder }) => (
                <div key={k}>
                  <label className="text-sm font-medium text-text block mb-1">{label}</label>
                  <input
                    value={form[k as keyof FormState]}
                    onChange={e => handleChange(k as keyof FormState, e.target.value)}
                    placeholder={placeholder}
                    required={k === 'nombre'}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[{ k: 'horarioApertura', label: 'Apertura', type: 'time' }, { k: 'horarioCierre', label: 'Cierre', type: 'time' }].map(({ k, label, type }) => (
                  <div key={k}>
                    <label className="text-sm font-medium text-text block mb-1">{label}</label>
                    <input type={type} value={form[k as keyof FormState]} onChange={e => handleChange(k as keyof FormState, e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={crear.isPending || actualizar.isPending}>
                  {editing ? 'Guardar cambios' : 'Crear sucursal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
