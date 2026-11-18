import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionLog from '../components/TransactionLog.jsx';

export default function TransactionsPage() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [b, t, u] = await Promise.all([
        api('/books'),
        api('/transactions'),
        isAdmin ? api('/users') : Promise.resolve([]),
      ]);
      setBooks(b);
      setTransactions(t);
      setUsers(u);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(values) {
    await api('/transactions', { method: 'POST', body: values });
    await load();
  }

  async function handleUndo(t) {
    if (!window.confirm('Undo this transaction? The stock count will be reversed.')) return;
    try {
      await api(`/transactions/${t.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Transactions</h1>
        {!isAdmin && <p className="muted">You can borrow and return books. History shows your own activity.</p>}
      </header>
      <TransactionForm books={books} users={users} onSubmit={handleCreate} />
      {error && <p className="form-error" role="alert">{error}</p>}
      <h2 className="section-title">History</h2>
      {loading ? <p className="muted">Loading history…</p> : (
        <TransactionLog transactions={transactions} onUndo={isAdmin ? handleUndo : undefined} />
      )}
    </>
  );
}
