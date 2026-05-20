import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/models/sequelize.js', () => ({
  Instrument: { findAll: vi.fn() }
}));

import { Instrument } from '../../src/models/sequelize.js';
import loadFileRoutes from '../../src/routes/InstrumentRoute.js';

const app = express();
app.use(express.json());
loadFileRoutes(app);

describe('GET /instruments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('devuelve 200 con la lista de instrumentos', async () => {
    const fakeInstruments = [
      { id: 1, name: 'Guitarra', image: null },
      { id: 2, name: 'Batería', image: null }
    ];
    Instrument.findAll.mockResolvedValue(fakeInstruments);

    const res = await request(app).get('/instruments').expect(200);

    expect(res.body).toEqual(fakeInstruments);
    expect(Instrument.findAll).toHaveBeenCalledOnce();
  });

  it('devuelve lista vacía si no hay instrumentos', async () => {
    Instrument.findAll.mockResolvedValue([]);

    const res = await request(app).get('/instruments').expect(200);

    expect(res.body).toEqual([]);
  });

  it('devuelve 500 cuando la base de datos falla', async () => {
    Instrument.findAll.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/instruments').expect(500);

    expect(res.body).toHaveProperty('error');
  });

  it('no requiere autenticación', async () => {
    Instrument.findAll.mockResolvedValue([]);
    // La ruta no lleva isLoggedIn — debe responder sin Authorization header
    await request(app).get('/instruments').expect(200);
  });
});
