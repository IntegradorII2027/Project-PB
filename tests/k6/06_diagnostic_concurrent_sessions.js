import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL =
  __ENV.BASE_URL || 'https://restaurantos-q2u4f.ondigitalocean.app';

const EMAIL = __ENV.K6_EMAIL;
const PASSWORD = __ENV.K6_PASSWORD;

export const options = {
  vus: 10,
  iterations: 10,
};

export default function () {
  const vu = __VU;

  const csrfResponse = http.get(`${BASE_URL}/api/csrf-token`, {
    tags: { endpoint: 'csrf-token' },
  });

  let csrfToken;

  try {
    csrfToken = csrfResponse.json('csrfToken');
  } catch {
    console.error(
      `VU ${vu} | CSRF FALLIDO | status=${csrfResponse.status} | body=${csrfResponse.body}`
    );
    return;
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
      tags: { endpoint: 'login' },
    }
  );

  check(loginResponse, {
    'login responde 200': (res) => res.status === 200,
  });

  if (loginResponse.status !== 200) {
    console.error(
      `VU ${vu} | LOGIN FALLIDO | status=${loginResponse.status} | body=${loginResponse.body}`
    );
    return;
  }

  console.log(`VU ${vu} | LOGIN CORRECTO | status=200`);

  // Damos tiempo para que los demás usuarios también inicien sesión.
  sleep(2);

  const meResponse = http.get(`${BASE_URL}/api/auth/me`, {
    tags: { endpoint: 'auth-me' },
  });

  check(meResponse, {
    '/auth/me responde 200': (res) => res.status === 200,
  });

  if (meResponse.status === 200) {
    console.log(`VU ${vu} | SESION VIGENTE | status=200`);
  } else {
    console.error(
      `VU ${vu} | SESION INVALIDA | status=${meResponse.status} | body=${meResponse.body}`
    );
  }
}