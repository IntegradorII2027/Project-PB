import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const response = http.get(
    'https://restaurantos-q2u4f.ondigitalocean.app/api/health'
  );

  check(response, {
    'status es 200': (res) => res.status === 200,
    'respuesta indica estado ok': (res) => {
      try {
        return res.json('status') === 'ok';
      } catch {
        return false;
      }
    },
  });
}