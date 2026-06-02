import { api } from './api';
import type { AuthUser } from '../types';

const getCsrfToken = async (): Promise<string> => {
  const { data } = await api.get('/csrf-token');

  return data.csrfToken;
};

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<AuthUser> => {

    const csrfToken =
      await getCsrfToken();

    const { data } =
      await api.post(
        '/auth/login',
        {
          email,
          password,
        },
        {
          headers: {
            'CSRF-Token':
              csrfToken,
          },
        }
      );

    return data.user;
  },

  me: async (): Promise<AuthUser> => {
    const { data } =
      await api.get('/auth/me');

    return data;
  },

  logout: async (): Promise<void> => {
    const csrfToken =
      await getCsrfToken();

    await api.post(
      '/auth/logout',
      {},
      {
        headers: {
          'CSRF-Token':
            csrfToken,
        },
      }
    );
  },
};