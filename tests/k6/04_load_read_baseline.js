import http from 'k6/http';
import { check, fail, sleep } from 'k6';

const BASE_URL =
  __ENV.BASE_URL || 'https://restaurantos-q2u4f.ondigitalocean.app';

const EMAIL = __ENV.K6_EMAIL;
const PASSWORD = __ENV.K6_PASSWORD;

// Cada usuario virtual mantiene su propia sesión y cookies.
let authenticated = false;

export const options = {
  noCookiesReset: true,
  
  scenarios: {
    lectura_gradual: {
      executor: 'ramping-vus',
      startVUs: 0,

      stages: [
        { duration: '30s', target: 1 },
        { duration: '30s', target: 1 },
        { duration: '30s', target: 5 },
        { duration: '1m', target: 5 },
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],

      gracefulRampDown: '20s',
    },
  },

  thresholds: {
    // Al menos 99 % de los checks deben aprobarse.
    checks: ['rate>0.99'],

    // Menos de 1 % de solicitudes HTTP fallidas.
    http_req_failed: ['rate<0.01'],

    // El 95 % de las solicitudes debe responder en menos de 1 segundo.
    http_req_duration: ['p(95)<1000'],
  },
};

function authenticate() {
  const csrfResponse = http.get(`${BASE_URL}/api/csrf-token`, {
    tags: {
      endpoint: 'csrf-token',
      operation: 'autenticacion',
    },
  });

  const csrfOk = check(csrfResponse, {
    'CSRF responde 200': (res) => res.status === 200,
  });

  if (!csrfOk) {
    return false;
  }

  let csrfToken;

  try {
    csrfToken = csrfResponse.json('csrfToken');
  } catch {
    return false;
  }

  if (!csrfToken) {
    return false;
  }

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
      tags: {
        endpoint: 'login',
        operation: 'autenticacion',
      },
    }
  );

  const loginOk = check(loginResponse, {
    'login responde 200': (res) => res.status === 200,
  });

  return loginOk;
}

function consultarEndpoint(name, path) {
  const response = http.get(`${BASE_URL}${path}`, {
    tags: {
      endpoint: name,
      operation: 'lectura',
    },
  });

  check(response, {
    [`${name} responde 200`]: (res) => res.status === 200,
  });

  if (response.status === 401) {
    // Permite volver a autenticar al usuario virtual
    // en una iteración posterior si su sesión expiró.
    authenticated = false;
  }
}

export default function () {
  if (!EMAIL || !PASSWORD) {
    fail('Faltan las variables K6_EMAIL o K6_PASSWORD.');
  }

  // Cada usuario virtual inicia sesión una sola vez.
  if (!authenticated) {
    authenticated = authenticate();

    if (!authenticated) {
      sleep(1);
      return;
    }
  }

  consultarEndpoint('mesas', '/api/mesas');

  sleep(0.5);

  consultarEndpoint('categorias', '/api/categorias');

  sleep(0.5);

  consultarEndpoint('productos', '/api/productos');

  sleep(0.5);

  consultarEndpoint('pedidos-activos', '/api/pedidos/activos');

  // Simula el tiempo que un usuario real observa la información.
  sleep(1 + Math.random() * 2);
}