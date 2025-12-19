/**
 * Authentication hook for protected pages
 * Calls /auth/me on mount to check authentication status
 * Use this in dashboards, layouts, and protected pages
 */

import { useState, useEffect, useCallback } from 'react';
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

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user from /auth/me
  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchMe();
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err: any) {
      // 401 means not authenticated, which is fine - don't set error
      // The interceptor will handle redirect for non-auth endpoints
      if (err.response?.status === 401) {
        setUser(null);
        setError(null);
      } else {
        // Other errors (network, server error, etc.)
        setError(err.response?.data?.message || 'Failed to fetch user');
        setUser(null);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication on mount (once)
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Listen for auth state changes from login/register pages
  useEffect(() => {
    const handleAuthStateChanged = (event: CustomEvent) => {
      // Update user state when auth state changes (e.g., after login)
      if (event.detail?.user) {
        setUser(event.detail.user);
        setError(null);
        setIsLoading(false);
      } else if (event.detail?.isAuthenticated === false) {
        setUser(null);
        setError(null);
        setIsLoading(false);
      }
    };

    // Listen for custom auth state change events
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthStateChanged as EventListener);
      
      return () => {
        window.removeEventListener('auth-state-changed', handleAuthStateChanged as EventListener);
      };
    }
  }, []);

  const login = async (loginDto: LoginDto): Promise<LoginResponse> => {
    setError(null);
    setIsLoading(true);
    try {
      console.log("here")
      const data = await authApi.login(loginDto);
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

  const register = async (registerDto: RegisterDto): Promise<RegisterResponse> => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await authApi.register(registerDto);
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
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      setUser(null);
      setError(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const changePassword = async (changePasswordDto: ChangePasswordDto): Promise<ChangePasswordResponse> => {
    setError(null);
    try {
      return await authApi.changePassword(changePasswordDto);
    } catch (e: any) {
      const msg = e.message || 'Failed to change password';
      setError(msg);
      throw e;
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    changePassword,
    refreshUser,
  };
};