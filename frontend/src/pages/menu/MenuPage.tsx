import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { menuService } from '../../services/menu.service';
import { formatCurrency } from '../../utils/cn';
import type { Producto, Categoria } from '../../types';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
  precio: z.number({ invalid_type_error: 'Precio requerido' }).positive('Debe ser positivo'),
  categoriaId: z.string().min(1, 'Selecciona una categoría'),
  disponible: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function MenuPage() {
  const qc = useQueryClient();
  const [catActiva, setCatActiva] = useState('todas');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Producto | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: productos = [] } = useQuery<Producto[]>({ queryKey: ['productos'], queryFn: menuService.getProductos });
  const { data: categorias = [] } = useQuery<Categoria[]>({ queryKey: ['categorias'], queryFn: menuService.getCategorias });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { disponible: true },
  });

  const save = useMutation({
    mutationFn: (data: FormData) => editing
      ? menuService.updateProducto(editing.id, data)
      : menuService.createProducto(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      setShowModal(false); setEditing(null); reset();
      toast.success(editing ? 'Producto actualizado' : 'Producto creado');
    },
    onError: () => toast.error('Error al guardar producto'),
  });

  const del = useMutation({
    mutationFn: (id: string) => menuService.deleteProducto(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['productos'] }); toast.success('Producto eliminado'); },
    onError: () => toast.error('Error al eliminar'),
  });

  const openEdit = (p: Producto) => {
    setEditing(p);
    reset({ nombre: p.nombre, descripcion: p.descripcion ?? '', precio: Number(p.precio), categoriaId: p.categoriaId, disponible: p.disponible });
    setShowModal(true);
  };

  const visible = productos.filter((p) =>
    (catActiva === 'todas' || p.categoriaId === catActiva) &&
    (!search || p.nombre.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto..."
              className="bg-muted border border-border rounded-m pl-8 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-52" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCatActiva('todas')}
              className={cn('px-3 py-1.5 rounded-pill text-xs font-medium', catActiva === 'todas' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>Todas</button>
            {categorias.map((c) => (
              <button key={c.id} onClick={() => setCatActiva(c.id)}
                className={cn('px-3 py-1.5 rounded-pill text-xs font-medium', catActiva === c.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); reset({ disponible: true }); setShowModal(true); }}>
          <Plus size={14} /> Nuevo Producto
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4">
        {visible.map((prod) => (
          <div key={prod.id} className="bg-card border border-border rounded-l overflow-hidden flex flex-col">
            <div className="h-28 bg-muted flex items-center justify-center text-xs text-muted-foreground">Sin imagen</div>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground line-clamp-2 flex-1">{prod.nombre}</p>
                <StatusBadge variant={prod.disponible ? 'activo' : 'inactivo'} />
              </div>
              {prod.descripcion && <p className="text-xs text-muted-foreground line-clamp-2">{prod.descripcion}</p>}
              <p className="text-primary font-bold">{formatCurrency(Number(prod.precio))}</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => openEdit(prod)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-muted text-sm text-muted-foreground hover:text-foreground rounded-m transition-colors">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => del.mutate(prod.id)} className="px-3 py-1.5 bg-error-bg text-error text-sm rounded-m hover:bg-[#2E1210] transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); reset(); }}
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nombre</label>
            <input {...register('nombre')} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            {errors.nombre && <p className="text-xs text-error mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Categoría</label>
            <select {...register('categoriaId')} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
              <option value="">Seleccionar...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {errors.categoriaId && <p className="text-xs text-error mt-1">{errors.categoriaId.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Descripción</label>
            <textarea {...register('descripcion')} rows={2} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Precio (S/)</label>
            <input type="number" step="0.01" {...register('precio', { valueAsNumber: true })}
              className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            {errors.precio && <p className="text-xs text-error mt-1">{errors.precio.message}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="disponible" {...register('disponible')} className="accent-primary" />
            <label htmlFor="disponible" className="text-sm text-foreground">Disponible</label>
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
