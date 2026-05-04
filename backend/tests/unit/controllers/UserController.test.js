import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/models/sequelize.js', () => ({
  User: {
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    sequelize: { transaction: vi.fn() }
  },
  Musician: { create: vi.fn() },
  Instrument: {}
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn()
  }
}));

vi.mock('../../../src/middleware/FileHandlerMiddleware.js', () => ({
  addFilenameToBody: vi.fn(),
  addProfilePictureToBody: vi.fn(),
  deleteFileFromCloudinary: vi.fn()
}));

import bcrypt from 'bcryptjs';
import UserController from '../../../src/controllers/UserController.js';
import { User } from '../../../src/models/sequelize.js';

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

describe('UserController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginMusician', () => {
    it('devuelve 200 con credenciales válidas', async () => {
      const fakeUser = { id: 1, password: 'hashed' };
      const fakeValidUser = { id: 1, username: 'test', musician: {} };

      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      User.findByPk.mockResolvedValue(fakeValidUser);

      const req = mockReq({ body: { username: 'test', password: '1234' } });
      const res = mockRes();

      await UserController.loginMusician(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Login successful', user: fakeValidUser })
      );
    });

    it('devuelve 401 cuando el usuario no existe', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.compare.mockResolvedValue(false);

      const req = mockReq({ body: { username: 'noexiste', password: '1234' } });
      const res = mockRes();

      await UserController.loginMusician(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid username/email or password' })
      );
    });

    it('devuelve 401 cuando la contraseña es incorrecta', async () => {
      User.findOne.mockResolvedValue({ id: 1, password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      const req = mockReq({ body: { username: 'test', password: 'wrongpass' } });
      const res = mockRes();

      await UserController.loginMusician(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ body: { username: 'test', password: '1234' } });
      const res = mockRes();

      await UserController.loginMusician(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('isValidProviderToken', () => {
    it('devuelve 200 cuando el token es válido', async () => {
      const fakeUser = { id: 1, musician: {} };
      User.findOne.mockResolvedValue(fakeUser);

      const req = mockReq({ body: { token: 'valid-token-abc123' } });
      const res = mockRes();

      await UserController.isValidProviderToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Provider token is valid' })
      );
    });

    it('devuelve 401 cuando el token no existe en la BD', async () => {
      User.findOne.mockResolvedValue(null);

      const req = mockReq({ body: { token: 'token-invalido' } });
      const res = mockRes();

      await UserController.isValidProviderToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid provider token' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ body: { token: 'cualquier-token' } });
      const res = mockRes();

      await UserController.isValidProviderToken(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('changePassword', () => {
    it('devuelve 200 cuando la contraseña actual es correcta', async () => {
      const fakeUser = {
        id: 1,
        password: 'hashed_current',
        update: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashed_new');

      const req = mockReq({
        user: { id: 1 },
        body: { currentPassword: 'current123', password: 'new123' }
      });
      const res = mockRes();

      await UserController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(fakeUser.update).toHaveBeenCalledWith({ password: 'hashed_new' });
    });

    it('devuelve 401 cuando la contraseña actual es incorrecta', async () => {
      const fakeUser = { id: 1, password: 'hashed_current' };
      User.findByPk.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(false);

      const req = mockReq({
        user: { id: 1 },
        body: { currentPassword: 'wrongpass', password: 'new123' }
      });
      const res = mockRes();

      await UserController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Current password is incorrect' })
      );
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      User.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockReq({
        user: { id: 1 },
        body: { currentPassword: 'current123', password: 'new123' }
      });
      const res = mockRes();

      await UserController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
