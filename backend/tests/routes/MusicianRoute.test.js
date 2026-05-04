import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/models/sequelize.js', () => ({
  Musician: {
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Application: { findOne: vi.fn(), findAndCountAll: vi.fn() },
  Agreement: {},
  Band: {},
  Component: {},
  Event: {},
  Instrument: { findAll: vi.fn() },
  Performance: {},
  User: {}
}));

vi.mock('../../src/middleware/AuthMiddleware.js', () => ({
  isLoggedIn: vi.fn()
}));

import { makeAuthMiddleware, rejectAuthMiddleware, testUser } from '../helpers/testUser.js';
import { isLoggedIn } from '../../src/middleware/AuthMiddleware.js';
import { Application, Instrument, Musician } from '../../src/models/sequelize.js';
import loadFileRoutes from '../../src/routes/MusicianRoute.js';

const app = express();
app.use(express.json());
loadFileRoutes(app);

const buildMockMusician = (overrides = {}) => ({
  id: 2,
  isProfilePrivate: false,
  toJSON: vi.fn().mockReturnValue({ id: 2, isProfilePrivate: false }),
  update: vi.fn().mockResolvedValue(true),
  setInstruments: vi.fn().mockResolvedValue(true),
  addInstrument: vi.fn().mockResolvedValue(true),
  ...overrides
});

describe('MusicianRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoggedIn.mockImplementation(makeAuthMiddleware());
  });

  // ── GET /musicians ──────────────────────────────────────────────────────────
  describe('GET /musicians', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/musicians').expect(401);
    });

    it('devuelve 200 con la lista de músicos', async () => {
      Musician.findAndCountAll.mockResolvedValue({
        rows: [{ id: 2, user: { full_name: 'Otro Músico' } }],
        count: 1
      });

      const res = await request(app).get('/musicians').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
    });

    it('devuelve 200 con lista vacía', async () => {
      Musician.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      const res = await request(app).get('/musicians').expect(200);

      expect(res.body.data).toHaveLength(0);
      expect(res.body.hasMore).toBe(false);
    });

    it('respeta el parámetro limit (max 50)', async () => {
      Musician.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await request(app).get('/musicians?limit=5&offset=0').expect(200);

      expect(Musician.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5 })
      );
    });
  });

  // ── GET /musicians/:musicianId/profile ──────────────────────────────────────
  describe('GET /musicians/:musicianId/profile', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/musicians/2/profile').expect(401);
    });

    it('devuelve 200 para un perfil público', async () => {
      const mockMusician = buildMockMusician({ id: 2, isProfilePrivate: false });
      Musician.findByPk.mockResolvedValue(mockMusician);
      Application.findOne.mockResolvedValue(null);

      const res = await request(app).get('/musicians/2/profile').expect(200);

      expect(res.body).toHaveProperty('id', 2);
    });

    it('devuelve 200 para el propio perfil aunque sea privado', async () => {
      const ownMockMusician = buildMockMusician({ id: 1, isProfilePrivate: true });
      Musician.findByPk.mockResolvedValue(ownMockMusician);
      Application.findOne.mockResolvedValue(null);

      const res = await request(app).get('/musicians/1/profile').expect(200);

      expect(res.body).toHaveProperty('isOwner', true);
    });

    it('devuelve 403 cuando el perfil es privado y no es el dueño', async () => {
      const privateMockMusician = buildMockMusician({ id: 2, isProfilePrivate: true });
      Musician.findByPk.mockResolvedValue(privateMockMusician);

      const res = await request(app).get('/musicians/2/profile').expect(403);

      expect(res.body).toHaveProperty('error');
    });

    it('devuelve 404 cuando el músico no existe', async () => {
      Musician.findByPk.mockResolvedValue(null);

      await request(app).get('/musicians/999/profile').expect(404);
    });

    it('devuelve 422 si el musicianId no es numérico', async () => {
      await request(app).get('/musicians/abc/profile').expect(422);
    });
  });

  // ── GET /musicians/:musicianId/contracts ────────────────────────────────────
  describe('GET /musicians/:musicianId/contracts', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/musicians/2/contracts').expect(401);
    });

    it('devuelve 200 con los contratos del músico', async () => {
      const mockMusician = buildMockMusician({ id: 2, isProfilePrivate: false });
      Musician.findByPk.mockResolvedValue(mockMusician);
      Application.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      const res = await request(app).get('/musicians/2/contracts').expect(200);

      expect(res.body).toHaveProperty('data');
    });

    it('devuelve 403 cuando el perfil es privado', async () => {
      Musician.findByPk.mockResolvedValue(buildMockMusician({ id: 2, isProfilePrivate: true }));

      await request(app).get('/musicians/2/contracts').expect(403);
    });

    it('devuelve 404 cuando el músico no existe', async () => {
      Musician.findByPk.mockResolvedValue(null);

      await request(app).get('/musicians/999/contracts').expect(404);
    });
  });

  // ── PUT /musicians/account/visibility ──────────────────────────────────────
  describe('PUT /musicians/account/visibility', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).put('/musicians/account/visibility').send({}).expect(401);
    });

    it('devuelve 200 al actualizar la visibilidad a privado', async () => {
      const mockMusician = buildMockMusician({ id: 1 });
      Musician.findByPk.mockResolvedValue(mockMusician);

      const res = await request(app)
        .put('/musicians/account/visibility')
        .send({ isProfilePrivate: true })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Musician profile visibility updated successfully');
    });

    it('devuelve 422 si isProfilePrivate no es booleano', async () => {
      await request(app)
        .put('/musicians/account/visibility')
        .send({ isProfilePrivate: 'yes' })
        .expect(422);
    });

    it('devuelve 422 si falta isProfilePrivate', async () => {
      await request(app)
        .put('/musicians/account/visibility')
        .send({})
        .expect(422);
    });
  });

  // ── POST /musicians/instruments ─────────────────────────────────────────────
  describe('POST /musicians/instruments', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).post('/musicians/instruments').send({}).expect(401);
    });

    it('devuelve 200 al añadir instrumentos', async () => {
      const mockTransaction = { commit: vi.fn(), rollback: vi.fn() };
      const mockMusician = buildMockMusician({ id: 1 });
      Musician.findByPk.mockResolvedValue(mockMusician);
      Musician.sequelize.transaction.mockResolvedValue(mockTransaction);
      Instrument.findAll.mockResolvedValue([{ id: 1, name: 'Guitarra' }]);

      const res = await request(app)
        .post('/musicians/instruments')
        .send({ instruments: { '1': 'aficionado' } })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Instruments added successfully');
    });

    it('devuelve 422 si instruments no es un objeto', async () => {
      await request(app)
        .post('/musicians/instruments')
        .send({ instruments: 'not-an-object' })
        .expect(422);
    });
  });
});
