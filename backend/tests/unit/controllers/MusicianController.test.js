import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Musician: {
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Application: {
    findOne: vi.fn(),
    findAndCountAll: vi.fn()
  },
  Agreement: {},
  Band: {},
  Component: {},
  Event: {},
  Instrument: {},
  Performance: {},
  User: {}
}));

import MusicianController from '../../../src/controllers/MusicianController.js';
import { Application, Musician } from '../../../src/models/sequelize.js';

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: 1, musician: { id: 1 } },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const buildMockMusician = (overrides = {}) => ({
  id: 2,
  isProfilePrivate: false,
  toJSON: vi.fn().mockReturnValue({ id: 2, isProfilePrivate: false }),
  update: vi.fn().mockResolvedValue(true),
  ...overrides
});

describe('MusicianController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getMusicianProfile', () => {
    it('devuelve 200 para un perfil público de otro músico', async () => {
      const mockMusician = buildMockMusician({ id: 2, isProfilePrivate: false });
      Musician.findByPk.mockResolvedValue(mockMusician);
      Application.findOne.mockResolvedValue({ averageRate: '4.5' });

      const req = mockReq({
        params: { musicianId: '2' },
        user: { musician: { id: 1 } }
      });
      const res = mockRes();

      await MusicianController.getMusicianProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 200 para el propio perfil aunque sea privado', async () => {
      const mockMusician = buildMockMusician({ id: 1, isProfilePrivate: true });
      Musician.findByPk.mockResolvedValue(mockMusician);
      Application.findOne.mockResolvedValue(null);

      const req = mockReq({
        params: { musicianId: '1' },
        user: { musician: { id: 1 } }
      });
      const res = mockRes();

      await MusicianController.getMusicianProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 403 cuando el perfil es privado y el solicitante no es el dueño', async () => {
      const mockMusician = buildMockMusician({ id: 2, isProfilePrivate: true });
      Musician.findByPk.mockResolvedValue(mockMusician);

      const req = mockReq({
        params: { musicianId: '2' },
        user: { musician: { id: 1 } }
      });
      const res = mockRes();

      await MusicianController.getMusicianProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. This profile is private.' })
      );
    });

    it('devuelve 404 cuando el músico no existe', async () => {
      Musician.findByPk.mockResolvedValue(null);

      const req = mockReq({ params: { musicianId: '999' } });
      const res = mockRes();

      await MusicianController.getMusicianProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Musician not found' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Musician.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ params: { musicianId: '1' } });
      const res = mockRes();

      await MusicianController.getMusicianProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateVisibility', () => {
    it('devuelve 200 cuando actualiza la visibilidad correctamente', async () => {
      const mockMusician = buildMockMusician({ id: 1 });
      Musician.findByPk.mockResolvedValue(mockMusician);

      const req = mockReq({ body: { isProfilePrivate: true } });
      const res = mockRes();

      await MusicianController.updateVisibility(req, res);

      expect(mockMusician.update).toHaveBeenCalledWith({ isProfilePrivate: true });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 404 cuando el músico no existe', async () => {
      Musician.findByPk.mockResolvedValue(null);

      const req = mockReq({ body: { isProfilePrivate: false } });
      const res = mockRes();

      await MusicianController.updateVisibility(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Musician not found' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Musician.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ body: { isProfilePrivate: false } });
      const res = mockRes();

      await MusicianController.updateVisibility(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('listMusicianContracts', () => {
    it('devuelve 200 con los contratos cuando el perfil es accesible', async () => {
      const mockMusician = buildMockMusician({ id: 2, isProfilePrivate: false });
      Musician.findByPk.mockResolvedValue(mockMusician);
      Application.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      const req = mockReq({
        params: { musicianId: '2' },
        query: {},
        user: { musician: { id: 1 } }
      });
      const res = mockRes();

      await MusicianController.listMusicianContracts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ data: [], total: 0 })
      );
    });

    it('devuelve 403 cuando el perfil es privado y no es el dueño', async () => {
      const mockMusician = buildMockMusician({ id: 2, isProfilePrivate: true });
      Musician.findByPk.mockResolvedValue(mockMusician);

      const req = mockReq({
        params: { musicianId: '2' },
        query: {},
        user: { musician: { id: 1 } }
      });
      const res = mockRes();

      await MusicianController.listMusicianContracts(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('devuelve 404 cuando el músico no existe', async () => {
      Musician.findByPk.mockResolvedValue(null);

      const req = mockReq({
        params: { musicianId: '999' },
        query: {}
      });
      const res = mockRes();

      await MusicianController.listMusicianContracts(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('addInstrumentsToMusician', () => {
    it('devuelve 200 al añadir instrumentos correctamente', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockMusician = {
        id: 1,
        setInstruments: vi.fn().mockResolvedValue(true),
        addInstrument: vi.fn().mockResolvedValue(true)
      };
      Musician.findByPk.mockResolvedValue(mockMusician);
      Musician.sequelize.transaction.mockResolvedValue(mockTransaction);

      const req = mockReq({ body: { instruments: { '1': 'aficionado', '2': 'título profesional' } } });
      const res = mockRes();

      await MusicianController.addInstrumentsToMusician(req, res);

      expect(mockMusician.setInstruments).toHaveBeenCalledWith([], { transaction: mockTransaction });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
