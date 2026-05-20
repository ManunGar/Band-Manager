import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Agreement: {
    findByPk: vi.fn(),
    findAll: vi.fn(),
    findAndCountAll: vi.fn(),
    create: vi.fn()
  },
  Application: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Band: {},
  Component: { findAll: vi.fn() },
  Event: {},
  Instrument: {},
  Musician: { findByPk: vi.fn() },
  Performance: { findByPk: vi.fn(), findAll: vi.fn() },
  User: {}
}));

import AgreementController from '../../../src/controllers/AgreementController.js';
import { Agreement, Application, Component, Musician, Performance } from '../../../src/models/sequelize.js';

const mockReq = (overrides = {}) => ({
  params: { agreementId: '1', applicationId: '1' },
  body: {},
  query: {},
  user: { musician: { id: 1, instruments: [{ id: 5 }] } },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const buildMockTransaction = () => ({
  commit: vi.fn().mockResolvedValue(undefined),
  rollback: vi.fn().mockResolvedValue(undefined)
});

describe('AgreementController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ─── getAgreement (owner path — cubre _getAgreementOwnerApplications y _getAverageRateByMusician) ──
  describe('getAgreement', () => {
    it('devuelve 200 con aplicaciones enriquecidas cuando el solicitante es el dueño', async () => {
      const mockAgreementJson = { id: 1, musicianId: 1, applications: [] };
      const mockAgreement = {
        id: 1,
        musicianId: 1,
        instrumentId: 5,
        toJSON: vi.fn().mockReturnValue(mockAgreementJson)
      };

      const mockApplicationJson = {
        id: 10, musicianId: 2, agreementId: 1, type: 'musician_apply',
        status: 'pending', rate: null,
        musician: { id: 2, user: { id: 2, full_name: 'Test', location: 'Madrid', profile_picture: null }, instruments: [] }
      };
      const mockApplication = { ...mockApplicationJson, toJSON: vi.fn().mockReturnValue(mockApplicationJson) };

      Agreement.findByPk.mockResolvedValue(mockAgreement);
      Application.findAll
        .mockResolvedValueOnce([mockApplication])   // _getAgreementOwnerApplications
        .mockResolvedValueOnce([]);                  // _getAverageRateByMusician (no rates)

      const req = mockReq();
      const res = mockRes();

      await AgreementController.getAgreement(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(Application.findAll).toHaveBeenCalledTimes(2);
    });

    it('devuelve 200 con averageRate cuando hay aplicaciones aceptadas con rate', async () => {
      const mockAgreementJson = { id: 1, musicianId: 1, applications: [] };
      const mockAgreement = {
        id: 1, musicianId: 1, instrumentId: 5,
        toJSON: vi.fn().mockReturnValue(mockAgreementJson)
      };

      const mockApplicationJson = {
        id: 10, musicianId: 2, agreementId: 1, type: 'musician_apply',
        status: 'accepted', rate: 4,
        musician: {
          id: 2,
          user: { id: 2, full_name: 'Test', location: 'Madrid', profile_picture: null },
          instruments: [{ id: 5, MusicianLevel: { level: 'profesional' } }]
        }
      };
      const mockApplication = { ...mockApplicationJson, toJSON: vi.fn().mockReturnValue(mockApplicationJson) };

      Agreement.findByPk.mockResolvedValue(mockAgreement);
      Application.findAll
        .mockResolvedValueOnce([mockApplication])
        .mockResolvedValueOnce([{ musicianId: 2, averageRate: '4.00' }]);

      const req = mockReq();
      const res = mockRes();

      await AgreementController.getAgreement(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 404 cuando el agreement no existe', async () => {
      Agreement.findByPk.mockResolvedValue(null);

      const res = mockRes();
      await AgreementController.getAgreement(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 200 para un solicitante no dueño ocultando datos de contacto', async () => {
      const mockAgreementJson = {
        id: 1, musicianId: 5, instrumentId: 5,
        applications: [{ id: 10, musicianId: 2, agreementId: 1, type: 'musician_apply', status: 'pending' }],
        musician: { user: { phone: '123', full_name: 'Owner' } }
      };
      const mockAgreement = {
        id: 1, musicianId: 5, instrumentId: 5,
        toJSON: vi.fn().mockReturnValue(mockAgreementJson)
      };

      Agreement.findByPk.mockResolvedValue(mockAgreement);

      const req = mockReq({ user: { musician: { id: 2 } } });
      const res = mockRes();

      await AgreementController.getAgreement(req, res);

      const sentData = res.json.mock.calls[0][0];
      expect(sentData.musician).toBeUndefined();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Agreement.findByPk.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await AgreementController.getAgreement(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── listMyAgreements (cubre _buildEventDateWhere con fechas) ────
  describe('listMyAgreements', () => {
    it('devuelve 200 filtrando por startDate y endDate', async () => {
      Agreement.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { startDate: '2024-01-01', endDate: '2024-12-31' } });
      const res = mockRes();

      await AgreementController.listMyAgreements(req, res);

      expect(Agreement.findAll).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 200 filtrando solo por startDate', async () => {
      Agreement.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { startDate: '2024-01-01' } });
      const res = mockRes();

      await AgreementController.listMyAgreements(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 200 filtrando solo por endDate', async () => {
      Agreement.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { endDate: '2024-12-31' } });
      const res = mockRes();

      await AgreementController.listMyAgreements(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 200 con fechas en orden inverso (normaliza el rango)', async () => {
      Agreement.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { startDate: '2024-12-31', endDate: '2024-01-01' } });
      const res = mockRes();

      await AgreementController.listMyAgreements(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('normaliza fechas en formato ISO (no YYYY-MM-DD) via _formatDateAsLocalYmd', async () => {
      Agreement.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { startDate: '2024-01-01T12:00:00.000Z' } });
      const res = mockRes();

      await AgreementController.listMyAgreements(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('ignora fechas inválidas y devuelve 200', async () => {
      Agreement.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { startDate: 'invalid-date' } });
      const res = mockRes();

      await AgreementController.listMyAgreements(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Agreement.findAll.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await AgreementController.listMyAgreements(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── listMyApplications ──────────────────────────────────────────
  describe('listMyApplications', () => {
    it('devuelve 200 con la lista de aplicaciones', async () => {
      Application.findAll.mockResolvedValue([]);

      const res = mockRes();
      await AgreementController.listMyApplications(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 200 filtrando por fechas', async () => {
      Application.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { startDate: '2024-01-01', endDate: '2024-12-31', search: 'test' } });
      const res = mockRes();

      await AgreementController.listMyApplications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Application.findAll.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await AgreementController.listMyApplications(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── listAdminPerformances ───────────────────────────────────────
  describe('listAdminPerformances', () => {
    it('devuelve 200 con la lista de performances', async () => {
      Performance.findAll.mockResolvedValue([]);

      const res = mockRes();
      await AgreementController.listAdminPerformances(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ─── createAgreement ─────────────────────────────────────────────
  describe('createAgreement', () => {
    it('devuelve 201 cuando crea el agreement correctamente', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      Performance.findByPk.mockResolvedValue({
        Event: { date: futureDate, endDate: null, initialTime: '18:00:00', endTime: null }
      });
      Agreement.create.mockResolvedValue({ id: 1 });

      const req = mockReq({ body: { performanceId: '1', instrumentId: 5, amount: 1, payment: 100 } });
      const res = mockRes();

      await AgreementController.createAgreement(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devuelve 404 cuando la performance no existe', async () => {
      Performance.findByPk.mockResolvedValue(null);

      const res = mockRes();
      await AgreementController.createAgreement(mockReq({ body: { performanceId: '999' } }), res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 400 cuando el evento ya pasó', async () => {
      Performance.findByPk.mockResolvedValue({
        Event: { date: '2000-01-01', endDate: null, initialTime: '18:00:00', endTime: null }
      });

      const res = mockRes();
      await AgreementController.createAgreement(mockReq({ body: { performanceId: '1' } }), res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ─── inviteMusician ──────────────────────────────────────────────
  describe('inviteMusician', () => {
    it('devuelve 201 cuando invita al músico correctamente', async () => {
      Application.create.mockResolvedValue({ id: 1 });

      const req = mockReq({ body: { musicianId: 2 } });
      const res = mockRes();

      await AgreementController.inviteMusician(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Application.create.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await AgreementController.inviteMusician(mockReq({ body: { musicianId: 2 } }), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── applyToAgreement ────────────────────────────────────────────
  describe('applyToAgreement', () => {
    it('devuelve 201 cuando aplica correctamente', async () => {
      Application.create.mockResolvedValue({ id: 1 });

      const res = mockRes();
      await AgreementController.applyToAgreement(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Application.create.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await AgreementController.applyToAgreement(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── rateApplication ─────────────────────────────────────────────
  describe('rateApplication', () => {
    it('devuelve 200 cuando califica la aplicación correctamente', async () => {
      const mockApplication = {
        id: 1, musicianId: 2, agreementId: 1, status: 'accepted', type: 'musician_apply',
        update: vi.fn().mockResolvedValue(true),
        rate: 4
      };

      const req = mockReq({ applicationToRate: mockApplication, body: { rate: 4 } });
      const res = mockRes();

      await AgreementController.rateApplication(req, res);

      expect(mockApplication.update).toHaveBeenCalledWith({ rate: 4 });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 404 cuando no hay aplicación en req', async () => {
      const req = mockReq({ applicationToRate: null, body: { rate: 4 } });
      const res = mockRes();

      await AgreementController.rateApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      const mockApplication = {
        id: 1,
        update: vi.fn().mockRejectedValue(new Error('DB error'))
      };
      const req = mockReq({ applicationToRate: mockApplication, body: { rate: 4 } });
      const res = mockRes();

      await AgreementController.rateApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── listAdminPerformances (caso de error) ────────────────────────
  describe('listAdminPerformances error', () => {
    it('devuelve 500 cuando la base de datos falla', async () => {
      Performance.findAll.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await AgreementController.listAdminPerformances(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── respondToInvite ─────────────────────────────────────────────
  describe('respondToInvite', () => {
    it('devuelve 404 cuando la invitación no existe', async () => {
      const mockTransaction = buildMockTransaction();
      Application.sequelize.transaction.mockResolvedValue(mockTransaction);
      Application.findOne.mockResolvedValue(null);

      const res = mockRes();
      await AgreementController.respondToInvite(mockReq(), res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 y hace rollback cuando la base de datos falla', async () => {
      const mockTransaction = buildMockTransaction();
      Application.sequelize.transaction.mockResolvedValue(mockTransaction);
      Application.findOne.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await AgreementController.respondToInvite(mockReq(), res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── updateApplicationStatus ──────────────────────────────────────
  describe('updateApplicationStatus', () => {
    it('devuelve 404 cuando la aplicación no existe', async () => {
      const mockTransaction = buildMockTransaction();
      Application.sequelize.transaction.mockResolvedValue(mockTransaction);
      Application.findOne.mockResolvedValue(null);

      const res = mockRes();
      await AgreementController.updateApplicationStatus(mockReq({ body: { status: 'accepted' } }), res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 200 sin cambios cuando el estado es el mismo', async () => {
      const mockTransaction = buildMockTransaction();
      const mockApplication = { id: 1, status: 'pending', agreementId: 1, update: vi.fn() };
      Application.sequelize.transaction.mockResolvedValue(mockTransaction);
      Application.findOne.mockResolvedValue(mockApplication);

      const req = mockReq({ body: { status: 'pending' } });
      const res = mockRes();

      await AgreementController.updateApplicationStatus(req, res);

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 400 cuando la transición de estado no es válida', async () => {
      const mockTransaction = buildMockTransaction();
      const mockApplication = { id: 1, status: 'rejected', agreementId: 1, update: vi.fn() };
      Application.sequelize.transaction.mockResolvedValue(mockTransaction);
      Application.findOne.mockResolvedValue(mockApplication);

      const req = mockReq({ body: { status: 'accepted' } });
      const res = mockRes();

      await AgreementController.updateApplicationStatus(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 500 y hace rollback cuando la base de datos falla', async () => {
      const mockTransaction = buildMockTransaction();
      Application.sequelize.transaction.mockResolvedValue(mockTransaction);
      Application.findOne.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await AgreementController.updateApplicationStatus(mockReq({ body: { status: 'accepted' } }), res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
