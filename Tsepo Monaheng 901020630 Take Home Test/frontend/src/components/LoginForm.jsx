import { useState } from 'react';
import Field from './Field.jsx';
import { useAuth } from '../AuthContext.jsx';

export default function LoginForm() {
  const { login } = useAuth();
  const [values, setValues] = useState({ membership_id: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!values.membership_id.trim()) errs.membership_id = 'Enter your membership ID.';
    if (!values.password) errs.password = 'Enter your password.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setServerError('');
    try {
      await login(values.membership_id.trim(), values.password);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form narrow" onSubmit={handleSubmit} noValidate>
      <h2>Sign in</h2>
      <Field label="Membership ID" name="membership_id" error={errors.membership_id}>
        <input id="membership_id" name="membership_id" value={values.membership_id} onChange={change} autoComplete="username" />
      </Field>
      <Field label="Password" name="password" error={errors.password}>
        <input id="password" name="password" type="password" value={values.password} onChange={change} autoComplete="current-password" />
      </Field>
      {serverError && <p className="form-error" role="alert">{serverError}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
