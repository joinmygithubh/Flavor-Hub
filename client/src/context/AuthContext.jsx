import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../api/authService.js';
import { tokenStorage } from '../api/axiosInstance.js';

const AuthContext = createContext(null);

/**
 * Holds the authenticated user and exposes login/signup/logout.
 * On mount, if a token exists we re-validate it by fetching the profile so a
 * stale/expired token logs the user out cleanly.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!tokenStorage.get()) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await authService.getMe();
        setUser(me);
      } catch {
        tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const persistSession = useCallback(({ token, user: u }) => {
    tokenStorage.set(token);
    setUser(u);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      persistSession(data);
      return data.user;
    },
    [persistSession]
  );

  const signup = useCallback(
    async (payload) => {
      const data = await authService.signup(payload);
      persistSession(data);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    signup,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
