import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { wrap } from '../middleware/helpers.js';

const router = Router();
router.use(requireAuth);

function validate(body) {
  const title = String(body.title ?? '').trim();
  const author = String(body.author ?? '').trim();
  const genre = String(body.genre ?? '').trim();
  const isbn = String(body.isbn ?? '').replace(/[-\s]/g, '');
  const quantity = Number(body.quantity);
  if (!title) return { error: 'Title is required.' };
  if (!author) return { error: 'Author is required.' };
  if (!/^(\d{9}[\dXx]|\d{13})$/.test(isbn)) return { error: 'ISBN must be 10 or 13 characters.' };
  if (!Number.isInteger(quantity) || quantity < 0) return { error: 'Quantity must be a whole number, 0 or more.' };
  return { data: { title, author, genre: genre || null, isbn, quantity } };
}

router.get('/', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books ORDER BY title');
  res.json(rows);
}));

router.get('/:id', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Book not found.' });
  res.json(rows[0]);
}));

router.post('/', requireAdmin, wrap(async (req, res) => {
  const { data, error } = validate(req.body);
  if (error) return res.status(400).json({ error });
  const [result] = await pool.query(
    'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
    [data.title, data.author, data.genre, data.isbn, data.quantity]
  );
  // Record the opening stock in the history so the log matches the shelf.
  if (data.quantity > 0) {
    await pool.query(
      "INSERT INTO transactions (book_id, user_id, type, quantity, note) VALUES (?, ?, 'restock', ?, 'Initial stock')",
      [result.insertId, req.user.id, data.quantity]
    );
  }
  res.status(201).json({ id: result.insertId, ...data });
}));

router.put('/:id', requireAdmin, wrap(async (req, res) => {
  const { data, error } = validate(req.body);
  if (error) return res.status(400).json({ error });
  const [result] = await pool.query(
    'UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?',
    [data.title, data.author, data.genre, data.isbn, data.quantity, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Book not found.' });
  res.json({ id: Number(req.params.id), ...data });
}));

router.delete('/:id', requireAdmin, wrap(async (req, res) => {
  const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Book not found.' });
  res.status(204).end();
}));

export default router;
