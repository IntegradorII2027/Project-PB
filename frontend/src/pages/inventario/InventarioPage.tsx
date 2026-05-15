import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { MetricCard } from '../../components/shared/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableWrapper, Tr, Td } from '../../components/shared/TableWrapper';
import { inventarioService } from '../../services/inventario.service';
import type { Insumo } from '../../types';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

export default function InventarioPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Insumo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data: insumos = [], isLoading } = useQuery<Insumo[]>({
    queryKey: ['inventario'],
    queryFn: inventarioService.getAll,
  });

  const total = insumos.length;
  const ok = insumos.filter((i) => i.estado === 'OK').length;
  const alertas = insumos.filter((i) => i.estado !== 'OK').length;

  const save = useMutation({
    mutationFn: (data: any) => editing
      ? inventarioService.update(editing.id, data)
      : inventarioService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventario'] });
      setShowModal(false); setEditing(null); reset();
      toast.success(editing ? 'Insumo actualizado' : 'Insumo creado');
    },
    onError: () => toast.error('Error al guardar'),
  });

  const del = useMutation({
    mutationFn: (id: string) => inventarioService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventario'] }); toast.success('Insumo eliminado'); },
    onError: () => toast.error('Error al eliminar'),
  });

  const openEdit = (ins: Insumo) => {
    setEditing(ins);
    reset({ nombre: ins.nombre, categoria: ins.categoria, unidad: ins.unidad, stockActual: Number(ins.stockActual), stockMinimo: Number(ins.stockMinimo), proveedor: ins.proveedor });
    setShowModal(true);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Total insumos" value={total} icon={<Package size={16} className="text-info" />} iconBg="bg-info-bg" />
        <MetricCard title="Stock OK" value={ok} icon={<Package size={16} className="text-success" />} iconBg="bg-success-bg" />
        <MetricCard title="Alertas activas" value={alertas} icon={<Package size={16} className="text-error" />} iconBg="bg-error-bg" alert={alertas > 0} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditing(null); reset(); setShowModal(true); }}>
          <Plus size={14} /> Nuevo Insumo
        </Button>
      </div>

      <TableWrapper
        headers={['Insumo', 'Categoría', 'Stock Actual', 'Unidad', 'Stock Mínimo', 'Estado', 'Acciones']}
        isEmpty={insumos.length === 0}
        emptyMessage={isLoading ? 'Cargando...' : 'Sin insumos registrados'}
      >
        {insumos.map((ins) => (
          <Tr key={ins.id}>
            <Td className="font-medium">{ins.nombre}</Td>
            <Td className="text-muted-foreground">{ins.categoria ?? '—'}</Td>
            <Td className={cn('font-bold', ins.estado === 'CRITICO' ? 'text-error' : ins.estado === 'BAJO' ? 'text-warning' : 'text-foreground')}>
              {Number(ins.stockActual).toFixed(1)}
            </Td>
            <Td className="text-muted-foreground">{ins.unidad}</Td>
            <Td className="text-muted-foreground">{Number(ins.stockMinimo).toFixed(1)}</Td>
            <Td><StatusBadge variant={ins.estado.toLowerCase()} /></Td>
            <Td>
              <div className="flex gap-2">
                <button onClick={() => openEdit(ins)} className="text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                <button onClick={() => del.mutate(ins.id)} className="text-muted-foreground hover:text-error transition-colors"><Trash2 size={14} /></button>
              </div>
            </Td>
          </Tr>
        ))}
      </TableWrapper>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); reset(); }}
        title={editing ? 'Editar Insumo' : 'Nuevo Insumo'}>
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
          {(['nombre', 'categoria', 'unidad', 'proveedor'] as const).map((field) => (
            <div key={field}>
              <label className="text-sm font-medium text-foreground block mb-1.5 capitalize">{field}</label>
              <input {...register(field)} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Stock Actual</label>
              <input type="number" step="0.1" {...register('stockActual', { valueAsNumber: true })} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Stock Mínimo</label>
              <input type="number" step="0.1" {...register('stockMinimo', { valueAsNumber: true })} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => { setShowModal(false); setEditing(null); reset(); }}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
