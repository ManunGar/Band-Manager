import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Agreement: { findByPk: vi.fn() },
  Application: { findOne: vi.fn() },
  Band: {},
  Component: { findOne: vi.fn() },
  Event: {},
  Instrument: {},
  Musician: { findByPk: vi.fn() },
  Performance: { findByPk: vi.fn() }
}));

import {
  canInviteMusician,
  canRateApplication,
  canUpdateApplicationStatus,
  hasNoApprovedApplication,
  hasRequirementToApply,
  hasRequirementToSee,
  isAgreementOwner,
  isEventAdmin,
  isInvitedMusician
} from '../../../src/middleware/AgreementMiddleware.js';
import { Agreement, Application, Component, Musician, Performance } from '../../../src/models/sequelize.js';

const FUTURE_DATE = '2099-01-01';
const PAST_DATE = '2000-01-01';

const mockReq = (overrides = {}) => ({
  params: { agreementId: '1', applicationId: '1' },
  body: { performanceId: '1', musicianId: '2' },
  user: { musician: { id: 1, instruments: [{ id: 5 }] } },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const buildAgreement = (overrides = {}) => ({
  musicianId: 5,
  instrumentId: 5,
  status: 'open',
  performance: {
    Event: {
      band: { id: 1 },
      date: FUTURE_DATE,
      initialTime: '18:00:00'
    }
  },
  ...overrides
});

describe('AgreementMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ─── isEventAdmin ────────────────────────────────────────────────
  describe('isEventAdmin', () => {
    it('llama a next() cuando el músico es admin del evento', async () => {
      Performance.findByPk.mockResolvedValue({ id: 1 });
      const next = vi.fn();

      await isEventAdmin(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 403 cuando la performance no existe o el músico no es admin', async () => {
      Performance.findByPk.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await isEventAdmin(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are not an admin of the event.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Performance.findByPk.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const res = mockRes();

      await isEventAdmin(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── isAgreementOwner ────────────────────────────────────────────
  describe('isAgreementOwner', () => {
    it('llama a next() cuando el músico es dueño del agreement', async () => {
      Agreement.findByPk.mockResolvedValue({ id: 1, musicianId: 1 });
      const next = vi.fn();

      await isAgreementOwner(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 403 cuando el agreement no existe', async () => {
      Agreement.findByPk.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await isAgreementOwner(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('devuelve 403 cuando el músico no es el dueño', async () => {
      Agreement.findByPk.mockResolvedValue({ id: 1, musicianId: 99 });
      const next = vi.fn();
      const res = mockRes();

      await isAgreementOwner(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are not the owner of this agreement.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Agreement.findByPk.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const res = mockRes();

      await isAgreementOwner(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── hasRequirementToSee ─────────────────────────────────────────
  describe('hasRequirementToSee', () => {
    it('devuelve 404 cuando el agreement no existe', async () => {
      Agreement.findByPk.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToSee(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('llama a next() cuando el músico es el dueño del agreement', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 1, instrumentId: 99 }));
      Component.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue(null);
      const next = vi.fn();

      await hasRequirementToSee(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('llama a next() cuando el músico tiene el instrumento requerido', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 5 }));
      Component.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue(null);
      const next = vi.fn();

      await hasRequirementToSee(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('llama a next() cuando el músico tiene historial de aplicación', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 99 }));
      Component.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue({ id: 1 });
      const next = vi.fn();

      await hasRequirementToSee(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 403 cuando el músico no tiene instrumento ni historial', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 99 }));
      Component.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToSee(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You do not have the required instrument for this agreement.' })
      );
    });

    it('devuelve 403 cuando el músico es miembro de la banda sin historial', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 5 }));
      Component.findOne.mockResolvedValue({ id: 1 });
      Application.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToSee(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are a member of the band associated with this agreement.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Agreement.findByPk.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToSee(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── hasRequirementToApply ───────────────────────────────────────
  describe('hasRequirementToApply', () => {
    it('devuelve 404 cuando el agreement no existe', async () => {
      Agreement.findByPk.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToApply(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 403 cuando el músico es el dueño', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 1 }));
      Component.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToApply(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are the owner of this agreement.' })
      );
    });

    it('devuelve 403 cuando el músico no tiene el instrumento requerido', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 99 }));
      Component.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToApply(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You do not have the required instrument for this agreement.' })
      );
    });

    it('devuelve 403 cuando el músico ya es miembro de la banda', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 5 }));
      Component.findOne.mockResolvedValue({ id: 1 });
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToApply(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are a member of the band associated with this agreement.' })
      );
    });

    it('devuelve 403 cuando el agreement está cerrado o el evento ha pasado', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 5, status: 'closed' }));
      Component.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToApply(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. This agreement is not open for applications.' })
      );
    });

    it('devuelve 403 cuando el músico ya tiene una aplicación', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 5 }));
      Component.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue({ id: 1 });
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToApply(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You have already applied to this agreement.' })
      );
    });

    it('llama a next() cuando se cumplen todos los requisitos', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({ musicianId: 5, instrumentId: 5 }));
      Component.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue(null);
      const next = vi.fn();

      await hasRequirementToApply(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Agreement.findByPk.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const res = mockRes();

      await hasRequirementToApply(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── hasNoApprovedApplication ────────────────────────────────────
  describe('hasNoApprovedApplication', () => {
    it('llama a next() cuando no hay aplicaciones aprobadas', async () => {
      Agreement.findByPk.mockResolvedValue({ id: 1, applications: [] });
      const next = vi.fn();

      await hasNoApprovedApplication(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 403 cuando hay aplicaciones aprobadas', async () => {
      Agreement.findByPk.mockResolvedValue({ id: 1, applications: [{ id: 1, status: 'accepted' }] });
      const next = vi.fn();
      const res = mockRes();

      await hasNoApprovedApplication(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. This agreement has approved applications.' })
      );
    });

    it('devuelve 404 cuando el agreement no existe', async () => {
      Agreement.findByPk.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await hasNoApprovedApplication(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Agreement.findByPk.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const res = mockRes();

      await hasNoApprovedApplication(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── canRateApplication ──────────────────────────────────────────
  describe('canRateApplication', () => {
    const buildApplication = (overrides = {}) => ({
      id: 1,
      type: 'musician_apply',
      status: 'accepted',
      agreement: {
        performance: {
          Event: {
            endDate: PAST_DATE,
            date: PAST_DATE,
            endTime: '23:59:59',
            initialTime: '18:00:00'
          }
        }
      },
      ...overrides
    });

    it('llama a next() y asigna req.applicationToRate cuando todo es válido', async () => {
      Application.findOne.mockResolvedValue(buildApplication());
      const next = vi.fn();
      const req = mockReq();

      await canRateApplication(req, mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.applicationToRate).toBeDefined();
    });

    it('devuelve 404 cuando la aplicación no existe', async () => {
      Application.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await canRateApplication(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 403 cuando el tipo de aplicación no es musician_apply', async () => {
      Application.findOne.mockResolvedValue(buildApplication({ type: 'band_invite' }));
      const next = vi.fn();
      const res = mockRes();

      await canRateApplication(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Only musician applications can be rated' })
      );
    });

    it('devuelve 403 cuando la aplicación no está aceptada', async () => {
      Application.findOne.mockResolvedValue(buildApplication({ status: 'pending' }));
      const next = vi.fn();
      const res = mockRes();

      await canRateApplication(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Only accepted applications can be rated' })
      );
    });

    it('devuelve 403 cuando el evento aún no ha terminado', async () => {
      Application.findOne.mockResolvedValue(buildApplication({
        agreement: {
          performance: {
            Event: {
              endDate: FUTURE_DATE,
              date: FUTURE_DATE,
              endTime: '23:59:59',
              initialTime: '18:00:00'
            }
          }
        }
      }));
      const next = vi.fn();
      const res = mockRes();

      await canRateApplication(mockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Application can only be rated after the event has ended' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Application.findOne.mockRejectedValue(new Error('DB error'));
      const res = mockRes();

      await canRateApplication(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── canUpdateApplicationStatus ──────────────────────────────────
  describe('canUpdateApplicationStatus', () => {
    it('llama a next() cuando el evento aún no ha comenzado', async () => {
      Application.findOne.mockResolvedValue({
        agreement: {
          performance: {
            Event: { date: FUTURE_DATE, initialTime: '18:00:00' }
          }
        }
      });
      const next = vi.fn();

      await canUpdateApplicationStatus(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 403 cuando el evento ya comenzó', async () => {
      Application.findOne.mockResolvedValue({
        agreement: {
          performance: {
            Event: { date: PAST_DATE, initialTime: '00:00:00' }
          }
        }
      });
      const next = vi.fn();
      const res = mockRes();

      await canUpdateApplicationStatus(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Application status can only be updated before the event starts' })
      );
    });

    it('devuelve 404 cuando la aplicación no existe', async () => {
      Application.findOne.mockResolvedValue(null);
      const res = mockRes();

      await canUpdateApplicationStatus(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Application.findOne.mockRejectedValue(new Error('DB error'));
      const res = mockRes();

      await canUpdateApplicationStatus(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── canInviteMusician ───────────────────────────────────────────
  describe('canInviteMusician', () => {
    const validAgreement = buildAgreement({ status: 'open' });

    it('devuelve 400 cuando musicianId no es un entero válido', async () => {
      const req = mockReq({ body: { musicianId: 'abc' } });
      const res = mockRes();

      await canInviteMusician(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid musicianId' })
      );
    });

    it('devuelve 400 cuando el agreement no existe o no está abierto', async () => {
      Agreement.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await canInviteMusician(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 403 cuando el evento ya comenzó', async () => {
      Agreement.findByPk.mockResolvedValue(buildAgreement({
        performance: {
          Event: {
            band: { id: 1 },
            date: PAST_DATE,
            initialTime: '00:00:00'
          }
        }
      }));
      const res = mockRes();

      await canInviteMusician(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Cannot invite musicians after event has started' })
      );
    });

    it('devuelve 404 cuando el músico no existe', async () => {
      Agreement.findByPk.mockResolvedValue(validAgreement);
      Musician.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await canInviteMusician(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Musician not found' })
      );
    });

    it('devuelve 403 cuando el músico no tiene el instrumento requerido', async () => {
      Agreement.findByPk.mockResolvedValue(validAgreement);
      Musician.findByPk.mockResolvedValue({ id: 2, instruments: [] });
      const res = mockRes();

      await canInviteMusician(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Musician does not have the required instrument' })
      );
    });

    it('devuelve 403 cuando el músico ya es miembro de la banda', async () => {
      Agreement.findByPk.mockResolvedValue(validAgreement);
      Musician.findByPk.mockResolvedValue({ id: 2, instruments: [{ id: 5 }] });
      Component.findOne.mockResolvedValue({ id: 1 });
      const res = mockRes();

      await canInviteMusician(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Musician is already a member of the band' })
      );
    });

    it('devuelve 403 cuando el músico ya tiene una aplicación', async () => {
      Agreement.findByPk.mockResolvedValue(validAgreement);
      Musician.findByPk.mockResolvedValue({ id: 2, instruments: [{ id: 5 }] });
      Component.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue({ id: 1 });
      const res = mockRes();

      await canInviteMusician(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Musician already has an application for this agreement' })
      );
    });

    it('llama a next() cuando se cumplen todos los requisitos', async () => {
      Agreement.findByPk.mockResolvedValue(validAgreement);
      Musician.findByPk.mockResolvedValue({ id: 2, instruments: [{ id: 5 }] });
      Component.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue(null);
      const next = vi.fn();

      await canInviteMusician(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Agreement.findByPk.mockRejectedValue(new Error('DB error'));
      const res = mockRes();

      await canInviteMusician(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── isInvitedMusician ───────────────────────────────────────────
  describe('isInvitedMusician', () => {
    it('llama a next() cuando existe la invitación pendiente', async () => {
      Application.findOne.mockResolvedValue({ id: 1, type: 'band_invite', status: 'pending' });
      const next = vi.fn();

      await isInvitedMusician(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 404 cuando la invitación no existe o no pertenece al músico', async () => {
      Application.findOne.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await isInvitedMusician(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invitation not found or cannot be updated' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Application.findOne.mockRejectedValue(new Error('DB error'));
      const res = mockRes();

      await isInvitedMusician(mockReq(), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
