export const testUser = {
  id: 1,
  username: 'testmusician',
  email: 'test@example.com',
  full_name: 'Test Musician',
  musician: {
    id: 1,
    isProfilePrivate: false,
    instruments: [{ id: 1, name: 'Guitarra' }]
  }
};

export const makeAuthMiddleware = (user = testUser) =>
  (req, res, next) => { req.user = user; next(); };

export const rejectAuthMiddleware = (req, res, next) =>
  res.status(401).json({ error: 'Unauthorized' });
