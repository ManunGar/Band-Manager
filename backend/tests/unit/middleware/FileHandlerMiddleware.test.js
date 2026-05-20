import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/bandmanager/bands/new.jpg' }),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    unlinkSync: vi.fn()
  }
}));

vi.mock('../../../src/models/sequelize.js', () => ({
  User: { findByPk: vi.fn() }
}));

vi.mock('multer', () => {
  const single = vi.fn().mockReturnValue((req, res, cb) => cb(null));
  const multerFn = vi.fn().mockReturnValue({ single });
  multerFn.diskStorage = vi.fn().mockReturnValue({});
  return { default: multerFn };
});

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import {
  addFilenameToBody,
  addProfilePictureToBody,
  deleteFileFromCloudinary,
  handleFilesDestroy,
  handleFilesUpload,
  parseBooleanFields,
  parseFloatFields,
  parseJSONFields
} from '../../../src/middleware/FileHandlerMiddleware.js';
import { User } from '../../../src/models/sequelize.js';

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('FileHandlerMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://res.cloudinary.com/bandmanager/bands/new.jpg' });
    cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
    fs.existsSync.mockReturnValue(false);
  });

  // ─── parseJSONFields ─────────────────────────────────────────────
  describe('parseJSONFields', () => {
    it('parsea un campo JSON string a objeto', () => {
      const req = { body: { data: '{"key":"value"}' } };
      const next = vi.fn();

      parseJSONFields('data')(req, mockRes(), next);

      expect(req.body.data).toEqual({ key: 'value' });
      expect(next).toHaveBeenCalledOnce();
    });

    it('parsea múltiples campos JSON', () => {
      const req = { body: { a: '[1,2,3]', b: '{"x":1}' } };
      const next = vi.fn();

      parseJSONFields('a', 'b')(req, mockRes(), next);

      expect(req.body.a).toEqual([1, 2, 3]);
      expect(req.body.b).toEqual({ x: 1 });
    });

    it('deja intacto el campo si ya es un objeto', () => {
      const req = { body: { data: { key: 'value' } } };
      const next = vi.fn();

      parseJSONFields('data')(req, mockRes(), next);

      expect(req.body.data).toEqual({ key: 'value' });
      expect(next).toHaveBeenCalledOnce();
    });

    it('deja intacto el campo si el JSON es inválido', () => {
      const req = { body: { data: 'not-json' } };
      const next = vi.fn();

      parseJSONFields('data')(req, mockRes(), next);

      expect(req.body.data).toBe('not-json');
      expect(next).toHaveBeenCalledOnce();
    });

    it('ignora campos que no existen en body', () => {
      const req = { body: {} };
      const next = vi.fn();

      parseJSONFields('missing')(req, mockRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });
  });

  // ─── parseBooleanFields ──────────────────────────────────────────
  describe('parseBooleanFields', () => {
    it("convierte la string 'true' al booleano true", () => {
      const req = { body: { active: 'true' } };
      const next = vi.fn();

      parseBooleanFields('active')(req, mockRes(), next);

      expect(req.body.active).toBe(true);
      expect(next).toHaveBeenCalledOnce();
    });

    it("convierte la string 'false' al booleano false", () => {
      const req = { body: { active: 'false' } };
      const next = vi.fn();

      parseBooleanFields('active')(req, mockRes(), next);

      expect(req.body.active).toBe(false);
    });

    it('deja intacto un booleano ya parseado', () => {
      const req = { body: { active: true } };
      const next = vi.fn();

      parseBooleanFields('active')(req, mockRes(), next);

      expect(req.body.active).toBe(true);
    });

    it('deja intacto un valor no booleano string', () => {
      const req = { body: { active: 'yes' } };
      const next = vi.fn();

      parseBooleanFields('active')(req, mockRes(), next);

      expect(req.body.active).toBe('yes');
    });

    it('procesa múltiples campos', () => {
      const req = { body: { a: 'true', b: 'false' } };
      const next = vi.fn();

      parseBooleanFields('a', 'b')(req, mockRes(), next);

      expect(req.body.a).toBe(true);
      expect(req.body.b).toBe(false);
    });
  });

  // ─── parseFloatFields ────────────────────────────────────────────
  describe('parseFloatFields', () => {
    it('convierte una string numérica a float', () => {
      const req = { body: { price: '3.14' } };
      const next = vi.fn();

      parseFloatFields('price')(req, mockRes(), next);

      expect(req.body.price).toBe(3.14);
      expect(next).toHaveBeenCalledOnce();
    });

    it('deja intacto un valor ya numérico', () => {
      const req = { body: { price: 3.14 } };
      const next = vi.fn();

      parseFloatFields('price')(req, mockRes(), next);

      expect(req.body.price).toBe(3.14);
    });

    it('deja intacto una string no numérica', () => {
      const req = { body: { price: 'abc' } };
      const next = vi.fn();

      parseFloatFields('price')(req, mockRes(), next);

      expect(req.body.price).toBe('abc');
    });

    it('procesa múltiples campos', () => {
      const req = { body: { a: '1.5', b: '2.7' } };
      const next = vi.fn();

      parseFloatFields('a', 'b')(req, mockRes(), next);

      expect(req.body.a).toBe(1.5);
      expect(req.body.b).toBe(2.7);
    });
  });

  // ─── deleteFileFromCloudinary ────────────────────────────────────
  describe('deleteFileFromCloudinary', () => {
    it('llama a cloudinary.uploader.destroy cuando la URL contiene bandmanager', async () => {
      const fileUrl = 'https://res.cloudinary.com/bandmanager/bands/image.jpg';

      await deleteFileFromCloudinary(fileUrl, 'bands');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledOnce();
    });

    it('no llama a destroy cuando la URL no contiene bandmanager', async () => {
      await deleteFileFromCloudinary('https://other.com/image.jpg', 'bands');

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it('no llama a destroy cuando fileUrl es null', async () => {
      await deleteFileFromCloudinary(null, 'bands');

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });
  });

  // ─── addFilenameToBody ───────────────────────────────────────────
  describe('addFilenameToBody', () => {
    it('no hace nada cuando el campo del archivo no coincide', async () => {
      const req = { file: { fieldname: 'other_field' }, params: {}, body: {} };

      await addFilenameToBody(req, mockRes(), 'profile_picture', {}, 'id', 'bands');

      expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
    });

    it('sube el archivo a Cloudinary y asigna la URL al body', async () => {
      const mockModel = { findByPk: vi.fn().mockResolvedValue(null) };
      const req = {
        file: { fieldname: 'profile_picture', path: '/tmp/test.jpg' },
        params: {},
        body: {}
      };

      await addFilenameToBody(req, mockRes(), 'profile_picture', mockModel, 'bandId', 'bands');

      expect(cloudinary.uploader.upload).toHaveBeenCalledOnce();
      expect(req.body.profile_picture).toBe('https://res.cloudinary.com/bandmanager/bands/new.jpg');
    });

    it('elimina la imagen anterior de Cloudinary si la entidad ya tiene una', async () => {
      const mockModel = {
        findByPk: vi.fn().mockResolvedValue({
          profile_picture: 'https://res.cloudinary.com/bandmanager/bands/old.jpg'
        })
      };
      const req = {
        file: { fieldname: 'profile_picture', path: '/tmp/test.jpg' },
        params: { bandId: '1' },
        body: {}
      };

      await addFilenameToBody(req, mockRes(), 'profile_picture', mockModel, 'bandId', 'bands');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledOnce();
      expect(cloudinary.uploader.upload).toHaveBeenCalledOnce();
    });

    it('devuelve 404 cuando la entidad no existe', async () => {
      const mockModel = { findByPk: vi.fn().mockResolvedValue(null) };
      const req = {
        file: { fieldname: 'profile_picture', path: '/tmp/test.jpg' },
        params: { bandId: '999' },
        body: {}
      };
      const res = mockRes();

      await addFilenameToBody(req, res, 'profile_picture', mockModel, 'bandId', 'bands');
    });

    it('elimina el archivo local tras subirlo si existe', async () => {
      fs.existsSync.mockReturnValue(true);
      const mockModel = { findByPk: vi.fn().mockResolvedValue(null) };
      const req = {
        file: { fieldname: 'profile_picture', path: '/tmp/test.jpg' },
        params: {},
        body: {}
      };

      await addFilenameToBody(req, mockRes(), 'profile_picture', mockModel, 'bandId', 'bands');

      expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.jpg');
    });
  });

  // ─── addProfilePictureToBody ─────────────────────────────────────
  describe('addProfilePictureToBody', () => {
    it('no hace nada cuando no hay archivo', async () => {
      const req = { file: null, user: { id: 1 }, body: {} };

      await addProfilePictureToBody(req);

      expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
    });

    it('sube la foto de perfil y asigna la URL al body', async () => {
      User.findByPk.mockResolvedValue({ id: 1, profile_picture: null });
      const req = {
        file: { fieldname: 'profile_picture', path: '/tmp/test.jpg' },
        user: { id: 1 },
        body: {}
      };

      await addProfilePictureToBody(req);

      expect(cloudinary.uploader.upload).toHaveBeenCalledOnce();
      expect(req.body.profile_picture).toBe('https://res.cloudinary.com/bandmanager/bands/new.jpg');
    });

    it('elimina la imagen anterior si el usuario ya tenía foto de perfil', async () => {
      User.findByPk.mockResolvedValue({
        id: 1,
        profile_picture: 'https://res.cloudinary.com/bandmanager/users/old.jpg'
      });
      const req = {
        file: { fieldname: 'profile_picture', path: '/tmp/test.jpg' },
        user: { id: 1 },
        body: {}
      };

      await addProfilePictureToBody(req);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledOnce();
    });
  });

  // ─── handleFilesUpload ───────────────────────────────────────────
  describe('handleFilesUpload', () => {
    it('llama a next() cuando la subida de archivo tiene éxito', async () => {
      const next = vi.fn();
      const req = {};
      const res = mockRes();

      await new Promise((resolve) => {
        handleFilesUpload('profile_picture', 'uploads/')(req, res, () => {
          next();
          resolve();
        });
      });

      expect(next).toHaveBeenCalledOnce();
    });
  });

  // ─── handleFilesDestroy ──────────────────────────────────────────
  describe('handleFilesDestroy', () => {
    it('devuelve 404 cuando la entidad no existe', async () => {
      const mockModel = { findByPk: vi.fn().mockResolvedValue(null) };
      const req = { params: { id: '999' } };
      const res = mockRes();

      await handleFilesDestroy(mockModel, 'id')(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('llama a next() sin eliminar imagen cuando la entidad no tiene imagen', async () => {
      const mockModel = { findByPk: vi.fn().mockResolvedValue({ id: 1, imagen: null }) };
      const next = vi.fn();
      const req = { params: { id: '1' } };

      await handleFilesDestroy(mockModel, 'id')(req, mockRes(), next);

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledOnce();
    });

    it('elimina de Cloudinary y llama a next() cuando la entidad tiene imagen', async () => {
      const mockModel = {
        findByPk: vi.fn().mockResolvedValue({
          id: 1,
          imagen: 'https://res.cloudinary.com/bandmanager/bands/image.jpg'
        })
      };
      const next = vi.fn();
      const req = { params: { id: '1' } };

      await handleFilesDestroy(mockModel, 'id')(req, mockRes(), next);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledOnce();
      expect(next).toHaveBeenCalledOnce();
    });
  });
});
