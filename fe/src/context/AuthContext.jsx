import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getToken, setToken } from '../api/client';
import {
  fetchMe,
  loginRequest,
  registerRequest,
  updateVibeRequest,
} from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const boot = async () => {
      const token = getToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const data = await fetchMe();
        if (active) setUser(data.user);
      } catch {
        setToken(null);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    boot();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await registerRequest(name, email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const setActiveVibeOnUser = useCallback(async (activeVibe) => {
    const data = await updateVibeRequest(activeVibe);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setActiveVibeOnUser,
    }),
    [user, loading, login, register, logout, setActiveVibeOnUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
