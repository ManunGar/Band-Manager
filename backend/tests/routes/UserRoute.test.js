import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/models/sequelize.js', () => ({
  User: {
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Musician: { create: vi.fn() },
  Instrument: {}
}));

vi.mock('../../src/middleware/AuthMiddleware.js', () => ({
  isLoggedIn: vi.fn()
}));

vi.mock('../../src/middleware/FileHandlerMiddleware.js', () => ({
  handleFilesUpload: () => (req, res, next) => next(),
  parseBooleanFields: () => (req, res, next) => next(),
  parseFloatFields: () => (req, res, next) => next(),
  parseJSONFields: () => (req, res, next) => next(),
  addFilenameToBody: vi.fn(),
  addProfilePictureToBody: vi.fn(),
  deleteFileFromCloudinary: vi.fn()
}));

vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn(), hash: vi.fn() }
}));

import bcrypt from 'bcryptjs';
import { makeAuthMiddleware, rejectAuthMiddleware, testUser } from '../helpers/testUser.js';
import { isLoggedIn } from '../../src/middleware/AuthMiddleware.js';
import { Musician, User } from '../../src/models/sequelize.js';
import loadFileRoutes from '../../src/routes/UserRoute.js';

const app = express();
app.use(express.json());
loadFileRoutes(app);

describe('UserRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoggedIn.mockImplementation(makeAuthMiddleware());
  });

  // ── POST /validate/provider-token ───────────────────────────────────────────
  describe('POST /validate/provider-token', () => {
    it('devuelve 200 con token válido', async () => {
      User.findOne.mockResolvedValue({ id: 1, musician: {} });

      const res = await request(app)
        .post('/validate/provider-token')
        .send({ token: 'valid-token-abc123' })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Provider token is valid');
    });

    it('devuelve 401 con token inválido', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/validate/provider-token')
        .send({ token: 'token-invalido' })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('devuelve 422 si el token no se envía', async () => {
      await request(app)
        .post('/validate/provider-token')
        .send({})
        .expect(422);
    });
  });

  // ── POST /login/musician ────────────────────────────────────────────────────
  describe('POST /login/musician', () => {
    it('devuelve 200 con credenciales válidas', async () => {
      User.findOne.mockResolvedValue({ id: 1, password: 'hashedpass' });
      bcrypt.compare.mockResolvedValue(true);
      User.findByPk.mockResolvedValue({ id: 1, username: 'testuser', musician: {} });

      const res = await request(app)
        .post('/login/musician')
        .send({ username: 'testuser', password: 'Password1' })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Login successful');
    });

    it('devuelve 401 con credenciales incorrectas', async () => {
      User.findOne.mockResolvedValue({ id: 1, password: 'hashedpass' });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/login/musician')
        .send({ username: 'testuser', password: 'wrongpass' })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('devuelve 401 cuando el usuario no existe', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.compare.mockResolvedValue(false);

      await request(app)
        .post('/login/musician')
        .send({ username: 'noexiste', password: 'Password1' })
        .expect(401);
    });

    it('devuelve 422 si faltan campos', async () => {
      await request(app)
        .post('/login/musician')
        .send({ username: 'testuser' })
        .expect(422);
    });
  });

  // ── PUT /user/edit ──────────────────────────────────────────────────────────
  describe('PUT /user/edit', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);

      await request(app).put('/user/edit').send({}).expect(401);
    });

    it('devuelve 200 al actualizar datos correctamente', async () => {
      const fakeUser = {
        id: 1,
        profile_picture: null,
        update: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(fakeUser);

      const res = await request(app)
        .put('/user/edit')
        .send({ full_name: 'Nuevo Nombre' })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'User details updated successfully');
    });

    it('devuelve 422 si el email tiene formato inválido', async () => {
      await request(app)
        .put('/user/edit')
        .send({ email: 'no-es-email' })
        .expect(422);
    });
  });

  // ── PUT /user/change-password ───────────────────────────────────────────────
  describe('PUT /user/change-password', () => {
    it('devuelve 401 sin autenticación', async () => {
      isLoggedIn.mockImplementation(rejectAuthMiddleware);

      await request(app).put('/user/change-password').send({}).expect(401);
    });

    it('devuelve 200 al cambiar la contraseña correctamente', async () => {
      const fakeUser = {
        id: 1,
        password: 'OldHash',
        update: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('NewHash');

      const res = await request(app)
        .put('/user/change-password')
        .send({
          currentPassword: 'CurrentPass1',
          password: 'NewPass123',
          repeatPassword: 'NewPass123'
        })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('devuelve 401 cuando la contraseña actual es incorrecta', async () => {
      User.findByPk.mockResolvedValue({ id: 1, password: 'OldHash' });
      bcrypt.compare.mockResolvedValue(false);

      await request(app)
        .put('/user/change-password')
        .send({
          currentPassword: 'WrongPass1',
          password: 'NewPass123',
          repeatPassword: 'NewPass123'
        })
        .expect(401);
    });

    it('devuelve 422 si las contraseñas no coinciden', async () => {
      await request(app)
        .put('/user/change-password')
        .send({
          currentPassword: 'Current1',
          password: 'NewPass123',
          repeatPassword: 'OtraPass456'
        })
        .expect(422);
    });

    it('devuelve 422 si la contraseña no cumple requisitos de seguridad', async () => {
      await request(app)
        .put('/user/change-password')
        .send({
          currentPassword: 'Current1',
          password: 'sinmayusculas1',
          repeatPassword: 'sinmayusculas1'
        })
        .expect(422);
    });
  });
});
