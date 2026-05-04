import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/models/sequelize.js', () => ({
  Band: { destroy: vi.fn() },
  Component: {
    findByPk: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    count: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Event: {},
  Instrument: { findByPk: vi.fn() },
  Musician: {},
  Performance: {},
  Rehearsal: {},
  User: {}
}));

vi.mock('../../src/middleware/AuthMiddleware.js', () => ({
  isLoggedIn: vi.fn()
}));

vi.mock('../../src/middleware/ComponentMiddleware.js', () => ({
  isInTheSameBand: vi.fn(),
  isMeOrAdmin: vi.fn(),
  isAdminInSameBand: vi.fn()
}));

import { makeAuthMiddleware, rejectAuthMiddleware } from '../helpers/testUser.js';
import { isLoggedIn } from '../../src/middleware/AuthMiddleware.js';
import { isAdminInSameBand, isInTheSameBand, isMeOrAdmin } from '../../src/middleware/ComponentMiddleware.js';
import { Band, Component } from '../../src/models/sequelize.js';
import loadFileRoutes from '../../src/routes/ComponentRoute.js';

const app = express();
app.use(express.json());
loadFileRoutes(app);

const mockTransaction = { commit: vi.fn(), rollback: vi.fn() };

describe('ComponentRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoggedIn.mockImplementation(makeAuthMiddleware());
    isInTheSameBand.mockImplementation((req, res, next) => next());
    isMeOrAdmin.mockImplementation((req, res, next) => next());
    isAdminInSameBand.mockImplementation((req, res, next) => next());
    Component.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // ── GET /components/:componentId ────────────────────────────────────────────
  describe('GET /components/:componentId', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).get('/components/1').expect(401);
    });

    it('devuelve 403 si no es de la misma banda', async () => {
      isInTheSameBand.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied. You are not in the same band as this component.' })
      );
      await request(app).get('/components/1').expect(403);
    });

    it('devuelve 200 con los datos del componente', async () => {
      Component.findByPk.mockResolvedValue({ id: 1, bandId: 1, musician: {}, instruments: [] });

      const res = await request(app).get('/components/1').expect(200);

      expect(res.body).toHaveProperty('id', 1);
    });

    it('devuelve 404 cuando el componente no existe', async () => {
      Component.findByPk.mockResolvedValue(null);

      await request(app).get('/components/999').expect(404);
    });
  });

  // ── PUT /components/:componentId/promote ────────────────────────────────────
  describe('PUT /components/:componentId/promote', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).put('/components/1/promote').expect(401);
    });

    it('devuelve 403 si no es admin en la misma banda', async () => {
      isAdminInSameBand.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied.' })
      );
      await request(app).put('/components/1/promote').expect(403);
    });

    it('devuelve 200 al promover a administrador', async () => {
      const mockComponent = {
        id: 2,
        bandId: 1,
        administrator: false,
        save: vi.fn().mockResolvedValue(true)
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count.mockResolvedValue(1);

      const res = await request(app).put('/components/2/promote').expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('devuelve 400 al degradar al único administrador', async () => {
      const mockComponent = { id: 2, bandId: 1, administrator: true, save: vi.fn() };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count.mockResolvedValue(1);

      const res = await request(app).put('/components/2/promote').expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('devuelve 404 cuando el componente no existe', async () => {
      Component.findByPk.mockResolvedValue(null);
      await request(app).put('/components/999/promote').expect(404);
    });
  });

  // ── DELETE /components/:componentId/leave ───────────────────────────────────
  describe('DELETE /components/:componentId/leave', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);
      await request(app).delete('/components/1/leave').expect(401);
    });

    it('devuelve 403 si no tiene permisos', async () => {
      isMeOrAdmin.mockImplementation((req, res, next) =>
        res.status(403).json({ error: 'Access denied.' })
      );
      await request(app).delete('/components/1/leave').expect(403);
    });

    it('devuelve 200 al salir de la banda', async () => {
      const mockComponent = {
        id: 1,
        bandId: 1,
        administrator: false,
        destroy: vi.fn().mockResolvedValue(true)
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count.mockResolvedValueOnce(3).mockResolvedValueOnce(1);

      const res = await request(app).delete('/components/1/leave').expect(200);

      expect(res.body).toHaveProperty('message', 'Component has left the band successfully.');
    });

    it('devuelve 400 al ser el único administrador con otros miembros', async () => {
      const mockComponent = { id: 1, bandId: 1, administrator: true };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count.mockResolvedValueOnce(3).mockResolvedValueOnce(1);

      const res = await request(app).delete('/components/1/leave').expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('elimina la banda cuando el último miembro sale', async () => {
      const mockComponent = {
        id: 1,
        bandId: 1,
        administrator: true,
        destroy: vi.fn().mockResolvedValue(true)
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
      Band.destroy.mockResolvedValue(true);

      const res = await request(app).delete('/components/1/leave').expect(200);

      expect(Band.destroy).toHaveBeenCalled();
      expect(res.body).toHaveProperty('message');
    });
  });
});
