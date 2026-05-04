import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Band: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Component: {
    findOne: vi.fn(),
    create: vi.fn()
  },
  Event: {},
  Instrument: {},
  Musician: {},
  Performance: {},
  Rehearsal: {},
  User: {}
}));

vi.mock('../../../src/middleware/FileHandlerMiddleware.js', () => ({
  addFilenameToBody: vi.fn(),
  deleteFileFromCloudinary: vi.fn()
}));

vi.mock('../../../src/controllers/EventController.js', () => ({
  _checkComponentParticipation: vi.fn().mockReturnValue(true)
}));

import BandController from '../../../src/controllers/BandController.js';
import { Band, Component } from '../../../src/models/sequelize.js';

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: 1, musician: { id: 1 } },
  file: null,
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('BandController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMyBands', () => {
    it('devuelve 200 con la lista de bandas del músico', async () => {
      const fakeBands = [{ id: 1, name: 'Banda Test' }, { id: 2, name: 'Otra Banda' }];
      Band.findAll.mockResolvedValue(fakeBands);

      const req = mockReq();
      const res = mockRes();

      await BandController.listMyBands(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(fakeBands);
    });

    it('devuelve lista vacía cuando el músico no tiene bandas', async () => {
      Band.findAll.mockResolvedValue([]);

      const req = mockReq();
      const res = mockRes();

      await BandController.listMyBands(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([]);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Band.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockReq();
      const res = mockRes();

      await BandController.listMyBands(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error fetching my bands' })
      );
    });
  });

  describe('findBandById', () => {
    it('devuelve 200 con los datos de la banda para un admin', async () => {
      const mockBandData = {
        components: [{ musicianId: 1, administrator: true, instruments: [] }],
        events: []
      };
      const mockBand = {
        ...mockBandData,
        toJSON: vi.fn().mockReturnValue(mockBandData)
      };
      Band.findByPk.mockResolvedValue(mockBand);

      const req = mockReq({ params: { bandId: '1' } });
      const res = mockRes();

      await BandController.findBandById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(Band.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    });

    it('devuelve 404 cuando la banda no existe', async () => {
      Band.findByPk.mockResolvedValue(null);

      const req = mockReq({ params: { bandId: '999' } });
      const res = mockRes();

      await BandController.findBandById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Band not found' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Band.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ params: { bandId: '1' } });
      const res = mockRes();

      await BandController.findBandById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('findBandByCode', () => {
    it('devuelve 200 cuando encuentra la banda por código', async () => {
      const fakeBand = { id: 1, name: 'Banda Test', code: 'ABC12345' };
      Band.findOne.mockResolvedValue(fakeBand);

      const req = mockReq({ params: { bandCode: 'ABC12345' } });
      const res = mockRes();

      await BandController.findBandByCode(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(fakeBand);
    });

    it('devuelve 404 cuando el código de banda no existe', async () => {
      Band.findOne.mockResolvedValue(null);

      const req = mockReq({ params: { bandCode: 'NOEXIST' } });
      const res = mockRes();

      await BandController.findBandByCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Band not found' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Band.findOne.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ params: { bandCode: 'ABC12345' } });
      const res = mockRes();

      await BandController.findBandByCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteBand', () => {
    it('devuelve 200 cuando elimina la banda correctamente', async () => {
      const fakeBand = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
      Band.findByPk.mockResolvedValue(fakeBand);

      const req = mockReq({ params: { bandId: '1' } });
      const res = mockRes();

      await BandController.deleteBand(req, res);

      expect(fakeBand.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Band deleted successfully' })
      );
    });

    it('devuelve 404 cuando la banda no existe', async () => {
      Band.findByPk.mockResolvedValue(null);

      const req = mockReq({ params: { bandId: '999' } });
      const res = mockRes();

      await BandController.deleteBand(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Band not found' })
      );
    });

    it('devuelve 500 cuando la base de datos falla al eliminar', async () => {
      const fakeBand = { id: 1, destroy: vi.fn().mockRejectedValue(new Error('DB error')) };
      Band.findByPk.mockResolvedValue(fakeBand);

      const req = mockReq({ params: { bandId: '1' } });
      const res = mockRes();

      await BandController.deleteBand(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateBand', () => {
    it('devuelve 200 cuando actualiza la banda correctamente', async () => {
      const fakeBand = {
        id: 1,
        profile_picture: null,
        update: vi.fn().mockResolvedValue(true)
      };
      Band.findByPk.mockResolvedValue(fakeBand);

      const req = mockReq({
        params: { bandId: '1' },
        body: { name: 'Nueva Nombre' }
      });
      const res = mockRes();

      await BandController.updateBand(req, res);

      expect(fakeBand.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 404 cuando la banda no existe', async () => {
      Band.findByPk.mockResolvedValue(null);

      const req = mockReq({ params: { bandId: '999' }, body: { name: 'Nuevo' } });
      const res = mockRes();

      await BandController.updateBand(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
