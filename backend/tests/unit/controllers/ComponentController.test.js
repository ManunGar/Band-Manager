import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Band: {
    destroy: vi.fn()
  },
  Component: {
    findByPk: vi.fn(),
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

import ComponentController from '../../../src/controllers/ComponentController.js';
import { Band, Component } from '../../../src/models/sequelize.js';

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  user: { id: 1, musician: { id: 1 } },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const buildMockTransaction = () => ({
  commit: vi.fn().mockResolvedValue(undefined),
  rollback: vi.fn().mockResolvedValue(undefined)
});

describe('ComponentController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('promoteToAdministrator', () => {
    it('promueve a administrador cuando el componente no es admin', async () => {
      const mockComponent = {
        id: 2,
        bandId: 1,
        administrator: false,
        save: vi.fn().mockResolvedValue(true)
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count.mockResolvedValue(1);

      const req = mockReq({ params: { componentId: '2' } });
      const res = mockRes();

      await ComponentController.promoteToAdministrator(req, res);

      expect(mockComponent.administrator).toBe(true);
      expect(mockComponent.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Component promoted to administrator successfully.' })
      );
    });

    it('degrada a no-admin cuando el componente es admin y hay más de uno', async () => {
      const mockComponent = {
        id: 2,
        bandId: 1,
        administrator: true,
        save: vi.fn().mockResolvedValue(true)
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count.mockResolvedValue(2);

      const req = mockReq({ params: { componentId: '2' } });
      const res = mockRes();

      await ComponentController.promoteToAdministrator(req, res);

      expect(mockComponent.administrator).toBe(false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Component demoted from administrator successfully.' })
      );
    });

    it('devuelve 400 al intentar degradar al único administrador', async () => {
      const mockComponent = {
        id: 2,
        bandId: 1,
        administrator: true,
        save: vi.fn()
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count.mockResolvedValue(1);

      const req = mockReq({ params: { componentId: '2' } });
      const res = mockRes();

      await ComponentController.promoteToAdministrator(req, res);

      expect(mockComponent.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'A band must have at least one administrator.' })
      );
    });

    it('devuelve 404 cuando el componente no existe', async () => {
      Component.findByPk.mockResolvedValue(null);

      const req = mockReq({ params: { componentId: '999' } });
      const res = mockRes();

      await ComponentController.promoteToAdministrator(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Component not found.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Component.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ params: { componentId: '1' } });
      const res = mockRes();

      await ComponentController.promoteToAdministrator(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('leaveBand', () => {
    it('permite al músico salir de la banda normalmente', async () => {
      const mockTransaction = buildMockTransaction();
      const mockComponent = {
        id: 1,
        bandId: 1,
        administrator: false,
        destroy: vi.fn().mockResolvedValue(true)
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count
        .mockResolvedValueOnce(3)  // componentCount
        .mockResolvedValueOnce(1); // administratorsCount
      Component.sequelize.transaction.mockResolvedValue(mockTransaction);

      const req = mockReq({ params: { componentId: '1' } });
      const res = mockRes();

      await ComponentController.leaveBand(req, res);

      expect(mockComponent.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Component has left the band successfully.' })
      );
    });

    it('elimina la banda cuando el último miembro la abandona', async () => {
      const mockTransaction = buildMockTransaction();
      const mockComponent = {
        id: 1,
        bandId: 1,
        administrator: true,
        destroy: vi.fn().mockResolvedValue(true)
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count
        .mockResolvedValueOnce(1)  // componentCount = 1 (último miembro)
        .mockResolvedValueOnce(1); // administratorsCount
      Component.sequelize.transaction.mockResolvedValue(mockTransaction);
      Band.destroy.mockResolvedValue(true);

      const req = mockReq({ params: { componentId: '1' } });
      const res = mockRes();

      await ComponentController.leaveBand(req, res);

      expect(Band.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 400 cuando el único admin intenta salir con otros miembros', async () => {
      const mockTransaction = buildMockTransaction();
      const mockComponent = {
        id: 1,
        bandId: 1,
        administrator: true
      };
      Component.findByPk.mockResolvedValue(mockComponent);
      Component.count
        .mockResolvedValueOnce(3)  // componentCount > 1
        .mockResolvedValueOnce(1); // administratorsCount = 1 (único admin)
      Component.sequelize.transaction.mockResolvedValue(mockTransaction);

      const req = mockReq({ params: { componentId: '1' } });
      const res = mockRes();

      await ComponentController.leaveBand(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'A band must have at least one administrator.' })
      );
    });

    it('devuelve 404 cuando el componente no existe', async () => {
      const mockTransaction = buildMockTransaction();
      Component.findByPk.mockResolvedValue(null);
      Component.sequelize.transaction.mockResolvedValue(mockTransaction);

      const req = mockReq({ params: { componentId: '999' } });
      const res = mockRes();

      await ComponentController.leaveBand(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 y hace rollback cuando la base de datos falla', async () => {
      const mockTransaction = buildMockTransaction();
      Component.findByPk.mockRejectedValue(new Error('DB error'));
      Component.sequelize.transaction.mockResolvedValue(mockTransaction);

      const req = mockReq({ params: { componentId: '1' } });
      const res = mockRes();

      await ComponentController.leaveBand(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('findComponentById', () => {
    it('devuelve 404 cuando el componente no existe', async () => {
      Component.findByPk.mockResolvedValue(null);

      const req = mockReq({ params: { componentId: '999' } });
      const res = mockRes();

      await ComponentController.findComponentById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Component not found.' })
      );
    });

    it('devuelve 200 cuando el componente existe', async () => {
      const mockComponent = { id: 1, bandId: 1, musician: {}, instruments: [] };
      Component.findByPk.mockResolvedValue(mockComponent);

      const req = mockReq({ params: { componentId: '1' } });
      const res = mockRes();

      await ComponentController.findComponentById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockComponent);
    });
  });
});
