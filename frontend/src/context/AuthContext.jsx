import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { registerRequest, loginRequest, googleLoginRequest, fetchMe } from '../services/authApi.js';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('mister_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession({ token, user, hasProfile }) {
  localStorage.setItem('mister_token', token);
  localStorage.setItem('mister_user', JSON.stringify({ ...user, hasProfile }));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists, verify it's still valid and refresh the user.
  useEffect(() => {
    const token = localStorage.getItem('mister_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(({ user: freshUser, hasProfile }) => {
        const merged = { ...freshUser, hasProfile };
        setUser(merged);
        localStorage.setItem('mister_user', JSON.stringify(merged));
      })
      .catch(() => {
        localStorage.removeItem('mister_token');
        localStorage.removeItem('mister_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (payload) => {
    const result = await registerRequest(payload);
    persistSession(result);
    setUser({ ...result.user, hasProfile: result.hasProfile });
    return result;
  }, []);

  const login = useCallback(async (payload) => {
    const result = await loginRequest(payload);
    persistSession(result);
    setUser({ ...result.user, hasProfile: result.hasProfile });
    return result;
  }, []);

  const loginWithGoogle = useCallback(async ({ idToken, role }) => {
    const result = await googleLoginRequest({ idToken, role });
    persistSession(result);
    setUser({ ...result.user, hasProfile: result.hasProfile });
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mister_token');
    localStorage.removeItem('mister_user');
    setUser(null);
  }, []);

  const value = { user, loading, register, login, loginWithGoogle, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
