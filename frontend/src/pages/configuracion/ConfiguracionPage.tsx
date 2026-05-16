import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, User, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function ConfiguracionPage() {
  const { user, setAuth, token } = useAuthStore();

  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirm, setPassConfirm] = useState('');

  const actualizarPerfil = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/usuarios/me', { nombre });
      return data;
    },
    onSuccess: (data) => {
      if (user && token) setAuth({ ...user, nombre: data.nombre }, token);
      toast.success('Perfil actualizado');
    },
    onError: () => toast.error('Error al actualizar perfil'),
  });

  const cambiarPassword = useMutation({
    mutationFn: async () => {
      await api.patch('/usuarios/me/password', {
        passwordActual: passActual,
        passwordNueva: passNueva,
      });
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada');
      setPassActual('');
      setPassNueva('');
      setPassConfirm('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al cambiar contraseña'),
  });

  const handlePerfilSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { toast.error('El nombre no puede estar vacío'); return; }
    actualizarPerfil.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passNueva.length < 6) { toast.error('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (passNueva !== passConfirm) { toast.error('Las contraseñas no coinciden'); return; }
    cambiarPassword.mutate();
  };

  return (
    <div className="max-w-lg space-y-6">

      {/* Perfil */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-primary" />
          <h3 className="font-semibold text-text">Información personal</h3>
        </div>

        <form onSubmit={handlePerfilSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text block mb-1.5">Nombre</label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text block mb-1.5">Email</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-muted bg-background cursor-not-allowed"
            />
            <p className="text-xs text-text-muted mt-1">El email no se puede cambiar.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-text block mb-1.5">Rol</label>
            <input
              value={user?.rol ?? ''}
              disabled
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-muted bg-background cursor-not-allowed"
            />
          </div>

          <Button type="submit" loading={actualizarPerfil.isPending} className="flex items-center gap-2">
            <Save size={15} /> Guardar cambios
          </Button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={18} className="text-primary" />
          <h3 className="font-semibold text-text">Cambiar contraseña</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text block mb-1.5">Contraseña actual</label>
            <input
              type="password"
              value={passActual}
              onChange={e => setPassActual(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text block mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              value={passNueva}
              onChange={e => setPassNueva(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text block mb-1.5">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={passConfirm}
              onChange={e => setPassConfirm(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" loading={cambiarPassword.isPending}>
            Actualizar contraseña
          </Button>
        </form>
      </div>

      {/* Info sucursal (si no es dueño) */}
      {user?.sucursal && (
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-text mb-4">Tu sucursal</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Nombre</span>
              <span className="font-medium text-text">{user.sucursal.nombre}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
