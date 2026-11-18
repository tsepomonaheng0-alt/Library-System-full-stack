import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BooksPage from './pages/BooksPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import { useAuth } from './AuthContext.jsx';

// Signed-out visitors land on the Users page, which shows the login form.
function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/users" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/books" element={<Protected><BooksPage /></Protected>} />
        <Route path="/transactions" element={<Protected><TransactionsPage /></Protected>} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
