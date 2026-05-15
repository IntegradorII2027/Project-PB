import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { mesasService } from '../../services/mesas.service';
import { reportesService } from '../../services/reportes.service';
import type { Restaurante, Mesa } from '../../types';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const TABS = ['General', 'Mesas', 'Notificaciones'];

export default function ConfiguracionPage() {
  const [tab, setTab] = useState('General');
  const [timer, setTimer] = useState<number>(45);
  const qc = useQueryClient();

  const { data: restaurante } = useQuery<Restaurante>({ queryKey: ['restaurante'], queryFn: reportesService.getRestaurante });
  const { data: mesas = [] } = useQuery<Mesa[]>({ queryKey: ['mesas'], queryFn: mesasService.getAll });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  useEffect(() => {
    if (restaurante) {
      reset(restaurante);
      setTimer(restaurante.timerMesa ?? 45);
    }
  }, [restaurante]);

  const saveGeneral = useMutation({
    mutationFn: (data: any) => reportesService.updateRestaurante(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['restaurante'] }); toast.success('Configuración guardada'); },
    onError: () => toast.error('Error al guardar'),
  });

  const saveTimer = useMutation({
    mutationFn: () => reportesService.updateRestaurante({ timerMesa: timer }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['restaurante'] }); toast.success('Timer actualizado'); },
    onError: () => toast.error('Error al guardar'),
  });

  const delMesa = useMutation({
    mutationFn: (id: string) => mesasService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mesas'] }); toast.success('Mesa eliminada'); },
  });

  return (
    <div className="flex gap-6">
      {/* Sidebar interno */}
      <div className="w-44 flex-shrink-0 space-y-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('w-full text-left px-3 py-2.5 rounded-m text-sm font-medium transition-colors', tab === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {tab === 'General' && (
          <div className="bg-card border border-border rounded-l p-6">
            <h3 className="text-base font-semibold text-foreground mb-5">Datos del restaurante</h3>
            <form onSubmit={handleSubmit((d) => saveGeneral.mutate(d))} className="space-y-4 max-w-lg">
              {[['nombre', 'Nombre del restaurante'], ['direccion', 'Dirección'], ['telefono', 'Teléfono']].map(([field, label]) => (
                <div key={field}>
                  <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
                  <input {...register(field)} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
              ))}
              <Button type="submit" loading={isSubmitting}>Guardar cambios</Button>
            </form>
          </div>
        )}

        {tab === 'Mesas' && (
          <div className="bg-card border border-border rounded-l p-6">
            <h3 className="text-base font-semibold text-foreground mb-5">Gestión de mesas</h3>
            <div className="mb-4 flex items-end gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Timer de mesa (minutos)</label>
                <input
                  type="number"
                  value={timer}
                  onChange={(e) => setTimer(parseInt(e.target.value) || 45)}
                  className="w-32 bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <Button size="sm" loading={saveTimer.isPending} onClick={() => saveTimer.mutate()}>
                Guardar timer
              </Button>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {mesas.map((m) => (
                <div key={m.id} className="bg-muted border border-border rounded-m p-3 flex flex-col items-center gap-2">
                  <span className="font-bold text-foreground">Mesa {m.numero}</span>
                  <span className="text-xs text-muted-foreground">{m.capacidad} personas</span>
                  <button onClick={() => delMesa.mutate(m.id)} className="text-xs text-error hover:underline">Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Notificaciones' && (
          <div className="bg-card border border-border rounded-l p-6">
            <h3 className="text-base font-semibold text-foreground mb-5">Preferencias de notificación</h3>
            <div className="space-y-4">
              {['Pedido listo para entregar', 'Stock bajo en inventario', 'Nuevo usuario registrado', 'Mesa con timer vencido'].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item}</span>
                  <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
