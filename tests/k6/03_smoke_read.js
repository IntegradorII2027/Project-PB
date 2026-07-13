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
    fail('Faltan las variables K6_EMAIL o K6_PASSWORD.');
  }

  // 1. Obtener CSRF.
  const csrfResponse = http.get(`${BASE_URL}/api/csrf-token`, {
    tags: { endpoint: 'csrf-token' },
  });

  const csrfOk = check(csrfResponse, {
    'CSRF responde 200': (res) => res.status === 200,
    'CSRF devuelve token': (res) => {
      try {
        return Boolean(res.json('csrfToken'));
      } catch {
        return false;
      }
    },
  });

  if (!csrfOk) {
    fail(`No se pudo obtener CSRF. Status: ${csrfResponse.status}`);
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
  });

  if (!loginOk) {
    console.error(
      `Login fallido. Status: ${loginResponse.status}. Body: ${loginResponse.body}`
    );

    fail('No fue posible iniciar sesión.');
  }

  // 3. Consultar endpoints de lectura.
  const endpoints = [
    {
      name: 'mesas',
      url: `${BASE_URL}/api/mesas`,
    },
    {
      name: 'categorias',
      url: `${BASE_URL}/api/categorias`,
    },
    {
      name: 'productos',
      url: `${BASE_URL}/api/productos`,
    },
    {
      name: 'pedidos-activos',
      url: `${BASE_URL}/api/pedidos/activos`,
    },
  ];

  for (const endpoint of endpoints) {
    const response = http.get(endpoint.url, {
      tags: {
        endpoint: endpoint.name,
      },
    });

    check(response, {
      [`${endpoint.name} responde 200`]: (res) => res.status === 200,

      [`${endpoint.name} devuelve JSON valido`]: (res) => {
        if (res.status !== 200) {
          return false;
        }

        const contentType = res.headers['Content-Type'] || '';

        if (!contentType.includes('application/json')) {
          return false;
        }

        try {
          res.json();
          return true;
        } catch {
          return false;
        }
      },
    });

    if (response.status !== 200) {
      console.error(
        `${endpoint.name} falló. Status: ${response.status}. Body: ${response.body}`
      );
    }
  }
}