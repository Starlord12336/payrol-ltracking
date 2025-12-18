'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthNoCheck } from '@/shared/hooks/useAuthNoCheck';
import { Button, Input, Card } from '@/shared/components';
import type { RegisterDto, UserType } from '@/shared/types/auth';
import { Gender, MaritalStatus } from '@/shared/types/auth';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  // useAuthNoCheck: checks if already logged in and redirects if so
  // If not logged in, allows registration
  const { register, isLoading, isCheckingAuth, error } = useAuthNoCheck();
  const [formData, setFormData] = useState<RegisterDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    nationalId: '',
    userType: 'candidate',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Don't render the page at all if we're still checking auth status
  // This prevents the flash of register page before redirect
  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await register(formData);
      // Redirect is handled in useAuthNoCheck.register()
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.registerContainer}>
      <Card padding="lg" shadow="warm" className={styles.registerCard}>
        <div className={styles.header}>
          <h1>Create Account</h1>
          <p>Register for HR Management System</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {(error || formError) && (
            <div className={styles.errorMessage} role="alert">
              {error || formError}
            </div>
          )}

          <div className={styles.formRow}>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              fullWidth
            />
            <Input
              id="lastName"
              name="lastName"
              type="text"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="email"
          />

          <Input
            id="nationalId"
            name="nationalId"
            type="text"
            label="National ID"
            value={formData.nationalId}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            minLength={6}
            autoComplete="new-password"
            helperText="Password must be at least 6 characters"
          />

          <div className={styles.formRow}>
            <div className={styles.selectWrapper}>
              <label htmlFor="gender" className={styles.label}>
                Gender (Optional)
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Select Gender</option>
                <option value={Gender.MALE}>Male</option>
                <option value={Gender.FEMALE}>Female</option>
              </select>
            </div>

            <div className={styles.selectWrapper}>
              <label htmlFor="maritalStatus" className={styles.label}>
                Marital Status (Optional)
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus || ''}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Select Status</option>
                <option value={MaritalStatus.SINGLE}>Single</option>
                <option value={MaritalStatus.MARRIED}>Married</option>
                <option value={MaritalStatus.DIVORCED}>Divorced</option>
                <option value={MaritalStatus.WIDOWED}>Widowed</option>
              </select>
            </div>
          </div>

          <Input
            id="mobilePhone"
            name="mobilePhone"
            type="tel"
            label="Mobile Phone (Optional)"
            value={formData.mobilePhone || ''}
            onChange={handleChange}
            fullWidth
          />

          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            label="Date of Birth (Optional)"
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
            fullWidth
          />

          <Input
            id="applicationDate"
            name="applicationDate"
            type="date"
            label="Application Date (Optional)"
            value={formData.applicationDate || ''}
            onChange={handleChange}
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Register
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <a href="/login" className={styles.link}>
              Sign in here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

