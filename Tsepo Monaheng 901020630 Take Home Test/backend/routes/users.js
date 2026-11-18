import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireAuth, requireAdmin, signToken } from '../middleware/auth.js';
import { wrap } from '../middleware/helpers.js';

const router = Router();
const PUBLIC = 'id, name, membership_id, role, created_at';

// Public: sign in with membership ID + password.
router.post('/login', wrap(async (req, res) => {
  const membership_id = String(req.body.membership_id ?? '').trim();
  const password = String(req.body.password ?? '');
  const [rows] = await pool.query('SELECT * FROM users WHERE membership_id = ?', [membership_id]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Membership ID or password is incorrect.' });
  }
  const { password_hash, ...safe } = user;
  res.json({ token: signToken(user), user: safe });
}));

router.use(requireAuth, requireAdmin);

function validate(body, { passwordRequired }) {
  const name = String(body.name ?? '').trim();
  const membership_id = String(body.membership_id ?? '').trim();
  const role = body.role;
  const password = String(body.password ?? '');
  if (!name) return { error: 'Name is required.' };
  if (!membership_id) return { error: 'Membership ID is required.' };
  if (!['admin', 'member'].includes(role)) return { error: 'Role must be admin or member.' };
  if ((passwordRequired || password) && password.length < 6) return { error: 'Password must be at least 6 characters.' };
  return { data: { name, membership_id, role, password } };
}

router.get('/', wrap(async (req, res) => {
  const [rows] = await pool.query(`SELECT ${PUBLIC} FROM users ORDER BY name`);
  res.json(rows);
}));

router.get('/:id', wrap(async (req, res) => {
  const [rows] = await pool.query(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'User not found.' });
  res.json(rows[0]);
}));

router.post('/', wrap(async (req, res) => {
  const { data, error } = validate(req.body, { passwordRequired: true });
  if (error) return res.status(400).json({ error });
  const hash = await bcrypt.hash(data.password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
    [data.name, data.membership_id, data.role, hash]
  );
  res.status(201).json({ id: result.insertId, name: data.name, membership_id: data.membership_id, role: data.role });
}));

router.put('/:id', wrap(async (req, res) => {
  const { data, error } = validate(req.body, { passwordRequired: false });
  if (error) return res.status(400).json({ error });
  const fields = ['name=?', 'membership_id=?', 'role=?'];
  const values = [data.name, data.membership_id, data.role];
  if (data.password) {
    fields.push('password_hash=?');
    values.push(await bcrypt.hash(data.password, 10));
  }
  const [result] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, [...values, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'User not found.' });
  res.json({ id: Number(req.params.id), name: data.name, membership_id: data.membership_id, role: data.role });
}));

router.delete('/:id', wrap(async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: "You can't delete your own account." });
  }
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'User not found.' });
  res.status(204).end();
}));

export default router;
