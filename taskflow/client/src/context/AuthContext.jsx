import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { clearToken, getToken, setToken, setUnauthorizedHandler } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(Boolean(getToken()));

  // Restore the session when the app opens
  useEffect(() => {
    if (!getToken()) return undefined;
    let cancelled = false;
    authService
      .me()
      .then((res) => !cancelled && setUser(res.data.user))
      .catch(() => clearToken())
      .finally(() => !cancelled && setInitializing(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // If any API call comes back 401 (expired token), log out cleanly
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      toast.info('Your session expired. Please log in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, toast]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    setToken(res.token);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (details) => {
    const res = await authService.register(details);
    setToken(res.token);
    setUser(res.data.user);
  }, []);

  const value = useMemo(() => ({ user, initializing, login, register, logout }), [user, initializing, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
