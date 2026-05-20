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
  Event: { create: vi.fn() },
  Instrument: {},
  Musician: {},
  Performance: { create: vi.fn(), update: vi.fn() },
  Rehearsal: { create: vi.fn() },
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
import { Band, Component, Event, Performance, Rehearsal } from '../../../src/models/sequelize.js';

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
    vi.spyOn(console, 'error').mockImplementation(() => {});
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

  describe('createBand', () => {
    it('devuelve 201 cuando crea la banda correctamente', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockBand = { id: 1, update: vi.fn().mockResolvedValue(true) };
      const mockComponent = { addInstrument: vi.fn().mockResolvedValue(true) };

      Band.sequelize.transaction.mockResolvedValue(mockTransaction);
      Band.findOne.mockResolvedValue(null); // para _generateUniqueBandCode
      Band.create.mockResolvedValue(mockBand);
      Component.create.mockResolvedValue(mockComponent);
      Component.findOne.mockResolvedValue(mockComponent);

      const req = mockReq({ body: { name: 'Banda Test', location: 'Madrid', instruments: {} } });
      const res = mockRes();

      await BandController.createBand(req, res);

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Band created successfully' })
      );
    });

    it('devuelve 500 y hace rollback cuando falla la creación', async () => {
      const mockTransaction = {
        commit: vi.fn(),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      Band.sequelize.transaction.mockResolvedValue(mockTransaction);
      Band.findOne.mockResolvedValue(null);
      Band.create.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ body: { name: 'Banda Test', instruments: {} } });
      const res = mockRes();

      await BandController.createBand(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('joinBand', () => {
    it('devuelve 201 cuando el músico se une correctamente', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockComponent = { addInstrument: vi.fn().mockResolvedValue(true) };
      Band.sequelize.transaction.mockResolvedValue(mockTransaction);
      Band.findByPk.mockResolvedValue({ id: 1 });
      Component.create.mockResolvedValue(mockComponent);

      const req = mockReq({ params: { bandId: '1' }, body: { instruments: {} } });
      const res = mockRes();

      await BandController.joinBand(req, res);

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Joined band successfully' })
      );
    });

    it('devuelve 404 cuando la banda no existe', async () => {
      const mockTransaction = {
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      Band.sequelize.transaction.mockResolvedValue(mockTransaction);
      Band.findByPk.mockResolvedValue(null);

      const req = mockReq({ params: { bandId: '999' }, body: { instruments: {} } });
      const res = mockRes();

      await BandController.joinBand(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 y hace rollback cuando falla', async () => {
      const mockTransaction = {
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      Band.sequelize.transaction.mockResolvedValue(mockTransaction);
      Band.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ params: { bandId: '1' }, body: { instruments: {} } });
      const res = mockRes();

      await BandController.joinBand(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addEventToBand', () => {
    it('devuelve 201 al añadir un ensayo correctamente', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockEvent = { id: 1, addInstrumentsAttended: vi.fn().mockResolvedValue(true) };
      Band.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.create.mockResolvedValue(mockEvent);
      Rehearsal.create.mockResolvedValue({ id: 1 });

      const req = mockReq({
        params: { bandId: '1' },
        body: { name: 'Ensayo', date: '2099-01-01', eventType: 'rehearsals' }
      });
      const res = mockRes();

      await BandController.addEventToBand(req, res);

      expect(Rehearsal.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devuelve 201 al añadir una performance correctamente', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockEvent = { id: 1, addInstrumentsAttended: vi.fn().mockResolvedValue(true) };
      Band.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.create.mockResolvedValue(mockEvent);
      Performance.create.mockResolvedValue({ id: 1 });
      Performance.update.mockResolvedValue([1]);

      const req = mockReq({
        params: { bandId: '1' },
        body: { name: 'Concierto', date: '2099-01-01', eventType: 'performances', instruments: [5] }
      });
      const res = mockRes();

      await BandController.addEventToBand(req, res);

      expect(Performance.create).toHaveBeenCalled();
      expect(mockEvent.addInstrumentsAttended).toHaveBeenCalledWith(5, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devuelve 500 y hace rollback cuando falla', async () => {
      const mockTransaction = {
        commit: vi.fn(),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      Band.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.create.mockRejectedValue(new Error('DB error'));

      const req = mockReq({
        params: { bandId: '1' },
        body: { eventType: 'rehearsals' }
      });
      const res = mockRes();

      await BandController.addEventToBand(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
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
