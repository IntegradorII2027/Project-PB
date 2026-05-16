import { api } from './api';
import type { Sucursal } from '../types';

export const sucursalesService = {
  getAll: async (): Promise<Sucursal[]> => {
    const { data } = await api.get('/sucursales');
    return data;
  },
  getById: async (id: string): Promise<Sucursal> => {
    const { data } = await api.get(`/sucursales/${id}`);
    return data;
  },
  create: async (payload: Partial<Sucursal>): Promise<Sucursal> => {
    const { data } = await api.post('/sucursales', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Sucursal>): Promise<Sucursal> => {
    const { data } = await api.patch(`/sucursales/${id}`, payload);
    return data;
  },
  toggle: async (id: string): Promise<{ abierto: boolean; mensaje: string }> => {
    const { data } = await api.patch(`/sucursales/${id}/toggle`);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sucursales/${id}`);
  },
};
