import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) { setError('Completa todos los campos'); return; }
    setLoading(true);
    try {
      const { user, token } = await authService.login(email, password);
      setAuth(user, token);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Credenciales incorrectas';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
            <UtensilsCrossed size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">RestaurantOS</h1>
          <p className="text-text-muted text-sm mt-1">Sistema de gestión para restaurantes</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-8">
          <h2 className="text-lg font-semibold text-text mb-6">Iniciar sesión</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text block mb-1.5" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text block mb-1.5" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2.5">
                  <span>⚠</span>
                  {error}
                </div>
            )}
            <Button type="button" onClick={handleSubmit} className="w-full mt-2" size="lg" loading={loading}>
              Entrar
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Si la sucursal está cerrada, contacta al administrador.
        </p>
      </div>
    </div>
  );
}
