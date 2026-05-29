import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthLayout } from './components/layout/AuthLayout';
import LoginPage from './pages/auth/LoginPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import SucursalesPage from './pages/sucursales/SucursalesPage';
import SucursalDetallePage from './pages/sucursales/SucursalDetallePage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import ConfiguracionPage from './pages/configuracion/ConfiguracionPage';

import PedidosCocinaPage from './pages/pedidos-cocina/PedidosCocinaPage';
import MesasPageMesero from './pages/mesero/MesasPage';
import PedidoPage from './pages/mesero/PedidoPage';
import PedidosActivosPage from './pages/mesero/PedidosActivosPage';

import AsistenciasPage from './pages/administrador/asistencias/AsistenciasPages';
import MenuPage from './pages/administrador/menu/MenuPage';
import ReportesPage from './pages/reportes/ReportesPage';
import MesasPage from './pages/administrador/Mesas/MesasPage';
import PedidosPage from './pages/administrador/pedidos/PedidosPage';

import { useAuthStore } from './store/authStore';
import type { AuthUser } from './types';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function RequireAuth({ user }: { user: AuthUser | null }) {
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireRole({
  user,
  roles,
  children,
}: {
  user: AuthUser | null;
  roles: AuthUser['rol'][];
  children: React.ReactNode;
}) {
  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function HomeRedirect({ user }: { user: AuthUser | null }) {
  if (!user) return <Navigate to="/login" replace />;

  if (user.rol === 'COCINERO') {
    return <Navigate to="/pedidos-cocina" replace />;
  }

  if (user.rol === 'MESERO') {
    return <Navigate to="/mesero/mesas" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { user, initAuth, listenToAuthEvents } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    initAuth().finally(() => setAuthReady(true));
  }, [initAuth]);

  useEffect(() => {
    const unsubscribe = listenToAuthEvents();
    return unsubscribe;
  }, [listenToAuthEvents]);

  if (!authReady) return null;

function RequireMesero({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user?.rol !== 'MESERO') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function RequireSoloAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user?.rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />

      <Route element={<AuthLayout />}>

        <Route element={<RequireAuth user={user} />}>

          <Route index element={<HomeRedirect user={user} />} />

          <Route
            path="/dashboard"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <DashboardPage />
              </RequireRole>
            }
          />

          <Route
            path="/sucursales"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <SucursalesPage />
              </RequireRole>
            }
          >
            <Route
              index
              element={<HomeRedirect />}
            />

            <Route
              path="/dashboard"
              element={
                <RequireAdmin>
                  <DashboardPage />
                </RequireAdmin>
              }
            />

            <Route
              path="/sucursales"
              element={
                <RequireDueno>
                  <SucursalesPage />
                </RequireDueno>
              }
            />

            <Route
              path="/sucursales/:id"
              element={
                <RequireDueno>
                  <SucursalDetallePage />
                </RequireDueno>
              }
            />

            <Route
              path="/usuarios"
              element={
                <RequireAdmin>
                  <UsuariosPage />
                </RequireAdmin>
              }
            />

            <Route
              path="/mesero/mesas"
              element={
                <RequireMesero>
                  <MesasPageMesero />
                </RequireMesero>
              }
            />
            <Route
              path="/mesero/pedido"
              element={
                <RequireMesero>
                  <PedidoPage />
                </RequireMesero>
              }
            />

            <Route
              path="/mesero/pedidos"
              element={
                <RequireMesero>
                  <PedidosActivosPage />
                </RequireMesero>
              }
            />
        
            <Route
              path="/pedidos-cocina"
              element={
                <RequireCocinero>
                  <PedidosCocinaPage />
                </RequireCocinero>
              }
            />

            <Route
              path="/configuracion"
              element={<ConfiguracionPage />}
            />

            <Route
              path="/asistencias"
              element={
                <RequireSoloAdmin>
                  <AsistenciasPage />
                </RequireSoloAdmin>
              }
            />

            <Route
              path="/menu"
              element={
                <RequireSoloAdmin>
                  <MenuPage />
                </RequireSoloAdmin>
              }
            />

            <Route
              path="/reportes"
              element={
                <RequireAdmin>
                  <ReportesPage />
                </RequireAdmin>
              }
            />

            <Route
              path="/mesas"
              element={
                <RequireSoloAdmin>
                  <MesasPage />
                </RequireSoloAdmin>
              }
            />

            <Route
              path="/pedidos"
              element={
                <RequireSoloAdmin>
                  <PedidosPage />
                </RequireSoloAdmin>
              }
            />
          </Route>

          <Route
            path="/sucursales/:id"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <SucursalDetallePage />
              </RequireRole>
            }
          />

          <Route
            path="/usuarios"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <UsuariosPage />
              </RequireRole>
            }
          />

          <Route
            path="/mesero/mesas"
            element={
              <RequireRole user={user} roles={['MESERO']}>
                <MesasPageMesero />
              </RequireRole>
            }
          />

          <Route
            path="/mesero/pedido"
            element={
              <RequireRole user={user} roles={['MESERO']}>
                <PedidoPage />
              </RequireRole>
            }
          />

          <Route
            path="/mesero/pedidos"
            element={
              <RequireRole user={user} roles={['MESERO']}>
                <PedidosActivosPage />
              </RequireRole>
            }
          />

          <Route
            path="/pedidos-cocina"
            element={
              <RequireRole user={user} roles={['COCINERO']}>
                <PedidosCocinaPage />
              </RequireRole>
            }
          />

          <Route
            path="/configuracion"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN', 'MESERO', 'COCINERO']}>
                <ConfiguracionPage />
              </RequireRole>
            }
          />

          <Route
            path="/asistencias"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <AsistenciasPage />
              </RequireRole>
            }
          />

          <Route path="*" element={<HomeRedirect user={user} />} />

          <Route
            path="/menu"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <MenuPage />
              </RequireRole>
            }
          />

          <Route
            path="/reportes"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <ReportesPage />
              </RequireRole>
            }
          />

          <Route
            path="/mesas"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <MesasPage />
              </RequireRole>
            }
          />

          <Route
            path="/pedidos"
            element={
              <RequireRole user={user} roles={['DUENO', 'ADMIN']}>
                <PedidosPage />
              </RequireRole>
            }
          />
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            borderRadius: '10px',
          },
        }}
      />
    </QueryClientProvider>
  );
}