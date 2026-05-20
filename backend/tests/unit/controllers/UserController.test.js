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
import { Musician, User } from '../../../src/models/sequelize.js';

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
    vi.spyOn(console, 'error').mockImplementation(() => {});
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

  describe('registerMusician', () => {
    it('devuelve 201 cuando el registro es exitoso', async () => {
      const mockTransaction = {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      const mockUser = { id: 1, update: vi.fn().mockResolvedValue(true) };
      const mockFullUser = { id: 1, musician: { instruments: [] } };

      User.sequelize.transaction.mockResolvedValue(mockTransaction);
      User.create.mockResolvedValue(mockUser);
      Musician.create.mockResolvedValue({ id: 1 });
      User.findByPk.mockResolvedValue(mockFullUser);

      const req = mockReq({
        body: { full_name: 'Test User', username: 'test', email: 'test@test.com', password: 'pass' }
      });
      const res = mockRes();

      await UserController.registerMusician(req, res);

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Musician registered successfully' })
      );
    });

    it('devuelve 500 y hace rollback cuando la base de datos falla', async () => {
      const mockTransaction = {
        commit: vi.fn(),
        rollback: vi.fn().mockResolvedValue(undefined)
      };
      User.sequelize.transaction.mockResolvedValue(mockTransaction);
      User.create.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ body: { username: 'test', password: 'pass' } });
      const res = mockRes();

      await UserController.registerMusician(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('editUserDetails', () => {
    it('devuelve 200 cuando actualiza los datos del usuario correctamente', async () => {
      const mockUser = {
        id: 1,
        profile_picture: null,
        update: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      const req = mockReq({
        user: { id: 1, profile_picture: null },
        body: { full_name: 'Nuevo Nombre' }
      });
      const res = mockRes();

      await UserController.editUserDetails(req, res);

      expect(mockUser.update).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User details updated successfully' })
      );
    });

    it('devuelve 200 y borra la foto cuando delete_profile_picture es true', async () => {
      const mockUser = {
        id: 1,
        profile_picture: 'https://cloudinary.com/image.jpg',
        update: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      const req = mockReq({
        user: { id: 1, profile_picture: 'https://cloudinary.com/image.jpg' },
        body: { delete_profile_picture: true }
      });
      const res = mockRes();

      await UserController.editUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devuelve 500 cuando la base de datos falla', async () => {
      User.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockReq({
        user: { id: 1 },
        body: { full_name: 'Test' }
      });
      const res = mockRes();

      await UserController.editUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error editing user details' })
      );
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
