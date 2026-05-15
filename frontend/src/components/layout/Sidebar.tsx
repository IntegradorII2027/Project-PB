import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Grid2X2, ClipboardList, ChefHat, Utensils,
  Package, BarChart2, Users, Settings, LogOut,
} from 'lucide-react';
import { cn, getInitials, rolLabel } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',     roles: ['ADMIN', 'MESERO', 'CAJERO'] },
  { to: '/mesas',     icon: Grid2X2,         label: 'Mesas',         roles: ['ADMIN', 'MESERO'] },
  { to: '/pedidos',   icon: ClipboardList,   label: 'Pedidos',       roles: ['ADMIN', 'MESERO'] },
  { to: '/cocina',    icon: ChefHat,         label: 'Cocina',        roles: ['ADMIN', 'COCINERO'] },
  { to: '/menu',      icon: Utensils,        label: 'Menú',          roles: ['ADMIN'] },
  { to: '/inventario',icon: Package,         label: 'Inventario',    roles: ['ADMIN'] },
  { to: '/reportes',  icon: BarChart2,       label: 'Reportes',      roles: ['ADMIN', 'CAJERO'] },
  { to: '/usuarios',  icon: Users,           label: 'Usuarios',      roles: ['ADMIN'] },
  { to: '/configuracion', icon: Settings,    label: 'Configuración', roles: ['ADMIN'] },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const visibleNav = navItems.filter((item) => user && item.roles.includes(user.rol));

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
    toast.success('Sesión cerrada');
  };

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-sidebar-bg border-r border-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-m bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Utensils size={18} className="text-primary" />
        </div>
        <span className="font-bold text-foreground text-base tracking-wide">RestaurantOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" aria-label="Navegación principal">
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                /* texto e iconos más grandes para baja visión */
                'flex items-center gap-3 px-3 py-3 rounded-m text-[15px] font-medium transition-all',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer / perfil */}
      <div className="border-t border-border p-3">
        <div
          className="flex items-center gap-3 px-2 py-2.5 rounded-m hover:bg-muted transition-colors cursor-pointer group"
          onClick={() => navigate('/perfil')}
          role="button"
          aria-label="Ver perfil"
        >
          <div className="w-9 h-9 rounded-pill bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {user ? getInitials(user.nombre) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.nombre}</p>
            <p className="text-xs text-muted-foreground">{user ? rolLabel(user.rol) : ''}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[var(--color-error)] transition-all p-1.5 rounded"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
