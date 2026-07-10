'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  class_name?: string;
  profile_photo_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Track if we already validated this session so we don't re-validate on every navigation
  const validatedRef = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!savedUser || !token) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        // Set user immediately from localStorage — no API call needed
        // This makes navigation instant
        setUser(parsedUser);

        // Only validate token once per browser session (not on every navigation)
        if (!validatedRef.current) {
          validatedRef.current = true;
          // Validate in background — don't block rendering
          validateTokenInBackground(parsedUser, token);
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }

      // Set loading false immediately after reading localStorage
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const validateTokenInBackground = async (parsedUser: User, token: string) => {
    try {
      // Suppress error logging for background validation to reduce console noise
      const response = await api.me.getProfile();
      if (response?.data) {
        const updatedUser = response.data as User;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      // Only logout if it's a 401 (token expired/invalid)
      // Don't logout on network errors or 500s
      const is401 = error?.status === 401 || 
                    (error instanceof Error && (
                      error.message.includes('401') || 
                      error.message.includes('Unauthenticated')
                    ));
      
      if (is401) {
        console.warn('[AuthContext] Token expired or invalid, logging out');
        logoutInternal();
        // Optionally redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        // For other errors (network, 500, etc.), keep the user logged in
        console.warn('[AuthContext] Background validation failed (not 401), keeping user logged in:', error?.message);
      }
    }
  };

  const logoutInternal = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    validatedRef.current = false;
  };

  const login = (newUser: User, token: string) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('token', token);
    validatedRef.current = true; // Just logged in — token is fresh
  };

  const logout = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await api.logout();
      } catch (error) {
        console.warn('[AuthContext] Server logout failed, continuing local logout:', error);
      }
    }

    logoutInternal();
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await api.me.getProfile();
      if (response?.data) {
        const updatedUser = response.data as User;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
