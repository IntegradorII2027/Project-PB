import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL =
  __ENV.BASE_URL || 'https://restaurantos-q2u4f.ondigitalocean.app';

const EMAIL = __ENV.K6_EMAIL;
const PASSWORD = __ENV.K6_PASSWORD;

export const options = {
  vus: 2,
  iterations: 10,
};

export default function () {
  const csrfResponse = http.get(`${BASE_URL}/api/csrf-token`);

  let csrfToken;

  try {
    csrfToken = csrfResponse.json('csrfToken');
  } catch {
    console.error(
      `CSRF inválido | status=${csrfResponse.status} | body=${csrfResponse.body}`
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
    }
  );

  const loginCorrecto = check(loginResponse, {
    'login responde 200': (res) => res.status === 200,
  });

  if (!loginCorrecto) {
    console.error(
      `LOGIN FALLIDO | status=${loginResponse.status} | body=${loginResponse.body}`
    );
  } else {
    console.log(`LOGIN CORRECTO | status=${loginResponse.status}`);
  }

  sleep(1);
}