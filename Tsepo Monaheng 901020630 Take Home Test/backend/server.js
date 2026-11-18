import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books.js';
import usersRouter from './routes/users.js';
import transactionsRouter from './routes/transactions.js';
import { errorHandler } from './middleware/helpers.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/transactions', transactionsRouter);

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
