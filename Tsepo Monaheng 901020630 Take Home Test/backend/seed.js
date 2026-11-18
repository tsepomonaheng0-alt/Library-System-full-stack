// Run once after creating the tables:  npm run seed
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const [admins] = await pool.query("SELECT id FROM users WHERE membership_id = 'ADMIN001'");
if (!admins.length) {
  await pool.query(
    "INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, 'admin', ?)",
    ['Library Admin', 'ADMIN001', await bcrypt.hash('admin123', 10)]
  );
  await pool.query(
    "INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, 'member', ?)",
    ['Thabo Member', 'MEM001', await bcrypt.hash('member123', 10)]
  );
  console.log('Created ADMIN001 / admin123 and MEM001 / member123');
}

const books = [
  ['Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5],
  ['Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 1],
  ['The Pragmatic Programmer', 'Andrew Hunt', 'Technology', '9780135957059', 3],
  ['Born a Crime', 'Trevor Noah', 'Memoir', '9780399588174', 0],
];
for (const b of books) {
  await pool.query(
    'INSERT IGNORE INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)', b
  );
}
console.log('Seed complete.');
await pool.end();
