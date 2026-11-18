import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';

export default function BooksPage() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setBooks(await api('/books'));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(values) {
    if (editing) {
      await api(`/books/${editing.id}`, { method: 'PUT', body: values });
      setEditing(null);
    } else {
      await api('/books', { method: 'POST', body: values });
    }
    await load();
  }

  async function handleDelete(book) {
    if (!window.confirm(`Delete “${book.title}”? Its transaction history will be deleted too.`)) return;
    try {
      await api(`/books/${book.id}`, { method: 'DELETE' });
      if (editing?.id === book.id) setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Limkos Books</h1>
        {!isAdmin && <p className="muted">Only admins can add, update or delete books.</p>}
      </header>
      {isAdmin && <BookForm book={editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />}
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? (
        <p className="muted">Loading books…</p>
      ) : (
        <BookList
          books={books}
          onEdit={isAdmin ? (b) => { setEditing(b); window.scrollTo({ top: 0, behavior: 'smooth' }); } : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      )}
    </>
  );
}
