import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const rateLimitedResponses = new Counter('rate_limited_responses');

const BASE_URL =
  __ENV.BASE_URL || 'https://restaurantos-q2u4f.ondigitalocean.app';

const EMAIL = __ENV.K6_EMAIL;
const PASSWORD = __ENV.K6_PASSWORD;

let cookieConfigured = false;

export const options = {
  noCookiesReset: true,

  scenarios: {
    lectura_gradual: {
      executor: 'ramping-vus',
      startVUs: 0,

      stages: [
        { duration: '30s', target: 30 },
        { duration: '45s', target: 30 },

        { duration: '30s', target: 60 },
        { duration: '45s', target: 60 },

        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },

        { duration: '30s', target: 0 },
      ],

      gracefulRampDown: '20s',
    },
  },

  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    rate_limited_responses: ['count==0'],
  },
};

export function setup() {
  if (!EMAIL || !PASSWORD) {
    fail('Faltan las variables K6_EMAIL o K6_PASSWORD.');
  }

  const csrfResponse = http.get(`${BASE_URL}/api/csrf-token`, {
    tags: {
      endpoint: 'csrf-token',
      phase: 'setup',
    },
  });

  const csrfOk = check(csrfResponse, {
    'setup: CSRF responde 200': (res) => res.status === 200,
  });

  if (!csrfOk) {
    fail(`No se pudo obtener CSRF. Status: ${csrfResponse.status}`);
  }

  let csrfToken;

  try {
    csrfToken = csrfResponse.json('csrfToken');
  } catch {
    fail('La respuesta CSRF no contiene JSON válido.');
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
        phase: 'setup',
      },
    }
  );

  const loginOk = check(loginResponse, {
    'setup: login responde 200': (res) => res.status === 200,
  });

  if (!loginOk) {
    console.error(
      `Login fallido | status=${loginResponse.status} | body=${loginResponse.body}`
    );

    fail('No fue posible iniciar sesión durante setup.');
  }

  const tokenCookies = loginResponse.cookies.token;

  if (!tokenCookies || tokenCookies.length === 0) {
    fail('El login no devolvió la cookie token.');
  }

  return {
    token: tokenCookies[0].value,
  };
}

function configureAuthentication(token) {
  if (cookieConfigured) {
    return;
  }

  const jar = http.cookieJar();

  jar.set(BASE_URL, 'token', token, {
    path: '/',
    secure: true,
  });

  cookieConfigured = true;
}

function consultarEndpoint(name, path) {
  const response = http.get(`${BASE_URL}${path}`, {
    tags: {
      endpoint: name,
      operation: 'lectura',
    },
  });

  if (response.status === 429) {
    rateLimitedResponses.add(1);

    console.error(
      `${name} LIMITADO | status=429 | body=${response.body}`
    );
  } else if (response.status !== 200) {
    console.error(
      `${name} FALLIDO | status=${response.status} | body=${response.body}`
    );
  }

  check(response, {
    [`${name} responde 200`]: (res) => res.status === 200,
  });
}

export default function (data) {
  configureAuthentication(data.token);

  consultarEndpoint('mesas', '/api/mesas');

  sleep(0.5);

  consultarEndpoint('categorias', '/api/categorias');

  sleep(0.5);

  consultarEndpoint('productos', '/api/productos');

  sleep(0.5);

  consultarEndpoint('pedidos-activos', '/api/pedidos/activos');

  sleep(1 + Math.random() * 2);
}