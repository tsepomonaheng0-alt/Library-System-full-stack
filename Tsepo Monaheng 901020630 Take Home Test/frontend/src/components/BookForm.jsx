import { useEffect, useState } from 'react';
import Field from './Field.jsx';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '' };

// Used for both adding (book = null) and updating (book = the row being edited).
export default function BookForm({ book, onSubmit, onCancel }) {
  const editing = Boolean(book);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValues(
      book
        ? { title: book.title, author: book.author, genre: book.genre || '', isbn: book.isbn, quantity: String(book.quantity) }
        : EMPTY
    );
    setErrors({});
    setServerError('');
  }, [book]);

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  function validate() {
    const errs = {};
    if (!values.title.trim()) errs.title = 'Enter a title.';
    if (!values.author.trim()) errs.author = 'Enter an author.';
    if (!/^(\d{9}[\dXx]|\d{13})$/.test(values.isbn.replace(/[-\s]/g, ''))) errs.isbn = 'ISBN must be 10 or 13 characters.';
    const qty = Number(values.quantity);
    if (values.quantity === '' || !Number.isInteger(qty) || qty < 0) errs.quantity = 'Enter a whole number, 0 or more.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setServerError('');
    try {
      await onSubmit({ ...values, isbn: values.isbn.replace(/[-\s]/g, ''), quantity: Number(values.quantity) });
      if (!editing) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <h2>{editing ? 'Edit book' : 'Add a book'}</h2>
      <div className="form-grid">
        <Field label="Title" name="title" error={errors.title}>
          <input id="title" name="title" value={values.title} onChange={change} />
        </Field>
        <Field label="Author" name="author" error={errors.author}>
          <input id="author" name="author" value={values.author} onChange={change} />
        </Field>
        <Field label="Genre" name="genre" error={errors.genre}>
          <input id="genre" name="genre" value={values.genre} onChange={change} />
        </Field>
        <Field label="ISBN" name="isbn" error={errors.isbn}>
          <input id="isbn" name="isbn" value={values.isbn} onChange={change} inputMode="numeric" />
        </Field>
        <Field label={editing ? 'Quantity' : 'Initial quantity'} name="quantity" error={errors.quantity}>
          <input id="quantity" name="quantity" type="number" min="0" value={values.quantity} onChange={change} />
        </Field>
      </div>
      {serverError && <p className="form-error" role="alert">{serverError}</p>}
      <div className="actions">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add book'}</button>
        {editing && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
