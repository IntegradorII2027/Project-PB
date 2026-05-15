import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';
import { useRealtime } from '../../hooks/useRealtime';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/mesas': 'Gestión de Mesas',
  '/pedidos': 'Pedidos',
  '/pedidos/nuevo': 'Nuevo Pedido',
  '/cocina': 'Vista Cocina',
  '/menu': 'Gestión de Menú',
  '/inventario': 'Inventario',
  '/reportes': 'Reportes',
  '/caja': 'Registro de Pago',
  '/usuarios': 'Usuarios y Roles',
  '/configuracion': 'Configuración',
  '/perfil': 'Mi Perfil',
  '/notificaciones': 'Notificaciones',
};

export function AuthLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'RestaurantOS';

  // Suscripción global a cambios en tiempo real (Supabase Realtime)
  useRealtime();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
