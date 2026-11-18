import { useState } from 'react';
import Field from './Field.jsx';
import { useAuth } from '../AuthContext.jsx';

const EMPTY = { book_id: '', type: 'borrow', quantity: '1', user_id: '', note: '' };

export default function TransactionForm({ books, users, onSubmit }) {
  const { isAdmin } = useAuth();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const needsMember = isAdmin && values.type !== 'restock';

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    const qty = Number(values.quantity);
    if (!values.book_id) errs.book_id = 'Choose a book.';
    if (!Number.isInteger(qty) || qty < 1) errs.quantity = 'Enter a whole number, 1 or more.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setServerError('');
    try {
      await onSubmit({
        book_id: Number(values.book_id),
        type: values.type,
        quantity: qty,
        note: values.note,
        user_id: needsMember && values.user_id ? Number(values.user_id) : undefined,
      });
      setValues((v) => ({ ...EMPTY, type: v.type }));
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <h2>Record a transaction</h2>
      <div className="form-grid">
        <Field label="Action" name="type">
          <select id="type" name="type" value={values.type} onChange={change}>
            <option value="borrow">Borrow (deduct stock)</option>
            <option value="return">Return (add back)</option>
            {isAdmin && <option value="restock">Add stock (new arrivals)</option>}
          </select>
        </Field>
        <Field label="Book" name="book_id" error={errors.book_id}>
          <select id="book_id" name="book_id" value={values.book_id} onChange={change}>
            <option value="">Choose a book…</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.title} ({b.quantity} in stock)</option>
            ))}
          </select>
        </Field>
        <Field label="Quantity" name="quantity" error={errors.quantity}>
          <input id="quantity" name="quantity" type="number" min="1" value={values.quantity} onChange={change} />
        </Field>
        {needsMember && (
          <Field label="Member" name="user_id">
            <select id="user_id" name="user_id" value={values.user_id} onChange={change}>
              <option value="">Me</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Note (optional)" name="note">
          <input id="note" name="note" value={values.note} onChange={change} maxLength={255} />
        </Field>
      </div>
      {serverError && <p className="form-error" role="alert">{serverError}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Record transaction'}</button>
    </form>
  );
}
