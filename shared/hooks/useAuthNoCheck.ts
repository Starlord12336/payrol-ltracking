/**
 * Authentication hook for login/register pages ONLY
 * 
 * Behavior:
 * - On mount: calls /auth/me
 * - If 200 (authenticated) → redirects to home
 * - If 401 (not authenticated) → allows user to stay and log in
 * - On login() success → redirects to home
 * 
 * ⚠️ Use this ONLY on /login and /register pages
 * For all other pages, use useAuth() instead
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

export const useAuthNoCheck = () => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Separate state for initial auth check
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  // If authenticated, redirect to home immediately (before page renders)
  // If not authenticated (401), allow login/register
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsCheckingAuth(true);
      const response = await fetchMe();
      // User is authenticated - redirect to home immediately
      setUser(response.data);
      // Use replace to prevent back button from going to login page
      router.replace('/');
    } catch (err: any) {
      // 401 means not authenticated - this is fine for login/register pages
      // The interceptor won't redirect because /auth/me is in the skip list
      if (err.response?.status === 401) {
        setUser(null);
        setError(null); // No error - user just needs to log in
        setIsCheckingAuth(false); // Allow page to render
      } else {
        // Other errors (network, server error, etc.)
        setError(err.response?.data?.message || 'Failed to check authentication status');
        setUser(null);
        setIsCheckingAuth(false); // Allow page to render even on error
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Check auth status on mount (before page renders)
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (loginDto: LoginDto): Promise<LoginResponse> => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await authApi.login(loginDto);
      // Backend sets httpOnly cookie, we just store user data from response
      setUser(data.user);
      // Redirect to home after successful login
      router.push('/');
      return data;
    } catch (e: any) {
      // Error message is already mapped in authApi
      // The interceptor won't redirect because /auth/login is in the skip list
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
      
      // After successful registration, automatically log in the user
      // Use the same email and password from registration
      try {
        const loginData = await authApi.login({
          email: registerDto.email,
          password: registerDto.password,
        });
        // Set user data from login response
        setUser(loginData.user);
        // Redirect to home after successful login
        router.push('/');
      } catch (loginErr: any) {
        // If auto-login fails, still redirect to home
        // User can log in manually from there
        console.error('Auto-login after registration failed:', loginErr);
        router.push('/');
      }
      
      return data;
    } catch (e: any) {
      // Error message is already mapped in authApi
      // The interceptor won't redirect because /auth/register is in the skip list
      const msg = e.message || 'Registration failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isCheckingAuth, // True while checking if user is already authenticated
    error,
    isAuthenticated: !!user,
    login,
    register,
  };
};

