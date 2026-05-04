/**
 * k6 Load Test — Band Manager API
 *
 * Instalación de k6:
 *   Windows (winget):  winget install k6 --source winget
 *   Windows (choco):   choco install k6
 *   macOS:             brew install k6
 *   Linux:             https://k6.io/docs/get-started/installation/
 *
 * Ejecución:
 *   k6 run tests/load/api-load-test.js
 *
 * Con variables de entorno:
 *   k6 run -e BASE_URL=http://192.168.1.10:3030 -e USERNAME=test -e PASSWORD=1234 tests/load/api-load-test.js
 *
 * Generar reporte HTML:
 *   k6 run --out html=tests/load/report.html tests/load/api-load-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ─── Métricas personalizadas ────────────────────────────────────────────────
const loginDuration = new Trend('login_duration', true);
const bandsListDuration = new Trend('bands_list_duration', true);
const instrumentsDuration = new Trend('instruments_duration', true);
const musiciansDuration = new Trend('musicians_list_duration', true);
const failedRequests = new Counter('failed_requests');
const errorRate = new Rate('error_rate');

// ─── Configuración de escenarios ─────────────────────────────────────────────
export const options = {
  scenarios: {
    // Smoke test: valida que la API funciona con 1 usuario
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { scenario: 'smoke' },
    },

    // Load test: carga normal con rampa de subida/bajada
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },  // Rampa de subida: 0 → 20 VUs
        { duration: '1m',  target: 20 },  // Mantener 20 VUs durante 1 minuto
        { duration: '20s', target: 0 },   // Rampa de bajada: 20 → 0 VUs
      ],
      startTime: '35s',  // Empieza después del smoke test
      tags: { scenario: 'load' },
    },

    // Stress test: encuentra el límite de la API
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },  // Subir a 50 VUs
        { duration: '30s', target: 100 }, // Subir a 100 VUs
        { duration: '30s', target: 150 }, // Subir a 150 VUs
        { duration: '30s', target: 0 },   // Bajar a 0
      ],
      startTime: '3m',  // Empieza después del load test
      tags: { scenario: 'stress' },
    },
  },

  // Umbrales de aceptación (SLOs)
  thresholds: {
    // El 95% de las peticiones deben responder en menos de 500ms
    http_req_duration: ['p(95)<500'],
    // Menos del 1% de las peticiones deben fallar
    http_req_failed: ['rate<0.01'],
    // Login debe ser rápido
    login_duration: ['p(95)<1000'],
    // El listado de bandas debe ser rápido
    bands_list_duration: ['p(95)<500'],
    // Tasa de error global
    error_rate: ['rate<0.05'],
  },
};

// ─── Configuración ───────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3030';
const TEST_USERNAME = __ENV.USERNAME || 'testuser';
const TEST_PASSWORD = __ENV.PASSWORD || 'testpassword';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ─── Setup: se ejecuta una vez antes de todos los VUs ────────────────────────
export function setup() {
  const loginPayload = JSON.stringify({
    username: TEST_USERNAME,
    password: TEST_PASSWORD,
  });

  const res = http.post(`${BASE_URL}/login/musician`, loginPayload, {
    headers: JSON_HEADERS,
  });

  const loginOk = check(res, {
    'setup: login exitoso': (r) => r.status === 200,
    'setup: token presente en respuesta': (r) => {
      try {
        return JSON.parse(r.body).user?.token !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!loginOk) {
    console.error(`Setup falló. Status: ${res.status}, Body: ${res.body}`);
    console.warn('Los tests autenticados usarán token vacío y devolverán 401.');
    return { token: '' };
  }

  const token = JSON.parse(res.body).user.token;
  console.log(`Setup completado. Token obtenido (primeros 8 chars): ${token.substring(0, 8)}...`);
  return { token };
}

// ─── Función principal: ejecutada por cada VU en cada iteración ──────────────
export default function (data) {
  const token = data?.token || '';
  const authHeaders = {
    ...JSON_HEADERS,
    Authorization: `Bearer ${token}`,
  };

  // ── Grupo 1: Endpoints públicos (sin autenticación) ──────────────────────
  group('Endpoints públicos', () => {
    // GET / — Home
    const homeRes = http.get(`${BASE_URL}/`, { tags: { name: 'GET /' } });
    check(homeRes, {
      'GET / → 200': (r) => r.status === 200,
    }) || (failedRequests.add(1), errorRate.add(1));
    errorRate.add(homeRes.status !== 200 ? 1 : 0);

    sleep(0.5);

    // GET /instruments — Listar instrumentos (requiere auth)
    const instRes = http.get(`${BASE_URL}/instruments`, {
      headers: authHeaders,
      tags: { name: 'GET /instruments' },
    });
    const instOk = check(instRes, {
      'GET /instruments → 200': (r) => r.status === 200,
      'GET /instruments → array': (r) => {
        try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
      },
    });
    instrumentsDuration.add(instRes.timings.duration);
    if (!instOk) { failedRequests.add(1); errorRate.add(1); }

    sleep(0.3);
  });

  // ── Grupo 2: Autenticación ────────────────────────────────────────────────
  group('Autenticación', () => {
    // POST /login/musician — Login
    const loginPayload = JSON.stringify({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });
    const loginRes = http.post(`${BASE_URL}/login/musician`, loginPayload, {
      headers: JSON_HEADERS,
      tags: { name: 'POST /login/musician' },
    });
    const loginOk = check(loginRes, {
      'POST /login/musician → 200': (r) => r.status === 200,
      'POST /login/musician → tiene user': (r) => {
        try { return JSON.parse(r.body).user !== undefined; } catch { return false; }
      },
    });
    loginDuration.add(loginRes.timings.duration);
    if (!loginOk) { failedRequests.add(1); errorRate.add(1); }

    sleep(0.5);

    // POST /login/musician — Con credenciales inválidas (esperar 401)
    const badLoginRes = http.post(
      `${BASE_URL}/login/musician`,
      JSON.stringify({ username: 'noexiste', password: 'wrongpass' }),
      { headers: JSON_HEADERS, tags: { name: 'POST /login/musician (invalid)' } }
    );
    check(badLoginRes, {
      'POST /login/musician (invalid) → 401': (r) => r.status === 401,
    });

    sleep(0.3);
  });

  // ── Grupo 3: Bandas (requiere autenticación) ──────────────────────────────
  group('Bandas', () => {
    if (!token) {
      console.warn('Sin token, saltando tests de bandas.');
      return;
    }

    // GET /bands/mine — Mis bandas
    const bandsRes = http.get(`${BASE_URL}/bands/mine`, {
      headers: authHeaders,
      tags: { name: 'GET /bands/mine' },
    });
    const bandsOk = check(bandsRes, {
      'GET /bands/mine → 200': (r) => r.status === 200,
      'GET /bands/mine → respuesta válida': (r) => {
        try { JSON.parse(r.body); return true; } catch { return false; }
      },
    });
    bandsListDuration.add(bandsRes.timings.duration);
    if (!bandsOk) { failedRequests.add(1); errorRate.add(1); }

    sleep(0.5);

    // GET /bands/code/NOEXISTE — Buscar por código inexistente (esperar 404)
    const notFoundRes = http.get(`${BASE_URL}/bands/code/XXXXXXXX`, {
      headers: authHeaders,
      tags: { name: 'GET /bands/code/:bandCode (not found)' },
    });
    check(notFoundRes, {
      'GET /bands/code/XXXXXXXX → 404': (r) => r.status === 404,
    });

    sleep(0.3);
  });

  // ── Grupo 4: Músicos (requiere autenticación) ─────────────────────────────
  group('Músicos', () => {
    if (!token) return;

    // GET /musicians — Listar músicos con paginación
    const musiciansRes = http.get(`${BASE_URL}/musicians?limit=10&offset=0`, {
      headers: authHeaders,
      tags: { name: 'GET /musicians' },
    });
    const musiciansOk = check(musiciansRes, {
      'GET /musicians → 200': (r) => r.status === 200,
      'GET /musicians → tiene data': (r) => {
        try { return JSON.parse(r.body).data !== undefined; } catch { return false; }
      },
    });
    musiciansDuration.add(musiciansRes.timings.duration);
    if (!musiciansOk) { failedRequests.add(1); errorRate.add(1); }

    sleep(0.5);

    // GET /musicians?search=test — Búsqueda de músicos
    const searchRes = http.get(`${BASE_URL}/musicians?search=test&limit=5`, {
      headers: authHeaders,
      tags: { name: 'GET /musicians (search)' },
    });
    check(searchRes, {
      'GET /musicians?search → 200': (r) => r.status === 200,
    });

    sleep(0.3);
  });

  // Pausa entre iteraciones para simular comportamiento humano realista
  sleep(Math.random() * 2 + 1); // 1–3 segundos aleatorios
}

// ─── Teardown: se ejecuta una vez al final ───────────────────────────────────
export function teardown(data) {
  console.log('Test de carga completado.');
  console.log(`Token usado: ${data?.token ? data.token.substring(0, 8) + '...' : 'ninguno'}`);
}
