import { useEffect, useState } from 'react';
import Field from './Field.jsx';

const EMPTY = { name: '', membership_id: '', role: 'member', password: '' };

export default function UserForm({ user, onSubmit, onCancel }) {
  const editing = Boolean(user);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValues(user ? { name: user.name, membership_id: user.membership_id, role: user.role, password: '' } : EMPTY);
    setErrors({});
    setServerError('');
  }, [user]);

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!values.name.trim()) errs.name = 'Enter a name.';
    if (!values.membership_id.trim()) errs.membership_id = 'Enter a membership ID.';
    if (!editing && values.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (editing && values.password && values.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setServerError('');
    try {
      await onSubmit(values);
      if (!editing) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <h2>{editing ? 'Edit user' : 'Add a user'}</h2>
      <div className="form-grid">
        <Field label="Name" name="name" error={errors.name}>
          <input id="name" name="name" value={values.name} onChange={change} />
        </Field>
        <Field label="Membership ID" name="membership_id" error={errors.membership_id}>
          <input id="membership_id" name="membership_id" value={values.membership_id} onChange={change} />
        </Field>
        <Field label="Role" name="role">
          <select id="role" name="role" value={values.role} onChange={change}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field label={editing ? 'New password (leave blank to keep)' : 'Password'} name="password" error={errors.password}>
          <input id="password" name="password" type="password" value={values.password} onChange={change} autoComplete="new-password" />
        </Field>
      </div>
      {serverError && <p className="form-error" role="alert">{serverError}</p>}
      <div className="actions">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add user'}</button>
        {editing && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
