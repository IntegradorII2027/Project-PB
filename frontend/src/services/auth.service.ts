import { api } from './api';
import type { AuthUser } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  me: async (): Promise<AuthUser> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
