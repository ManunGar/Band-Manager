import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/models/sequelize.js', () => ({
  Band: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Component: { findOne: vi.fn(), create: vi.fn() },
  Event: { create: vi.fn() },
  Instrument: { findAll: vi.fn() },
  Musician: {},
  Performance: { create: vi.fn() },
  Rehearsal: { create: vi.fn() },
  User: {}
}));

vi.mock('../../src/middleware/AuthMiddleware.js', () => ({
  isLoggedIn: vi.fn()
}));

vi.mock('../../src/middleware/BandMiddleware.js', () => ({
  isBandMember: vi.fn(),
  isNotBandMember: vi.fn(),
  isBandAdmin: vi.fn()
}));

vi.mock('../../src/middleware/FileHandlerMiddleware.js', () => ({
  handleFilesUpload: () => (req, res, next) => next(),
  parseBooleanFields: () => (req, res, next) => next(),
  parseFloatFields: () => (req, res, next) => next(),
  parseJSONFields: () => (req, res, next) => next(),
  addFilenameToBody: vi.fn(),
  deleteFileFromCloudinary: vi.fn()
}));

vi.mock('../../src/controllers/EventController.js', () => ({
  _checkComponentParticipation: vi.fn().mockReturnValue(true)
}));

import { makeAuthMiddleware, rejectAuthMiddleware } from '../helpers/testUser.js';
import { isLoggedIn } from '../../src/middleware/AuthMiddleware.js';
import { isBandAdmin, isBandMember, isNotBandMember } from '../../src/middleware/BandMiddleware.js';
import { Band, Component, Event, Instrument, Performance, Rehearsal } from '../../src/models/sequelize.js';
import loadFileRoutes from '../../src/routes/BandRoute.js';

const app = express();
app.use(express.json());
loadFileRoutes(app);

const mockTransaction = {
  commit: vi.fn().mockResolvedValue(undefined),
  rollback: vi.fn().mockResolvedValue(undefined)
};

describe('BandRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoggedIn.mockImplementation(makeAuthMiddleware());
    isBandMember.mockImplementation((req, res, next) => next());
    isNotBandMember.mockImplementation((req, res, next) => next());
    isBandAdmin.mockImplementation((req, res, next) => next());
    Band.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // ── GET /bands/mine ─────────────────────────────────────────────────────────
  describe('GET /bands/mine', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/bands/mine').expect(401);
    });

    it('devuelve 200 con la lista de bandas', async () => {
      Band.findAll.mockResolvedValue([{ id: 1, name: 'Mi Banda' }]);

      const res = await request(app).get('/bands/mine').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('devuelve lista vacía si el músico no tiene bandas', async () => {
      Band.findAll.mockResolvedValue([]);

      const res = await request(app).get('/bands/mine').expect(200);

      expect(res.body).toEqual([]);
    });
  });

  // ── GET /bands/:bandId ──────────────────────────────────────────────────────
  describe('GET /bands/:bandId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/bands/1').expect(401);
    });

    it('devuelve 403 si no es miembro de la banda', async () => {
      isBandMember.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied. You are not a member of this band.' })
      );
      await request(app).get('/bands/1').expect(403);
    });

    it('devuelve 200 con los datos de la banda', async () => {
      const mockBandData = {
        components: [{ musicianId: 1, administrator: true, instruments: [] }],
        events: []
      };
      Band.findByPk.mockResolvedValue({
        ...mockBandData,
        toJSON: vi.fn().mockReturnValue(mockBandData)
      });

      const res = await request(app).get('/bands/1').expect(200);

      expect(res.body).toHaveProperty('components');
    });

    it('devuelve 404 cuando la banda no existe', async () => {
      Band.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/bands/999').expect(404);

      expect(res.body).toHaveProperty('error', 'Band not found');
    });
  });

  // ── GET /bands/code/:bandCode ───────────────────────────────────────────────
  describe('GET /bands/code/:bandCode', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/bands/code/ABC12345').expect(401);
    });

    it('devuelve 200 cuando encuentra la banda por código', async () => {
      Band.findOne.mockResolvedValue({ id: 1, name: 'Mi Banda', code: 'ABC12345' });

      const res = await request(app).get('/bands/code/ABC12345').expect(200);

      expect(res.body).toHaveProperty('code', 'ABC12345');
    });

    it('devuelve 404 cuando el código no existe', async () => {
      Band.findOne.mockResolvedValue(null);

      const res = await request(app).get('/bands/code/NOEXISTE').expect(404);

      expect(res.body).toHaveProperty('error', 'Band not found');
    });
  });

  // ── DELETE /bands/:bandId ───────────────────────────────────────────────────
  describe('DELETE /bands/:bandId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).delete('/bands/1').expect(401);
    });

    it('devuelve 403 si no es administrador', async () => {
      isBandAdmin.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied. You are not an admin of this band.' })
      );
      await request(app).delete('/bands/1').expect(403);
    });

    it('devuelve 200 al eliminar la banda', async () => {
      Band.findByPk.mockResolvedValue({ id: 1, destroy: vi.fn().mockResolvedValue(true) });

      const res = await request(app).delete('/bands/1').expect(200);

      expect(res.body).toHaveProperty('message', 'Band deleted successfully');
    });

    it('devuelve 404 cuando la banda no existe', async () => {
      Band.findByPk.mockResolvedValue(null);

      await request(app).delete('/bands/999').expect(404);
    });
  });

  // ── PUT /bands/:bandId ──────────────────────────────────────────────────────
  describe('PUT /bands/:bandId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).put('/bands/1').send({ name: 'Nuevo' }).expect(401);
    });

    it('devuelve 403 si no es administrador', async () => {
      isBandAdmin.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied.' })
      );
      await request(app).put('/bands/1').send({ name: 'Nuevo' }).expect(403);
    });

    it('devuelve 200 al actualizar la banda', async () => {
      Band.findByPk.mockResolvedValue({
        id: 1,
        profile_picture: null,
        update: vi.fn().mockResolvedValue(true)
      });
      Band.findOne.mockResolvedValue(null); // nombre no en uso

      const res = await request(app)
        .put('/bands/1')
        .send({ name: 'Nuevo Nombre', location: 'Madrid' })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Band updated successfully');
    });

    it('devuelve 404 cuando la banda no existe', async () => {
      Band.findByPk.mockResolvedValue(null);

      await request(app).put('/bands/999').send({}).expect(404);
    });
  });

  // ── POST /bands/join/:bandId ────────────────────────────────────────────────
  describe('POST /bands/join/:bandId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).post('/bands/join/1').send({}).expect(401);
    });

    it('devuelve 403 si ya es miembro de la banda', async () => {
      isNotBandMember.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied. You are already a member of this band.' })
      );
      await request(app)
        .post('/bands/join/1')
        .send({ instruments: { '1': true } })
        .expect(403);
    });

    it('devuelve 201 al unirse a la banda', async () => {
      const fakeComponent = {
        id: 1,
        bandId: 1,
        musicianId: 1,
        addInstrument: vi.fn().mockResolvedValue(true)
      };
      Band.findByPk.mockResolvedValue({ id: 1 });
      Component.create.mockResolvedValue(fakeComponent);
      Instrument.findAll.mockResolvedValue([{ id: 1, name: 'Guitarra' }]);

      const res = await request(app)
        .post('/bands/join/1')
        .send({ instruments: { '1': true } })
        .expect(201);

      expect(res.body).toHaveProperty('message', 'Joined band successfully');
    });

    it('devuelve 404 cuando la banda no existe', async () => {
      Band.findByPk.mockResolvedValue(null);

      await request(app)
        .post('/bands/join/999')
        .send({ instruments: { '1': true } })
        .expect(404);
    });
  });

  // ── POST /bands/:bandId/events ───────────────────────────────────────────────
  describe('POST /bands/:bandId/events', () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10);
    const futureDateEnd = new Date(Date.now() + 86400000 * 31).toISOString().slice(0, 10);

    const rehearsalPayload = {
      eventType: 'rehearsals',
      name: 'Ensayo Semanal',
      date: futureDate,
      endDate: futureDateEnd,
      initialTime: '10:00',
      endTime: '12:00',
      location: 'Local de ensayo',
      latitude: 40.4,
      longitude: -3.7
    };

    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).post('/bands/1/events').send(rehearsalPayload).expect(401);
    });

    it('devuelve 403 si no es administrador', async () => {
      isBandAdmin.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied.' })
      );
      await request(app).post('/bands/1/events').send(rehearsalPayload).expect(403);
    });

    it('devuelve 201 al crear un ensayo', async () => {
      const fakeEvent = { id: 1, name: 'Ensayo', addInstrumentsAttended: vi.fn() };
      Event.create.mockResolvedValue(fakeEvent);
      Rehearsal.create.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/bands/1/events')
        .send(rehearsalPayload)
        .expect(201);

      expect(res.body).toHaveProperty('message', 'Event added to band successfully');
    });

    it('devuelve 422 si el tipo de evento no es válido', async () => {
      await request(app)
        .post('/bands/1/events')
        .send({ ...rehearsalPayload, eventType: 'tipo-invalido' })
        .expect(422);
    });

    it('devuelve 422 si la fecha es en el pasado', async () => {
      await request(app)
        .post('/bands/1/events')
        .send({ ...rehearsalPayload, date: '2020-01-01', endDate: '2020-01-02' })
        .expect(422);
    });
  });
});
