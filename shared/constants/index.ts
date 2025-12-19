/**
 * Shared constants used across the application
 */

// Environment configuration
export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENV || 'development',
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'HR Management System',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  ENABLE_REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true',
  SESSION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '1440', 10),
  ITEMS_PER_PAGE: parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE || '10', 10),
  DATE_FORMAT: process.env.NEXT_PUBLIC_DATE_FORMAT || 'DD/MM/YYYY',
  TIME_FORMAT: process.env.NEXT_PUBLIC_TIME_FORMAT || '24h',
  LOCALE: process.env.NEXT_PUBLIC_LOCALE || 'en-US',
  DEBUG_API: process.env.NEXT_PUBLIC_DEBUG_API === 'true',
  USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
} as const;

// Feature flags
export const FEATURES = {
  EMPLOYEE_PROFILE: process.env.NEXT_PUBLIC_ENABLE_EMPLOYEE_PROFILE !== 'false',
  LEAVES: process.env.NEXT_PUBLIC_ENABLE_LEAVES !== 'false',
  ORGANIZATION_STRUCTURE: process.env.NEXT_PUBLIC_ENABLE_ORGANIZATION_STRUCTURE !== 'false',
  PAYROLL: process.env.NEXT_PUBLIC_ENABLE_PAYROLL !== 'false',
  PERFORMANCE: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE !== 'false',
  RECRUITMENT: process.env.NEXT_PUBLIC_ENABLE_RECRUITMENT !== 'false',
  TIME_MANAGEMENT: process.env.NEXT_PUBLIC_ENABLE_TIME_MANAGEMENT !== 'false',
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ERROR_TRACKING: process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true',
  MAINTENANCE_MODE: process.env.NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE === 'true',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  EMPLOYEE_PROFILE: '/employee-profile',
  LEAVES: '/leaves',
  ORGANIZATION_STRUCTURE: '/organization-structure',
  PAYROLL_CONFIGURATION: '/payroll-configuration',
  PAYROLL_EXECUTION: '/payroll-execution',
  PAYROLL_TRACKING: '/payroll-tracking',
  PERFORMANCE: '/performance',
  RECRUITMENT: '/recruitment',
  TIME_MANAGEMENT: '/time-management',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EMPLOYEE_PROFILE: '/modules/employee-profile',
  HR_DASHBOARD: '/modules/hr',
  HR_EMPLOYEES: '/modules/hr/employees',
  HR_CHANGE_REQUESTS: '/modules/hr/change-requests',
  HR_ROLES: '/modules/hr/roles',
  LEAVES: '/modules/leaves',
  ORGANIZATION_STRUCTURE: '/modules/organization-structure',
  PAYROLL_CONFIGURATION: '/modules/payroll-configuration',
  PAYROLL_EXECUTION: '/modules/payroll-execution',
  PAYROLL_TRACKING: '/modules/payroll-tracking',
  PERFORMANCE: '/modules/performance',
  RECRUITMENT: '/modules/recruitment',
  TIME_MANAGEMENT: '/modules/time-management',
  EMPLOYEE_TIME_MANAGEMENT: '/modules/time-management/EmployeeDashboard',
} as const;

export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  HR_MANAGER: 'hr_manager',
  HR_EMPLOYEE: 'hr_employee',
  PAYROLL_MANAGER: 'payroll_manager',
  PAYROLL_SPECIALIST: 'payroll_specialist',
  FINANCE_STAFF: 'finance_staff',
  DEPARTMENT_MANAGER: 'department_manager',
  EMPLOYEE: 'employee',
} as const;

