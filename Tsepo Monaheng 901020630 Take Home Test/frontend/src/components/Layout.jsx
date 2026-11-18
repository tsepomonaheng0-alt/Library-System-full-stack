import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user
    ? [['/', 'Dashboard'], ['/books', 'Limkos Books'], ['/transactions', 'Transactions'], ['/users', 'Users']]
    : [['/users', 'Sign in']];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Library Desk</div>
        <nav aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="whoami">
            <div>
              <strong>{user.name}</strong>
              <span className="muted">{user.role}</span>
            </div>
            <button className="btn btn-quiet" onClick={() => { logout(); navigate('/users'); }}>
              Sign out
            </button>
          </div>
        )}
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
