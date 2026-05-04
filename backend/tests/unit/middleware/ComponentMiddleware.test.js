import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Component: {
    findByPk: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn()
  }
}));

import { isAdminInSameBand, isInTheSameBand, isMeOrAdmin } from '../../../src/middleware/ComponentMiddleware.js';
import { Component } from '../../../src/models/sequelize.js';

const mockReq = (overrides = {}) => ({
  params: { componentId: '2' },
  user: { musician: { id: 1 } },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('ComponentMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isInTheSameBand', () => {
    it('llama a next() cuando el músico está en la misma banda', async () => {
      const targetComponent = { id: 2, bandId: 1, musicianId: 5 };
      const myComponents = [{ id: 1, bandId: 1, musicianId: 1 }];
      Component.findByPk.mockResolvedValue(targetComponent);
      Component.findAll.mockResolvedValue(myComponents);

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isInTheSameBand(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 403 cuando el músico está en una banda diferente', async () => {
      const targetComponent = { id: 2, bandId: 2, musicianId: 5 };
      const myComponents = [{ id: 1, bandId: 1, musicianId: 1 }];
      Component.findByPk.mockResolvedValue(targetComponent);
      Component.findAll.mockResolvedValue(myComponents);

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isInTheSameBand(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied. You are not in the same band as this component.'
        })
      );
    });

    it('devuelve 404 cuando el componente objetivo no existe', async () => {
      Component.findByPk.mockResolvedValue(null);
      Component.findAll.mockResolvedValue([{ id: 1, bandId: 1 }]);

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isInTheSameBand(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 404 cuando el músico no tiene componentes', async () => {
      Component.findByPk.mockResolvedValue({ id: 2, bandId: 1 });
      Component.findAll.mockResolvedValue([]);

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isInTheSameBand(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Component.findByPk.mockRejectedValue(new Error('DB error'));

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isInTheSameBand(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('isMeOrAdmin', () => {
    it('llama a next() cuando el músico es el dueño del componente', async () => {
      const component = { id: 2, bandId: 1, musicianId: 1 };
      Component.findByPk.mockResolvedValue(component);

      const next = vi.fn();
      const req = mockReq({ user: { musician: { id: 1 } } });
      const res = mockRes();

      await isMeOrAdmin(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(Component.findOne).not.toHaveBeenCalled();
    });

    it('llama a next() cuando el músico es admin en la misma banda', async () => {
      const component = { id: 2, bandId: 1, musicianId: 5 };
      const adminComponent = { id: 3, bandId: 1, musicianId: 1, administrator: true };
      Component.findByPk.mockResolvedValue(component);
      Component.findOne.mockResolvedValue(adminComponent);

      const next = vi.fn();
      const req = mockReq({ user: { musician: { id: 1 } } });
      const res = mockRes();

      await isMeOrAdmin(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 403 cuando el músico no es ni dueño ni admin', async () => {
      const component = { id: 2, bandId: 1, musicianId: 5 };
      Component.findByPk.mockResolvedValue(component);
      Component.findOne.mockResolvedValue(null);

      const next = vi.fn();
      const req = mockReq({ user: { musician: { id: 1 } } });
      const res = mockRes();

      await isMeOrAdmin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied. You are neither the owner nor an admin of this component.'
        })
      );
    });

    it('devuelve 404 cuando el componente no existe', async () => {
      Component.findByPk.mockResolvedValue(null);

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isMeOrAdmin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Component.findByPk.mockRejectedValue(new Error('DB error'));

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isMeOrAdmin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('isAdminInSameBand', () => {
    it('llama a next() cuando el músico es admin en la misma banda', async () => {
      const component = { id: 2, bandId: 1, musicianId: 5 };
      const adminComponent = { id: 3, bandId: 1, musicianId: 1, administrator: true };
      Component.findByPk.mockResolvedValue(component);
      Component.findOne.mockResolvedValue(adminComponent);

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isAdminInSameBand(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(Component.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ administrator: true })
        })
      );
    });

    it('devuelve 403 cuando el músico no es admin en la banda del componente', async () => {
      const component = { id: 2, bandId: 1, musicianId: 5 };
      Component.findByPk.mockResolvedValue(component);
      Component.findOne.mockResolvedValue(null);

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isAdminInSameBand(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied. You are not an admin in the same band as this component.'
        })
      );
    });

    it('devuelve 404 cuando el componente no existe', async () => {
      Component.findByPk.mockResolvedValue(null);

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isAdminInSameBand(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Component.findByPk.mockRejectedValue(new Error('DB error'));

      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isAdminInSameBand(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
