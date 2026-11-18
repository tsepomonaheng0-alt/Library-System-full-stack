import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { wrap } from '../middleware/helpers.js';

const router = Router();
router.use(requireAuth);

const TYPES = ['restock', 'borrow', 'return'];
// How each type changes the shelf count.
const sign = (type) => (type === 'borrow' ? -1 : 1);

const SELECT = `
  SELECT t.id, t.book_id, t.user_id, t.type, t.quantity, t.note, t.created_at,
         b.title AS book_title, u.name AS user_name, u.membership_id
  FROM transactions t
  JOIN books b ON b.id = t.book_id
  LEFT JOIN users u ON u.id = t.user_id`;

router.get('/', wrap(async (req, res) => {
  const where = [];
  const params = [];
  if (req.query.book_id) { where.push('t.book_id = ?'); params.push(req.query.book_id); }
  // Members only see their own borrowing history; admins see everything.
  if (req.user.role !== 'admin') { where.push('t.user_id = ?'); params.push(req.user.id); }
  const sql = `${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY t.created_at DESC, t.id DESC LIMIT 200`;
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

router.get('/:id', wrap(async (req, res) => {
  const [rows] = await pool.query(`${SELECT} WHERE t.id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Transaction not found.' });
  if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Only admins can do that.' });
  }
  res.json(rows[0]);
}));

router.post('/', wrap(async (req, res) => {
  const book_id = Number(req.body.book_id);
  const type = req.body.type;
  const quantity = Number(req.body.quantity);
  const note = String(req.body.note ?? '').trim().slice(0, 255) || null;

  if (!Number.isInteger(book_id)) return res.status(400).json({ error: 'Choose a book.' });
  if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid transaction type.' });
  if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1.' });
  if (type === 'restock' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add stock.' });
  }
  // Admins may record a borrow/return for another member; everyone else acts as themselves.
  const user_id = req.user.role === 'admin' && req.body.user_id ? Number(req.body.user_id) : req.user.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Lock the row so two simultaneous borrows can't both take the last copy.
    const [books] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [book_id]);
    if (!books.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Book not found.' });
    }
    const delta = sign(type) * quantity;
    if (books[0].quantity + delta < 0) {
      await conn.rollback();
      return res.status(409).json({ error: `Only ${books[0].quantity} cop${books[0].quantity === 1 ? 'y' : 'ies'} in stock.` });
    }
    await conn.query('UPDATE books SET quantity = quantity + ? WHERE id = ?', [delta, book_id]);
    const [result] = await conn.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity, note) VALUES (?, ?, ?, ?, ?)',
      [book_id, user_id, type, quantity, note]
    );
    await conn.commit();
    res.status(201).json({ id: result.insertId, book_id, user_id, type, quantity, note });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

// Only the note can be edited; changing quantities would silently rewrite history.
router.put('/:id', requireAdmin, wrap(async (req, res) => {
  const note = String(req.body.note ?? '').trim().slice(0, 255) || null;
  const [result] = await pool.query('UPDATE transactions SET note = ? WHERE id = ?', [note, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Transaction not found.' });
  res.json({ id: Number(req.params.id), note });
}));

// Deleting undoes the stock change it made.
router.delete('/:id', requireAdmin, wrap(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT * FROM transactions WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    const t = rows[0];
    const [books] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [t.book_id]);
    const undo = -sign(t.type) * t.quantity;
    if (books[0].quantity + undo < 0) {
      await conn.rollback();
      return res.status(409).json({ error: "Can't undo this: it would leave less than 0 copies in stock." });
    }
    await conn.query('UPDATE books SET quantity = quantity + ? WHERE id = ?', [undo, t.book_id]);
    await conn.query('DELETE FROM transactions WHERE id = ?', [t.id]);
    await conn.commit();
    res.status(204).end();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

export default router;
