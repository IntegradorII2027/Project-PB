import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

// Adjuntar token JWT en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expira (401) o la sucursal se cierra en mid-sesión (403), redirigir al login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    if (status === 403) {
      const msg = error.response?.data?.error ?? '';
      // Solo redirigir si es por sucursal cerrada (no por falta de permisos de rol)
      if (msg.includes('cerrada')) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
