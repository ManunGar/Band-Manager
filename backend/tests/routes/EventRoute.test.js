import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/models/sequelize.js', () => ({
  Agreement: {},
  Application: { findAll: vi.fn(), findOne: vi.fn() },
  Band: {},
  Component: { findAll: vi.fn(), findOne: vi.fn() },
  Event: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    update: vi.fn(),
    sequelize: { transaction: vi.fn(), models: { EventAttendances: { upsert: vi.fn() } } }
  },
  Instrument: {},
  Musician: {},
  Performance: { findOne: vi.fn(), update: vi.fn() },
  Rehearsal: {},
  User: {}
}));

vi.mock('../../src/middleware/AuthMiddleware.js', () => ({
  isLoggedIn: vi.fn()
}));

vi.mock('../../src/middleware/EventMiddleware.js', () => ({
  isEventAdmin: vi.fn(),
  isEventParticipant: vi.fn()
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

import { makeAuthMiddleware, rejectAuthMiddleware } from '../helpers/testUser.js';
import { isLoggedIn } from '../../src/middleware/AuthMiddleware.js';
import { isEventAdmin, isEventParticipant } from '../../src/middleware/EventMiddleware.js';
import { Application, Component, Event, Performance } from '../../src/models/sequelize.js';
import loadFileRoutes from '../../src/routes/EventRoute.js';

const app = express();
app.use(express.json());
loadFileRoutes(app);

const mockTransaction = { commit: vi.fn(), rollback: vi.fn() };

describe('EventRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoggedIn.mockImplementation(makeAuthMiddleware());
    isEventAdmin.mockImplementation((req, res, next) => next());
    isEventParticipant.mockImplementation((req, res, next) => next());
    Event.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // ── GET /events ─────────────────────────────────────────────────────────────
  describe('GET /events', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/events').expect(401);
    });

    it('devuelve 200 con la lista de eventos', async () => {
      // _getMusicianComponents: músico sin componentes
      Component.findAll.mockResolvedValue([]);
      // _getBandVisibleEvents: sin eventos de banda
      Event.findAll.mockResolvedValue([]);
      // _getAcceptedContractEventIds: sin aplicaciones aceptadas
      Application.findAll.mockResolvedValue([]);

      const res = await request(app).get('/events').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── GET /events/:eventId ────────────────────────────────────────────────────
  describe('GET /events/:eventId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/events/1').expect(401);
    });

    it('devuelve 404 cuando el evento no existe', async () => {
      Event.findByPk.mockResolvedValue(null);

      await request(app).get('/events/999').expect(404);
    });

    it('devuelve 200 cuando el evento existe y el músico es admin de banda', async () => {
      const eventJson = {
        id: 1,
        name: 'Concierto',
        band: {
          components: [{ musicianId: 1, administrator: true, instruments: [] }]
        },
        instrumentsAttended: [],
        attendees: [{ id: 1, EventAttendances: { present: null, alleged: null, reason: null } }]
      };
      Event.findByPk.mockResolvedValue({
        ...eventJson,
        toJSON: vi.fn().mockReturnValue(eventJson)
      });
      // _hasAcceptedContractForEvent llama Application.findOne
      Application.findOne.mockResolvedValue(null);

      const res = await request(app).get('/events/1').expect(200);

      expect(res.body).toHaveProperty('id', 1);
    });
  });

  // ── DELETE /events/:eventId ─────────────────────────────────────────────────
  describe('DELETE /events/:eventId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).delete('/events/1').expect(401);
    });

    it('devuelve 403 si no es admin del evento', async () => {
      isEventAdmin.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied. You are not an admin of this event.' })
      );
      await request(app).delete('/events/1').expect(403);
    });

    it('devuelve 200 al eliminar el evento', async () => {
      Event.findByPk.mockResolvedValue({
        id: 1,
        Performance: null,
        destroy: vi.fn().mockResolvedValue(true)
      });

      const res = await request(app).delete('/events/1').expect(200);

      expect(res.body).toHaveProperty('message', 'Event deleted successfully');
    });

    it('devuelve 404 cuando el evento no existe', async () => {
      Event.findByPk.mockResolvedValue(null);
      await request(app).delete('/events/999').expect(404);
    });
  });

  // ── GET /events/:eventId/attendance ─────────────────────────────────────────
  describe('GET /events/:eventId/attendance', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/events/1/attendance').expect(401);
    });

    it('devuelve 403 si no es admin del evento', async () => {
      isEventAdmin.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied.' })
      );
      await request(app).get('/events/1/attendance').expect(403);
    });

    it('devuelve 200 con el registro de asistencia', async () => {
      Event.findByPk.mockResolvedValue({
        id: 1,
        attendees: [],
        band: { components: [] },
        instrumentsAttended: []
      });
      // _getContractedMusiciansForEvent llama Application.findAll
      Application.findAll.mockResolvedValue([]);

      const res = await request(app).get('/events/1/attendance').expect(200);

      expect(res.body).toHaveProperty('componentsAttendance');
    });
  });

  // ── PUT /events/:eventId/component-attendance ───────────────────────────────
  describe('PUT /events/:eventId/component-attendance', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).put('/events/1/component-attendance').send({}).expect(401);
    });

    it('devuelve 403 si no es participante del evento', async () => {
      isEventParticipant.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied.' })
      );
      await request(app)
        .put('/events/1/component-attendance')
        .send({ componentId: 1, present: true })
        .expect(403);
    });

    it('devuelve 422 si faltan campos requeridos', async () => {
      await request(app)
        .put('/events/1/component-attendance')
        .send({})
        .expect(422);
    });
  });

  // ── PUT /events/:eventId/attendance ─────────────────────────────────────────
  describe('PUT /events/:eventId/attendance', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).put('/events/1/attendance').send({}).expect(401);
    });

    it('devuelve 403 si no es admin del evento', async () => {
      isEventAdmin.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied.' })
      );
      await request(app).put('/events/1/attendance').send({ attendances: [] }).expect(403);
    });
  });
});
