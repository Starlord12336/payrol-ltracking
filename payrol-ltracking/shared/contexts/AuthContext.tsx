/**
 * Authentication Context
 * Provides global authentication state and methods
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, fetchMe } from '../api/authApi';
import type {
  AuthUser,
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  LoginResponse,
  RegisterResponse,
  ChangePasswordResponse,
} from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (dto: LoginDto) => Promise<LoginResponse>;
  register: (dto: RegisterDto) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  changePassword: (dto: ChangePasswordDto) => Promise<ChangePasswordResponse>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchMe();
      setUser(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // User is not authenticated - this is expected
        setUser(null);
        setError(null);
      } else {
        // Other errors (network, server error, etc.)
        setUser(null);
        setError(err.response?.data?.message || 'Failed to fetch user');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (dto: LoginDto): Promise<LoginResponse> => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await authApi.login(dto);
      setUser(data.user);
      return data;
    } catch (e: any) {
      const msg = e.message || 'Login failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: RegisterDto): Promise<RegisterResponse> => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await authApi.register(dto);
      return data;
    } catch (e: any) {
      const msg = e.message || 'Registration failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout API failed', e);
    } finally {
      setUser(null);
      setError(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const changePassword = async (dto: ChangePasswordDto): Promise<ChangePasswordResponse> => {
    setError(null);
    try {
      return await authApi.changePassword(dto);
    } catch (e: any) {
      const msg = e.message || 'Failed to change password';
      setError(msg);
      throw e;
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    changePassword,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

