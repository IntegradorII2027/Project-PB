import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL =
  __ENV.BASE_URL || 'https://restaurantos-q2u4f.ondigitalocean.app';

const EMAIL = __ENV.K6_EMAIL;
const PASSWORD = __ENV.K6_PASSWORD;

const SUCURSAL_ID =
  __ENV.K6_SUCURSAL_ID || 'k6v1-sucursal-1';

const responseBytes = new Trend('pedidos_response_bytes');

let cookieConfigured = false;

export const options = {
  noCookiesReset: true,

  vus: 1,
  iterations: 5,

  thresholds: {
    checks: ['rate==1'],
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<5000'],
  },
};

export function setup() {
  if (!EMAIL || !PASSWORD) {
    fail('Faltan K6_EMAIL o K6_PASSWORD.');
  }

  const csrfResponse = http.get(`${BASE_URL}/api/csrf-token`);

  if (csrfResponse.status !== 200) {
    fail(`CSRF falló. Status: ${csrfResponse.status}`);
  }

  const csrfToken = csrfResponse.json('csrfToken');

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
    }
  );

  if (loginResponse.status !== 200) {
    console.error(loginResponse.body);
    fail(`Login falló. Status: ${loginResponse.status}`);
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
  if (cookieConfigured) return;

  http.cookieJar().set(BASE_URL, 'token', token, {
    path: '/',
    secure: true,
  });

  cookieConfigured = true;
}

export default function (data) {
  configureAuthentication(data.token);

  const response = http.get(
    `${BASE_URL}/api/pedidos?sucursalId=${SUCURSAL_ID}`,
    {
      tags: {
        endpoint: 'pedidos-historial',
        phase: 'volume-baseline',
      },
      timeout: '30s',
    }
  );

  responseBytes.add(response.body?.length ?? 0);

  let cantidad = -1;

  try {
    const body = response.json();
    cantidad = Array.isArray(body) ? body.length : -1;
  } catch {
    cantidad = -1;
  }

  check(response, {
    'pedidos responde 200': (res) => res.status === 200,
    'respuesta contiene 6000 pedidos': () => cantidad === 6000,
  });

  console.log(
    `status=${response.status} ` +
    `duracion_ms=${response.timings.duration.toFixed(2)} ` +
    `bytes=${response.body?.length ?? 0} ` +
    `pedidos=${cantidad}`
  );

  sleep(2);
}
