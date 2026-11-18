import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = async (membership_id, password) => {
    const data = await api('/users/login', { method: 'POST', body: { membership_id, password } });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // api.js fires this when the server says the token is no longer valid.
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin', login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
