import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '../constants';

/**
 * API Client Configuration
 * Centralized axios instance for all API calls
 * Uses cookie-based authentication (httpOnly cookies set by backend)
 */

const API_BASE_URL = ENV.API_URL;
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      // Enable credentials to send/receive cookies
      withCredentials: true,
    });

    // Debug: Log requests in development
    if (process.env.NODE_ENV === 'development') {
      this.client.interceptors.request.use(
        (config) => {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
          return config;
        },
        (error) => Promise.reject(error)
      );
    }

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // Debug: Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log('API Response:', response.status, response.config.url);
        }
        return response;
      },
      (error) => {
        // Debug: Log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(
            'API Error:',
            error.response?.status,
            error.config?.url,
            error.message
          );
        }

        const status = error.response?.status;
        const url: string = error.config?.url || '';

        if (status === 401) {
          const isAuthEndpoint =
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/me') ||
            url.includes('/auth/change-password');

          // ⛔️ Do NOT redirect on auth routes
          // This allows login/register pages to show proper error messages
          // and prevents redirect loops on /auth/me
          if (!isAuthEndpoint) {
            // Handle unauthorized - redirect to login
            // This is the safety net for all subteams who don't protect their routes
            this.handleUnauthorized();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      // Clear any client-side auth state
      window.location.href = '/login';
    }
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();

