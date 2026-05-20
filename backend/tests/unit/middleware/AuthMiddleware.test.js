import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('passport', () => ({
  default: {
    authenticate: vi.fn()
  }
}));

import passport from 'passport';
import { isLoggedIn } from '../../../src/middleware/AuthMiddleware.js';

describe('AuthMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isLoggedIn', () => {
    it('llama a passport.authenticate con estrategia bearer y session false', () => {
      const mockHandler = vi.fn();
      passport.authenticate.mockReturnValue(mockHandler);

      const req = {};
      const res = {};
      const next = vi.fn();

      isLoggedIn(req, res, next);

      expect(passport.authenticate).toHaveBeenCalledWith('bearer', { session: false });
      expect(mockHandler).toHaveBeenCalledWith(req, res, next);
    });

    it('delega el manejo de la petición al handler devuelto por passport', () => {
      const mockHandler = vi.fn();
      passport.authenticate.mockReturnValue(mockHandler);

      const req = { headers: { authorization: 'Bearer abc123' } };
      const res = { status: vi.fn() };
      const next = vi.fn();

      isLoggedIn(req, res, next);

      expect(mockHandler).toHaveBeenCalledOnce();
    });
  });
});
