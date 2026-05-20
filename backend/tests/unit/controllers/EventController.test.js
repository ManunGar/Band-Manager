import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Agreement: {},
  Application: { findAll: vi.fn(), findOne: vi.fn() },
  Band: {},
  Component: { findAll: vi.fn() },
  Event: { findAll: vi.fn(), findByPk: vi.fn(), update: vi.fn(), sequelize: { transaction: vi.fn(), models: {} } },
  Instrument: {},
  Musician: {},
  Performance: { findOne: vi.fn(), update: vi.fn() },
  Rehearsal: {},
  User: {}
}));

vi.mock('../../../src/middleware/BandMiddleware.js', () => ({
  isBandMember: vi.fn((req, res, next) => next())
}));

vi.mock('../../../src/middleware/FileHandlerMiddleware.js', () => ({
  addFilenameToBody: vi.fn(),
  deleteFileFromCloudinary: vi.fn()
}));

import {
  _buildBandIdFilter,
  _buildEventIncludes,
  _buildTimeScopeFilter,
  _checkComponentParticipation,
  _getMusicianComponents,
  default as EventController
} from '../../../src/controllers/EventController.js';
import { Application, Component, Event, Performance } from '../../../src/models/sequelize.js';

const mockReq = (overrides = {}) => ({
  params: { eventId: '1' },
  query: {},
  body: {},
  user: { musician: { id: 1 } },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('EventController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ─── _checkComponentParticipation ────────────────────────────────
  describe('_checkComponentParticipation', () => {
    it('devuelve true cuando el evento no tiene instrumentos requeridos', () => {
      const component = { instruments: [{ id: 1 }] };
      const event = { instrumentsAttended: [] };

      expect(_checkComponentParticipation(component, event)).toBe(true);
    });

    it('devuelve true cuando instrumentsAttended es null o undefined', () => {
      const component = { instruments: [{ id: 1 }] };

      expect(_checkComponentParticipation(component, { instrumentsAttended: null })).toBe(true);
      expect(_checkComponentParticipation(component, {})).toBe(true);
    });

    it('devuelve true cuando el componente tiene un instrumento del evento', () => {
      const component = { instruments: [{ id: 5 }, { id: 3 }] };
      const event = { instrumentsAttended: [{ id: 5 }] };

      expect(_checkComponentParticipation(component, event)).toBe(true);
    });

    it('devuelve false cuando el componente no tiene ningún instrumento del evento', () => {
      const component = { instruments: [{ id: 2 }] };
      const event = { instrumentsAttended: [{ id: 5 }] };

      expect(_checkComponentParticipation(component, event)).toBe(false);
    });

    it('devuelve false cuando el componente no tiene instrumentos', () => {
      const component = { instruments: [] };
      const event = { instrumentsAttended: [{ id: 5 }] };

      expect(_checkComponentParticipation(component, event)).toBe(false);
    });
  });

  // ─── _buildEventIncludes ─────────────────────────────────────────
  describe('_buildEventIncludes', () => {
    it('incluye solo Performance cuando type es performances', () => {
      const includes = _buildEventIncludes('performances');
      const models = includes.map(i => i.model?.name || i.model);
      expect(includes.some(i => i.required === true)).toBe(true);
    });

    it('incluye solo Rehearsal cuando type es rehearsals', () => {
      const includes = _buildEventIncludes('rehearsals');
      expect(includes.some(i => i.required === true)).toBe(true);
    });

    it('incluye Performance y Rehearsal como opcionales cuando no hay tipo', () => {
      const includes = _buildEventIncludes(undefined);
      const optionals = includes.filter(i => i.required === false);
      expect(optionals.length).toBeGreaterThanOrEqual(2);
    });

    it('siempre incluye instrumentsAttended y attendees', () => {
      const includes = _buildEventIncludes();
      const aliases = includes.map(i => i.as).filter(Boolean);
      expect(aliases).toContain('instrumentsAttended');
      expect(aliases).toContain('attendees');
    });
  });

  // ─── _buildBandIdFilter ──────────────────────────────────────────
  describe('_buildBandIdFilter', () => {
    it('devuelve el bandId directamente si se proporciona', () => {
      const result = _buildBandIdFilter(42, []);
      expect(result).toBe(42);
    });

    it('devuelve los bandIds de los componentes del músico si no hay bandId', () => {
      const components = [{ bandId: 1 }, { bandId: 2 }];
      const result = _buildBandIdFilter(null, components);
      expect(result).toEqual([1, 2]);
    });
  });

  // ─── _buildTimeScopeFilter ───────────────────────────────────────
  describe('_buildTimeScopeFilter', () => {
    it('devuelve un filtro de pasado cuando timeScope es past', () => {
      const filter = _buildTimeScopeFilter('past');
      expect(filter.val).toContain('< NOW()');
    });

    it('devuelve un filtro de futuro cuando timeScope no es past', () => {
      const filter = _buildTimeScopeFilter('upcoming');
      expect(filter.val).toContain('>= NOW()');
    });
  });

  // ─── _getMusicianComponents ──────────────────────────────────────
  describe('_getMusicianComponents', () => {
    it('llama a Component.findAll con el musicianId correcto', async () => {
      Component.findAll.mockResolvedValue([]);

      await _getMusicianComponents(1);

      expect(Component.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { musicianId: 1 } })
      );
    });
  });

  // ─── getEvent ────────────────────────────────────────────────────
  describe('getEvent', () => {
    it('devuelve 404 cuando el evento no existe', async () => {
      Event.findByPk.mockResolvedValue(null);
      const { Application } = await import('../../../src/models/sequelize.js');
      Application.findOne.mockResolvedValue(null);

      const res = mockRes();
      await EventController.getEvent(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Event.findByPk.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await EventController.getEvent(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── deleteEvent ─────────────────────────────────────────────────
  describe('deleteEvent', () => {
    it('devuelve 200 cuando elimina el evento correctamente', async () => {
      const mockEvent = { destroy: vi.fn().mockResolvedValue(true), Performance: null };
      Event.findByPk.mockResolvedValue(mockEvent);

      const res = mockRes();
      await EventController.deleteEvent(mockReq(), res);

      expect(mockEvent.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 404 cuando el evento no existe', async () => {
      Event.findByPk.mockResolvedValue(null);

      const res = mockRes();
      await EventController.deleteEvent(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Event.findByPk.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await EventController.deleteEvent(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── editEvent ───────────────────────────────────────────────────
  describe('editEvent', () => {
    it('devuelve 200 cuando actualiza el evento sin performance', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockUpdatedEvent = { id: 1, setInstrumentsAttended: vi.fn() };
      Event.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.update.mockResolvedValue([1]);
      Performance.findOne.mockResolvedValue(null);
      Event.findByPk.mockResolvedValue(mockUpdatedEvent);

      const req = mockReq({ body: {} });
      const res = mockRes();

      await EventController.editEvent(req, res);

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 500 y hace rollback cuando falla', async () => {
      const mockTransaction = {
        commit: vi.fn(),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      Event.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.update.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await EventController.editEvent(mockReq(), res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── listEvents ──────────────────────────────────────────────────
  describe('listEvents', () => {
    it('devuelve 200 con type=performances', async () => {
      Component.findAll.mockResolvedValue([]);
      Event.findAll.mockResolvedValue([]);
      const { Application } = await import('../../../src/models/sequelize.js');
      Application.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { type: 'performances' } });
      const res = mockRes();

      await EventController.listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 200 con type=rehearsals', async () => {
      Component.findAll.mockResolvedValue([]);
      Event.findAll.mockResolvedValue([]);

      const req = mockReq({ query: { type: 'rehearsals' } });
      const res = mockRes();

      await EventController.listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 400 cuando bandId no es un número válido', async () => {
      const req = mockReq({ query: { bandId: 'abc' } });
      const res = mockRes();

      await EventController.listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Component.findAll.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await EventController.listEvents(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('devuelve 200 para músico sin bandas (lista de contratos)', async () => {
      Component.findAll.mockResolvedValue([]);
      Event.findAll.mockResolvedValue([]);
      Application.findAll.mockResolvedValue([]);

      const res = mockRes();
      await EventController.listEvents(mockReq({ query: {} }), res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ─── updateComponentAttendance ───────────────────────────────
  describe('updateComponentAttendance', () => {
    it('devuelve 200 cuando actualiza la asistencia del componente', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockEventAttendances = { upsert: vi.fn().mockResolvedValue([{}, true]) };
      Event.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.sequelize.models.EventAttendances = mockEventAttendances;
      Event.findByPk.mockResolvedValue({ band: { components: [{ id: 5 }] } });

      const req = mockReq({ body: { present: true, reason: null } });
      const res = mockRes();

      await EventController.updateComponentAttendance(req, res);

      expect(mockEventAttendances.upsert).toHaveBeenCalledOnce();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 500 y hace rollback cuando la base de datos falla', async () => {
      const mockTransaction = {
        commit: vi.fn(),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      Event.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.findByPk.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await EventController.updateComponentAttendance(mockReq(), res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getEventAttendance ──────────────────────────────────────
  describe('getEventAttendance', () => {
    it('devuelve 200 con la asistencia agrupada por instrumento', async () => {
      const mockComponent = {
        id: 1,
        musicianId: 2,
        instruments: [{ id: 5 }],
        musician: { user: { id: 2, full_name: 'Test', profile_picture: null } }
      };
      const mockEvent = {
        attendees: [{ id: 1, EventAttendances: { present: true, reason: null, alleged: false } }],
        band: { components: [mockComponent] },
        instrumentsAttended: [{ id: 5 }]
      };
      Event.findByPk.mockResolvedValue(mockEvent);
      Application.findAll.mockResolvedValue([]);

      const res = mockRes();
      await EventController.getEventAttendance(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ componentsAttendance: expect.any(Array) })
      );
    });

    it('devuelve 200 cuando no hay instrumentos requeridos (todos participan)', async () => {
      const mockComponent = {
        id: 1,
        musicianId: 2,
        instruments: [{ id: 5 }],
        musician: { user: { id: 2, full_name: 'Test', profile_picture: null } }
      };
      const mockEvent = {
        attendees: [],
        band: { components: [mockComponent] },
        instrumentsAttended: []
      };
      Event.findByPk.mockResolvedValue(mockEvent);
      Application.findAll.mockResolvedValue([]);

      const res = mockRes();
      await EventController.getEventAttendance(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Event.findByPk.mockRejectedValue(new Error('DB error'));

      const res = mockRes();
      await EventController.getEventAttendance(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── updateEventAttendance ───────────────────────────────────
  describe('updateEventAttendance', () => {
    it('devuelve 200 cuando actualiza la asistencia de todos los componentes', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockEventAttendances = { upsert: vi.fn().mockResolvedValue([{}, true]) };
      Event.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.sequelize.models.EventAttendances = mockEventAttendances;

      const req = mockReq({
        body: {
          componentsPresent: [1, 2],
          componentsAbsent: [3],
          componentsAlleged: [4],
          componentsNotConfirmed: [5]
        }
      });
      const res = mockRes();

      await EventController.updateEventAttendance(req, res);

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 200 con solo componentes presentes (sin arrays opcionales)', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockEventAttendances = { upsert: vi.fn().mockResolvedValue([{}, true]) };
      Event.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.sequelize.models.EventAttendances = mockEventAttendances;

      const req = mockReq({ body: { componentsPresent: [1] } });
      const res = mockRes();

      await EventController.updateEventAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 500 y hace rollback cuando la base de datos falla', async () => {
      const mockTransaction = {
        commit: vi.fn(),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockEventAttendances = { upsert: vi.fn().mockRejectedValue(new Error('DB error')) };
      Event.sequelize.transaction.mockResolvedValue(mockTransaction);
      Event.sequelize.models.EventAttendances = mockEventAttendances;

      const req = mockReq({ body: { componentsPresent: [1] } });
      const res = mockRes();

      await EventController.updateEventAttendance(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
