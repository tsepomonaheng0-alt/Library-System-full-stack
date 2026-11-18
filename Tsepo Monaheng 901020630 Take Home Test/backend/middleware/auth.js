import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'dev-secret';

export const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, secret(), { expiresIn: '8h' });

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please sign in first.' });
  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can do that.' });
  }
  next();
}
