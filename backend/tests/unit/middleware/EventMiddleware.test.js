import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  Band: {},
  Component: {},
  Event: { findByPk: vi.fn() },
  Instrument: {}
}));

import { isEventAdmin, isEventParticipant } from '../../../src/middleware/EventMiddleware.js';
import { Event } from '../../../src/models/sequelize.js';

const mockReq = (overrides = {}) => ({
  params: { eventId: '1' },
  user: { musician: { id: 1 } },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('EventMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('isEventAdmin', () => {
    it('llama a next() cuando el músico es admin del evento', async () => {
      Event.findByPk.mockResolvedValue({ id: 1, band: { components: [{ musicianId: 1, administrator: true }] } });
      const next = vi.fn();

      await isEventAdmin(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
      expect(Event.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    });

    it('devuelve 403 cuando el evento no existe o el músico no es admin', async () => {
      Event.findByPk.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await isEventAdmin(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are not an admin of this event.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Event.findByPk.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const res = mockRes();

      await isEventAdmin(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error checking event admin status' })
      );
    });
  });

  describe('isEventParticipant', () => {
    it('llama a next() cuando el evento no tiene restricción de instrumentos', async () => {
      Event.findByPk.mockResolvedValue({ id: 1, instrumentsAttended: [] });
      const next = vi.fn();

      await isEventParticipant(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('llama a next() cuando instrumentsAttended es null', async () => {
      Event.findByPk.mockResolvedValue({ id: 1, instrumentsAttended: null });
      const next = vi.fn();

      await isEventParticipant(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('llama a next() cuando el componente tiene el instrumento requerido', async () => {
      Event.findByPk.mockResolvedValue({
        id: 1,
        instrumentsAttended: [{ id: 5 }],
        band: {
          components: [{ musicianId: 1, instruments: [{ id: 5 }] }]
        }
      });
      const next = vi.fn();

      await isEventParticipant(mockReq(), mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('devuelve 403 cuando el componente no tiene el instrumento requerido', async () => {
      Event.findByPk.mockResolvedValue({
        id: 1,
        instrumentsAttended: [{ id: 5 }],
        band: {
          components: [{ musicianId: 1, instruments: [{ id: 3 }] }]
        }
      });
      const next = vi.fn();
      const res = mockRes();

      await isEventParticipant(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are not a participant of this event.' })
      );
    });

    it('devuelve 403 cuando el evento no existe', async () => {
      Event.findByPk.mockResolvedValue(null);
      const next = vi.fn();
      const res = mockRes();

      await isEventParticipant(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access denied. You are not a participant of this event.' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      Event.findByPk.mockRejectedValue(new Error('DB error'));
      const next = vi.fn();
      const res = mockRes();

      await isEventParticipant(mockReq(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error checking event participant status' })
      );
    });
  });
});
