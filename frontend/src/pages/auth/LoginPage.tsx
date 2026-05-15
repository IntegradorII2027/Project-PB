import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Utensils, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await authService.login(data.email, data.password);
      setAuth(res.user, res.accessToken);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex flex-col justify-center px-16 w-1/2"
        style={{
          background: 'linear-gradient(135deg, #E8590C 0%, #8B2500 50%, #0F0F0F 100%)',
        }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-l bg-white/10 flex items-center justify-center">
            <Utensils size={20} className="text-white" />
          </div>
          <span className="text-white text-2xl font-bold">RestaurantOS</span>
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
          Sistema de<br />Gestión<br />Inteligente
        </h1>
        <p className="text-white/60 text-sm tracking-widest uppercase">
          Pedidos · Inventario · Reportes · Cocina
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-8 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-l p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Iniciar Sesión</h2>
              <p className="text-sm text-muted-foreground mt-1">Ingresa tu cuenta para continuar</p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 bg-error-bg border border-error/20 rounded-m px-3 py-2.5 text-sm text-error">
                <TriangleAlert size={14} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="admin@restaurante.com"
                  {...register('email')}
                  className="w-full bg-muted border border-border rounded-m px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full bg-muted border border-border rounded-m px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Ingresar al Sistema
              </Button>
            </form>

            <p className="text-center text-xs text-primary hover:underline cursor-pointer mt-4">
              ¿Olvidaste tu contraseña?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
