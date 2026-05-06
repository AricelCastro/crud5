import React, { createContext, useMemo, useState, useCallback } from 'react';

export const AuthContext = createContext(null);

// Cambia estas credenciales por las que necesites para tu app.
const APP_USER = 'admin';
const APP_PASS = '123456';
const APP_PIN = '1234';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (username, password) => {
    const ok = username === APP_USER && password === APP_PASS;
    setIsAuthenticated(ok);
    return ok;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const verifyActionSecret = useCallback((secret) => {
    const clean = String(secret ?? '').trim();
    if (!clean) return false;
    return clean === APP_PASS || clean === APP_PIN;
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      verifyActionSecret,
    }),
    [isAuthenticated, login, logout, verifyActionSecret]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
