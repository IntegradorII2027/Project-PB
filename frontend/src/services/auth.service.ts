import { api } from './api';
import type { AuthUser } from '../types';

let csrfToken: string | null = null;

const initCsrf = async () => {
  const { data } = await api.get('/csrf-token');
  csrfToken = data.csrfToken;
};

export const authService = {
  init: initCsrf,

  login: async (email: string, password: string): Promise<AuthUser> => {
    if (!csrfToken) await initCsrf();

    const { data } = await api.post(
      '/auth/login',
      { email, password },
      {
        headers: {
          'CSRF-Token': csrfToken!,
        },
      }
    );

    return data.user;
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    if (!csrfToken) await initCsrf();

    await api.post(
      '/auth/logout',
      {},
      {
        headers: {
          'CSRF-Token': csrfToken!,
        },
      }
    );
  },
};