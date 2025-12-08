/**
 * Change Password Modal Component
 * Allows users to change their password
 */

'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { authApi } from '@/shared/api/authApi';
import type { ChangePasswordDto, LoginDto } from '@/shared/types/auth';
import styles from './ChangePasswordModal.module.css';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { changePassword, user } = useAuth();
  const [formData, setFormData] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);

  // Verify current password before allowing password change
  const verifyCurrentPassword = async () => {
    if (!formData.currentPassword) {
      setCurrentPasswordError('Please enter your current password.');
      return;
    }

    if (!user?.email) {
      setCurrentPasswordError('User email not found.');
      return;
    }

    setIsVerifyingPassword(true);
    setCurrentPasswordError(null);

    try {
      // Try to login with current password to verify it's correct
      await authApi.login({
        email: user.email,
        password: formData.currentPassword,
      });
      // If login succeeds, current password is correct
      setIsCurrentPasswordVerified(true);
      setCurrentPasswordError(null);
    } catch (err: any) {
      // Login failed - current password is incorrect
      setIsCurrentPasswordVerified(false);
      if (err.message?.includes('password') || err.message?.includes('credentials')) {
        setCurrentPasswordError('Current password is incorrect. Please try again.');
      } else {
        setCurrentPasswordError('Failed to verify password. Please try again.');
      }
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // First verify current password if not already verified
    if (!isCurrentPasswordVerified) {
      await verifyCurrentPassword();
      if (!isCurrentPasswordVerified) {
        return; // Don't proceed if current password is wrong
      }
    }

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (formData.newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password.');
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(formData);
      setSuccess(true);
      // Reset form
      setFormData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      setIsCurrentPasswordVerified(false);
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setIsCurrentPasswordVerified(false);
      }, 2000);
    } catch (err: any) {
      // If error is about current password, reset verification
      if (err.message?.includes('current password') || err.message?.includes('Current password')) {
        setIsCurrentPasswordVerified(false);
        setCurrentPasswordError('Current password is incorrect. Please verify again.');
      }
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'currentPassword') {
      setFormData({
        ...formData,
        [name]: value,
      });
      // Reset verification if current password changes
      if (isCurrentPasswordVerified) {
        setIsCurrentPasswordVerified(false);
      }
      setCurrentPasswordError(null);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    // Clear errors when user types
    if (error) setError(null);
  };

  const handleCurrentPasswordBlur = () => {
    // Verify current password when user leaves the field (if password is entered)
    if (formData.currentPassword && !isCurrentPasswordVerified) {
      verifyCurrentPassword();
    }
  };

  const handleClose = () => {
    if (!isLoading && !isVerifyingPassword) {
      setFormData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      setError(null);
      setCurrentPasswordError(null);
      setSuccess(false);
      setIsCurrentPasswordVerified(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit} className={styles.form}>
        {success && (
          <div className={styles.successMessage} role="alert">
            Password changed successfully!
          </div>
        )}

        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.currentPasswordSection}>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            label="Current Password"
            value={formData.currentPassword}
            onChange={handleChange}
            onBlur={handleCurrentPasswordBlur}
            required
            fullWidth
            autoComplete="current-password"
            disabled={isLoading || isVerifyingPassword}
            error={currentPasswordError || undefined}
          />
          {currentPasswordError && (
            <div className={styles.currentPasswordError} role="alert">
              {currentPasswordError}
            </div>
          )}
          {isCurrentPasswordVerified && !currentPasswordError && (
            <div className={styles.currentPasswordSuccess}>
              ✓ Current password verified
            </div>
          )}
          {formData.currentPassword && !isCurrentPasswordVerified && !isVerifyingPassword && !currentPasswordError && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={verifyCurrentPassword}
              className={styles.verifyButton}
            >
              Verify Password
            </Button>
          )}
          {isVerifyingPassword && (
            <div className={styles.verifyingMessage}>Verifying password...</div>
          )}
        </div>

        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          label="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="new-password"
          disabled={isLoading || !isCurrentPasswordVerified}
          helperText="Password must be at least 6 characters long"
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="new-password"
          disabled={isLoading || !isCurrentPasswordVerified}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={success || !isCurrentPasswordVerified || isVerifyingPassword}
          >
            Change Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

