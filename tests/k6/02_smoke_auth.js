import http from 'k6/http';
import { check, fail } from 'k6';

const BASE_URL =
  __ENV.BASE_URL || 'https://restaurantos-q2u4f.ondigitalocean.app';

const EMAIL = __ENV.K6_EMAIL;
const PASSWORD = __ENV.K6_PASSWORD;

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    checks: ['rate==1'],
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  if (!EMAIL || !PASSWORD) {
    fail(
      'Faltan K6_EMAIL o K6_PASSWORD. Debes enviarlas como variables de entorno.'
    );
  }

  // 1. Obtener token CSRF y su cookie.
  const csrfResponse = http.get(`${BASE_URL}/api/csrf-token`, {
    tags: { endpoint: 'csrf-token' },
  });

  const csrfOk = check(csrfResponse, {
    'CSRF responde 200': (res) => res.status === 200,
    'CSRF devuelve un token': (res) => {
      try {
        return Boolean(res.json('csrfToken'));
      } catch {
        return false;
      }
    },
  });

  if (!csrfOk) {
    fail(`No se pudo obtener el token CSRF. Status: ${csrfResponse.status}`);
  }

  const csrfToken = csrfResponse.json('csrfToken');

  // 2. Iniciar sesión.
  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      tags: { endpoint: 'login' },
    }
  );

  const loginOk = check(loginResponse, {
    'login responde 200': (res) => res.status === 200,
    'login devuelve usuario': (res) => {
      try {
        return Boolean(res.json('user.id'));
      } catch {
        return false;
      }
    },
    'login devuelve rol MESERO': (res) => {
      try {
        return res.json('user.rol') === 'MESERO';
      } catch {
        return false;
      }
    },
  });

  if (!loginOk) {
    console.error(
      `Login fallido. Status: ${loginResponse.status}. Body: ${loginResponse.body}`
    );

    fail('No fue posible iniciar sesión con el usuario K6.');
  }

  // 3. Consultar la sesión actual.
  const meResponse = http.get(`${BASE_URL}/api/auth/me`, {
    tags: { endpoint: 'auth-me' },
  });

  check(meResponse, {
    '/auth/me responde 200': (res) => res.status === 200,
    '/auth/me corresponde al usuario K6': (res) => {
      try {
        return res.json('email') === EMAIL;
      } catch {
        return false;
      }
    },
  });

  // 4. Cerrar sesión.
  const logoutResponse = http.post(
    `${BASE_URL}/api/auth/logout`,
    null,
    {
      headers: {
        'CSRF-Token': csrfToken,
      },
      tags: { endpoint: 'logout' },
    }
  );

  check(logoutResponse, {
    'logout responde correctamente': (res) =>
      res.status === 200 || res.status === 204,
  });

  // 5. Confirmar que la sesión realmente terminó.
  const meAfterLogoutResponse = http.get(`${BASE_URL}/api/auth/me`, {
    tags: { endpoint: 'auth-me-after-logout' },
    responseCallback: http.expectedStatuses(401),
  });

  check(meAfterLogoutResponse, {
    '/auth/me después del logout responde 401': (res) =>
      res.status === 401,
  });
}