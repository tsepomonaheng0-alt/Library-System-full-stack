import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import LoginForm from '../components/LoginForm.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';

function AdminView() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setUsers(await api('/users'));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(values) {
    if (editing) {
      await api(`/users/${editing.id}`, { method: 'PUT', body: values });
      setEditing(null);
    } else {
      await api('/users', { method: 'POST', body: values });
    }
    await load();
  }

  async function handleDelete(u) {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await api(`/users/${u.id}`, { method: 'DELETE' });
      if (editing?.id === u.id) setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <UserForm user={editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />
      {error && <p className="form-error" role="alert">{error}</p>}
      <UserList users={users} currentUserId={me.id} onEdit={setEditing} onDelete={handleDelete} />
    </>
  );
}

export default function UsersPage() {
  const { user, isAdmin } = useAuth();

  return (
    <>
      <header className="page-head">
        <h1>{user ? 'Users' : 'Welcome back'}</h1>
        {!user && <p className="muted">Sign in with your membership ID to see the library.</p>}
      </header>
      {!user && <LoginForm />}
      {user && !isAdmin && (
        <p className="panel">You're signed in as {user.name}. Only admins can manage users.</p>
      )}
      {isAdmin && <AdminView />}
    </>
  );
}
