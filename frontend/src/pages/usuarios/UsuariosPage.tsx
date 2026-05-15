import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableWrapper, Tr, Td } from '../../components/shared/TableWrapper';
import { reportesService } from '../../services/reportes.service';
import { getInitials, rolColor, rolLabel, formatDate } from '../../utils/cn';
import type { Usuario } from '../../types';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const ROLES = ['ADMIN', 'MESERO', 'COCINERO', 'CAJERO'];

export default function UsuariosPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroRol, setFiltroRol] = useState('');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data: usuarios = [], isLoading } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: reportesService.getUsuarios,
  });

  const save = useMutation({
    mutationFn: (data: any) => editing
      ? reportesService.updateUsuario(editing.id, data)
      : reportesService.createUsuario(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      setShowModal(false); setEditing(null); reset();
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al guardar'),
  });

  const del = useMutation({
    mutationFn: (id: string) => reportesService.deleteUsuario(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); toast.success('Usuario desactivado'); },
    onError: () => toast.error('Error al desactivar'),
  });

  const openEdit = (u: Usuario) => {
    setEditing(u);
    reset({ nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo });
    setShowModal(true);
  };

  const visibles = filtroRol ? usuarios.filter((u) => u.rol === filtroRol) : usuarios;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltroRol('')}
            className={cn('px-3 py-1.5 rounded-pill text-xs font-medium', !filtroRol ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
            Todos
          </button>
          {ROLES.map((r) => (
            <button key={r} onClick={() => setFiltroRol(r)}
              className={cn('px-3 py-1.5 rounded-pill text-xs font-medium transition-colors', filtroRol === r ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>
              {rolLabel(r)}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); reset({ activo: true }); setShowModal(true); }}>
          <UserPlus size={14} /> Nuevo Usuario
        </Button>
      </div>

      <TableWrapper
        headers={['Usuario', 'Email', 'Rol', 'Estado', 'Creado', 'Acciones']}
        isEmpty={visibles.length === 0}
        emptyMessage={isLoading ? 'Cargando...' : 'Sin usuarios'}
      >
        {visibles.map((u) => (
          <Tr key={u.id}>
            <Td>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-pill bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {getInitials(u.nombre)}
                </div>
                <span className="font-medium text-foreground">{u.nombre}</span>
              </div>
            </Td>
            <Td className="text-muted-foreground">{u.email}</Td>
            <Td>
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', rolColor(u.rol))}>
                {rolLabel(u.rol)}
              </span>
            </Td>
            <Td><StatusBadge variant={u.activo ? 'activo' : 'inactivo'} /></Td>
            <Td className="text-muted-foreground text-xs">{formatDate(u.creadoEn)}</Td>
            <Td>
              <div className="flex gap-2">
                <button onClick={() => openEdit(u)} className="text-muted-foreground hover:text-primary"><Pencil size={14} /></button>
                <button onClick={() => del.mutate(u.id)} className="text-muted-foreground hover:text-error"><Trash2 size={14} /></button>
              </div>
            </Td>
          </Tr>
        ))}
      </TableWrapper>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); reset(); }}
        title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nombre completo</label>
            <input {...register('nombre', { required: true })} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input type="email" {...register('email', { required: true })} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
          </div>
          {!editing && (
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Contraseña temporal</label>
              <input type="password" {...register('password', { required: !editing })} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Rol</label>
            <select {...register('rol', { required: true })} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
              {ROLES.map((r) => <option key={r} value={r}>{rolLabel(r)}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activo" {...register('activo')} className="accent-primary" />
            <label htmlFor="activo" className="text-sm text-foreground">Activo</label>
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
