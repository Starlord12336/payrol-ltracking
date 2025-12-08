/**
 * Centralized authentication API functions
 * Handles all auth-related API calls and error mapping
 */

import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import type {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  LoginResponse,
  RegisterResponse,
  ChangePasswordResponse,
  AuthUser,
} from '../types/auth';

/**
 * Fetch current authenticated user
 */
export const fetchMe = () => apiClient.get<AuthUser>(API_ENDPOINTS.AUTH.ME);

/**
 * Map login errors to user-friendly messages
 */
const getLoginErrorMessage = (err: any): string => {
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || '';

    switch (status) {
      case 401:
        if (message.includes('not found') || message.includes('User not found')) {
          return 'Email not found. Please check your email address.';
        }
        if (message.includes('Invalid credentials') || message.includes('password')) {
          return 'Incorrect email or password. Please try again.';
        }
        if (message.includes('Password not set')) {
          return 'Password not set. Please contact administrator.';
        }
        if (message.includes('Account status')) {
          return message || 'Your account is not active. Please contact administrator.';
        }
        return 'Invalid email or password. Please try again.';
      case 404:
        return 'Email not found. Please check your email address.';
      case 400:
        return message || 'Invalid request. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return message || 'Login failed. Please try again.';
    }
  }

  if (err.request) {
    return 'Network error. Please check your connection and try again.';
  }

  return err.message || 'An unexpected error occurred.';
};

/**
 * Map register errors to user-friendly messages
 */
const getRegisterErrorMessage = (err: any): string => {
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || '';

    switch (status) {
      case 409:
        if (message.includes('Email already exists')) {
          return 'This email is already registered. Please use a different email or try logging in.';
        }
        if (message.includes('National ID already exists')) {
          return 'This national ID is already registered.';
        }
        return message || 'This information is already in use.';
      case 400:
        return message || 'Invalid information. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return message || 'Registration failed. Please try again.';
    }
  }

  if (err.request) {
    return 'Network error. Please check your connection and try again.';
  }

  return err.message || 'An unexpected error occurred.';
};

/**
 * Authentication API functions
 */
export const authApi = {
  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, dto);
      return res.data;
    } catch (err: any) {
      throw new Error(getLoginErrorMessage(err));
    }
  },

  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<RegisterResponse> {
    try {
      const res = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, dto);
      return res.data;
    } catch (err: any) {
      throw new Error(getRegisterErrorMessage(err));
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Change user password
   */
  async changePassword(dto: ChangePasswordDto): Promise<ChangePasswordResponse> {
    const res = await apiClient.post<ChangePasswordResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      dto
    );
    return res.data;
  },
};

