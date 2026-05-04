import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/models/sequelize.js', () => ({
  Agreement: {
    findByPk: vi.fn(),
    findAll: vi.fn(),
    findAndCountAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  Application: {
    findOne: vi.fn(),
    findAll: vi.fn(),
    findAndCountAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Band: {},
  Component: { findOne: vi.fn() },
  Event: {},
  Instrument: {},
  Musician: { findByPk: vi.fn() },
  Performance: { findAll: vi.fn() },
  User: {}
}));

vi.mock('../../src/middleware/AuthMiddleware.js', () => ({
  isLoggedIn: vi.fn()
}));

vi.mock('../../src/middleware/AgreementMiddleware.js', () => ({
  isEventAdmin: (req, res, next) => next(),
  isAgreementOwner: (req, res, next) => next(),
  hasRequirementToSee: (req, res, next) => next(),
  hasNoApprovedApplication: (req, res, next) => next(),
  hasRequirementToApply: (req, res, next) => next(),
  canUpdateApplicationStatus: (req, res, next) => next(),
  canRateApplication: (req, res, next) => next(),
  canInviteMusician: (req, res, next) => next(),
  isInvitedMusician: (req, res, next) => next()
}));

import { makeAuthMiddleware, rejectAuthMiddleware, testUser } from '../helpers/testUser.js';
import { isLoggedIn } from '../../src/middleware/AuthMiddleware.js';
import { Agreement, Application, Musician, Performance } from '../../src/models/sequelize.js';
import loadFileRoutes from '../../src/routes/AgreementRoute.js';

const app = express();
app.use(express.json());
loadFileRoutes(app);

const mockTransaction = {
  commit: vi.fn().mockResolvedValue(undefined),
  rollback: vi.fn().mockResolvedValue(undefined)
};

describe('AgreementRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoggedIn.mockImplementation(makeAuthMiddleware());
    Application.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // ── GET /performances/admin ─────────────────────────────────────────────────
  describe('GET /performances/admin', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/performances/admin').expect(401);
    });

    it('devuelve 200 con las próximas actuaciones donde el músico es admin', async () => {
      Performance.findAll.mockResolvedValue([]);

      const res = await request(app).get('/performances/admin').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── GET /agreements ─────────────────────────────────────────────────────────
  describe('GET /agreements', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/agreements').expect(401);
    });

    it('devuelve 200 con lista vacía si el músico no tiene instrumentos', async () => {
      // testUser.musician.instruments is empty for this test
      const userWithNoInstruments = { ...testUser, musician: { ...testUser.musician, instruments: [] } };
      isLoggedIn.mockImplementation(makeAuthMiddleware(userWithNoInstruments));
      Musician.findByPk.mockResolvedValue({ id: 1, components: [] });

      const res = await request(app).get('/agreements').expect(200);

      expect(res.body.data).toEqual([]);
    });

    it('devuelve 200 con agreements cuando el músico tiene instrumentos', async () => {
      Musician.findByPk.mockResolvedValue({ id: 1, components: [] });
      Agreement.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      const res = await request(app).get('/agreements').expect(200);

      expect(res.body).toHaveProperty('data');
    });
  });

  // ── GET /agreements/me ──────────────────────────────────────────────────────
  describe('GET /agreements/me', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/agreements/me').expect(401);
    });

    it('devuelve 200 con los agreements propios', async () => {
      Agreement.findAll.mockResolvedValue([]);

      const res = await request(app).get('/agreements/me').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── GET /applications/me ────────────────────────────────────────────────────
  describe('GET /applications/me', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/applications/me').expect(401);
    });

    it('devuelve 200 con las propias aplicaciones', async () => {
      Application.findAll.mockResolvedValue([]);

      const res = await request(app).get('/applications/me').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── GET /agreements/:agreementId ────────────────────────────────────────────
  describe('GET /agreements/:agreementId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/agreements/1').expect(401);
    });

    it('devuelve 200 cuando el agreement existe', async () => {
      const agreementData = { id: 1, status: 'open', musicianId: 99, applications: [] };
      Agreement.findByPk.mockResolvedValue({
        ...agreementData,
        toJSON: vi.fn().mockReturnValue(agreementData)
      });

      const res = await request(app).get('/agreements/1').expect(200);

      expect(res.body).toHaveProperty('id', 1);
    });

    it('devuelve 404 cuando el agreement no existe', async () => {
      Agreement.findByPk.mockResolvedValue(null);

      await request(app).get('/agreements/999').expect(404);
    });
  });

  // ── DELETE /agreements/:agreementId ─────────────────────────────────────────
  describe('DELETE /agreements/:agreementId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).delete('/agreements/1').expect(401);
    });

    it('devuelve 200 al eliminar el agreement', async () => {
      Agreement.findByPk.mockResolvedValue({
        id: 1,
        destroy: vi.fn().mockResolvedValue(true)
      });

      const res = await request(app).delete('/agreements/1').expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('devuelve 404 si el agreement no existe', async () => {
      Agreement.findByPk.mockResolvedValue(null);
      await request(app).delete('/agreements/999').expect(404);
    });
  });

  // ── POST /agreements/:agreementId/invite ─────────────────────────────────────
  describe('POST /agreements/:agreementId/invite', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).post('/agreements/1/invite').send({}).expect(401);
    });

    it('devuelve 201 al invitar a un músico', async () => {
      Application.create.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/agreements/1/invite')
        .send({ musicianId: 2 })
        .expect(201);

      expect(res.body).toHaveProperty('message', 'Musician invited successfully');
    });

    it('devuelve 422 si falta musicianId', async () => {
      await request(app)
        .post('/agreements/1/invite')
        .send({})
        .expect(422);
    });
  });

  // ── PUT /applications/:applicationId/respond ────────────────────────────────
  describe('PUT /applications/:applicationId/respond', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).put('/applications/1/respond').send({}).expect(401);
    });

    it('devuelve 404 si la invitación no existe', async () => {
      Application.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put('/applications/1/respond')
        .send({ status: 'accepted' })
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });

    it('devuelve 422 si falta status o tiene valor inválido', async () => {
      await request(app)
        .put('/applications/1/respond')
        .send({ status: 'maybe' })
        .expect(422);
    });
  });

  // ── POST /agreements/:agreementId/apply ─────────────────────────────────────
  describe('POST /agreements/:agreementId/apply', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).post('/agreements/1/apply').send({}).expect(401);
    });

    it('devuelve 201 al aplicar al agreement', async () => {
      Application.create.mockResolvedValue({ id: 1 });
      Agreement.findByPk.mockResolvedValue({ id: 1, amount: 1 });

      const res = await request(app)
        .post('/agreements/1/apply')
        .expect(201);

      expect(res.body).toHaveProperty('message');
    });
  });

  // ── PUT /agreements/:agreementId/applications/:applicationId ─────────────────
  describe('PUT /agreements/:agreementId/applications/:applicationId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app)
        .put('/agreements/1/applications/1')
        .send({ status: 'accepted' })
        .expect(401);
    });

    it('devuelve 422 con status inválido', async () => {
      await request(app)
        .put('/agreements/1/applications/1')
        .send({ status: 'invalid-status' })
        .expect(422);
    });
  });

  // ── PUT /agreements/:agreementId/applications/:applicationId/rate ────────────
  describe('PUT /agreements/:agreementId/applications/:applicationId/rate', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app)
        .put('/agreements/1/applications/1/rate')
        .send({ rate: 4.5 })
        .expect(401);
    });

    it('devuelve 422 con rate fuera de rango', async () => {
      await request(app)
        .put('/agreements/1/applications/1/rate')
        .send({ rate: 6 })
        .expect(422);
    });
  });
});
