import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { reportesService } from '../../services/reportes.service';
import { getInitials, rolLabel, rolColor, formatDate } from '../../utils/cn';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function PerfilPage() {
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();

  const { register: regInfo, handleSubmit: handleInfo, formState: { isSubmitting: savingInfo } } = useForm({
    defaultValues: { nombre: user?.nombre ?? '', email: user?.email ?? '' },
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { isSubmitting: savingPwd } } = useForm({
    defaultValues: { passwordActual: '', passwordNuevo: '', confirmar: '' },
  });

  const saveInfo = useMutation({
    mutationFn: (data: { nombre: string; email: string }) => reportesService.updatePerfil(data),
    onSuccess: (updated) => {
      if (setUser) setUser({ ...user!, nombre: updated.nombre, email: updated.email });
      toast.success('Perfil actualizado');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al guardar'),
  });

  const savePwd = useMutation({
    mutationFn: (data: { passwordActual: string; passwordNuevo: string }) => reportesService.changePassword(data),
    onSuccess: () => { resetPwd(); toast.success('Contraseña actualizada'); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al cambiar contraseña'),
  });

  const handlePwdSubmit = (data: any) => {
    if (data.passwordNuevo !== data.confirmar) { toast.error('Las contraseñas no coinciden'); return; }
    savePwd.mutate({ passwordActual: data.passwordActual, passwordNuevo: data.passwordNuevo });
  };

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
    toast.success('Sesión cerrada');
  };

  return (
    <div className="flex gap-6">
      {/* Left Card */}
      <div className="w-72 flex-shrink-0 space-y-4">
        <div className="bg-card border border-border rounded-l p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-pill bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {user ? getInitials(user.nombre) : '?'}
          </div>
          <div>
            <p className="font-semibold text-foreground text-base">{user?.nombre}</p>
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1', user ? rolColor(user.rol) : '')}>
              {user ? rolLabel(user.rol) : ''}
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1 w-full text-left">
            <p>{user?.restaurante?.nombre}</p>
            {user?.creadoEn && <p>Desde {formatDate(user.creadoEn)}</p>}
          </div>
        </div>
      </div>

      {/* Right Forms */}
      <div className="flex-1 space-y-4">
        {/* Info personal */}
        <div className="bg-card border border-border rounded-l p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Información personal</h3>
          <form onSubmit={handleInfo((d) => saveInfo.mutate(d))} className="space-y-4 max-w-sm">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Nombre</label>
              <input {...regInfo('nombre', { required: true })} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <input type="email" {...regInfo('email', { required: true })} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
            <Button type="submit" loading={savingInfo || saveInfo.isPending}>Guardar cambios</Button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-card border border-border rounded-l p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Cambiar contraseña</h3>
          <form onSubmit={handlePwd(handlePwdSubmit)} className="space-y-4 max-w-sm">
            {[
              { name: 'passwordActual', label: 'Contraseña actual' },
              { name: 'passwordNuevo', label: 'Nueva contraseña' },
              { name: 'confirmar', label: 'Confirmar contraseña' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
                <input type="password" {...regPwd(name as any, { required: true })}
                  className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
            ))}
            <Button type="submit" variant="secondary" loading={savingPwd || savePwd.isPending}>Cambiar contraseña</Button>
          </form>
        </div>

        <div>
          <Button variant="danger" onClick={handleLogout}>Cerrar sesión</Button>
        </div>
      </div>
    </div>
  );
}
