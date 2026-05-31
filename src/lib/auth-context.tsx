'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  authLoaded: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, nickname: string) => Promise<string | null>;
  adminLogin: (password: string) => Promise<string | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedAdmin = localStorage.getItem('isAdmin');
    if (storedToken) setToken(storedToken);
    if (storedUser) try { setUser(JSON.parse(storedUser)); } catch {}
    if (storedAdmin === 'true') setIsAdmin(true);
    setAuthLoaded(true);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.error) return data.error;

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.removeItem('isAdmin');
    return null;
  }, []);

  const register = useCallback(async (email: string, password: string, nickname: string): Promise<string | null> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    });
    const data = await res.json();
    if (data.error) return data.error;

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.removeItem('isAdmin');
    return null;
  }, []);

  const adminLogin = useCallback(async (password: string): Promise<string | null> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!data.success) return 'Invalid password';

    setToken(data.token);
    setIsAdmin(true);
    localStorage.setItem('token', data.token);
    localStorage.setItem('isAdmin', 'true');
    setUser(null);
    localStorage.removeItem('user');
    return null;
  }, []);

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem('token');
    if (!t) return;
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, authLoaded, login, register, adminLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
