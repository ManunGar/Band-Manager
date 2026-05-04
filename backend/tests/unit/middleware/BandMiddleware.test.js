import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Component: {
    findOne: vi.fn()
  }
}));

import { isBandAdmin, isBandMember, isNotBandMember } from '../../../src/middleware/BandMiddleware.js';
import { Component } from '../../../src/models/sequelize.js';

const mockReq = (overrides = {}) => ({
  params: { bandId: '1' },
  user: { musician: { id: 1 } },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('BandMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isBandMember', () => {
    it('llama a next() cuando el músico es miembro de la banda', async () => {
      Component.findOne.mockResolvedValue({ id: 1, bandId: 1, musicianId: 1 });
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isBandMember(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devuelve 403 cuando el músico no es miembro de la banda', async () => {
      Component.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isBandMember(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are not a member of this band.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Component.findOne.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isBandMember(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('isNotBandMember', () => {
    it('llama a next() cuando el músico NO es miembro de la banda', async () => {
      Component.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isNotBandMember(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devuelve 403 cuando el músico ya es miembro de la banda', async () => {
      Component.findOne.mockResolvedValue({ id: 1, bandId: 1, musicianId: 1 });
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isNotBandMember(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are already a member of this band.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Component.findOne.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isNotBandMember(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('isBandAdmin', () => {
    it('llama a next() cuando el músico es administrador de la banda', async () => {
      Component.findOne.mockResolvedValue({ id: 1, bandId: 1, musicianId: 1, administrator: true });
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isBandAdmin(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(Component.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ administrator: true }) })
      );
    });

    it('devuelve 403 cuando el músico no es administrador', async () => {
      Component.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isBandAdmin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are not an admin of this band.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Component.findOne.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const req = mockReq();
      const res = mockRes();

      await isBandAdmin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('busca con bandId y musicianId correctos del request', async () => {
      Component.findOne.mockResolvedValue({ administrator: true });
      const next = vi.fn();
      const req = mockReq({
        params: { bandId: '42' },
        user: { musician: { id: 7 } }
      });
      const res = mockRes();

      await isBandAdmin(req, res, next);

      expect(Component.findOne).toHaveBeenCalledWith({
        where: { bandId: '42', musicianId: 7, administrator: true }
      });
    });
  });
});
