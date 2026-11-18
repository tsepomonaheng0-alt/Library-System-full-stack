import { useEffect, useState } from 'react';
import { api } from '../api.js';
import BookList from '../components/BookList.jsx';
import { LOW_STOCK } from '../constants.js';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/books')
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const low = books.filter((b) => b.quantity < LOW_STOCK);
  const copies = books.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <>
      <header className="page-head">
        <h1>Availability</h1>
        {!loading && !error && (
          <p className="muted">
            {books.length} titles, {copies} copies on the shelf.{' '}
            {low.length > 0
              ? `${low.length} ${low.length === 1 ? 'title is' : 'titles are'} running low (fewer than ${LOW_STOCK} copies).`
              : 'Nothing is running low.'}
          </p>
        )}
      </header>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p className="muted">Loading books…</p> : !error && <BookList books={books} />}
    </>
  );
}
