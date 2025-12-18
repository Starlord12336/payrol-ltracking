/**
 * Contact Information Section Component
 * Allows users to edit their contact information (US-E2-05)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/shared/components';
import { profileApi } from '../api/profileApi';
import type { ProfileData } from '../api/profileApi';
import styles from './ContactInfoSection.module.css';

interface ContactInfoSectionProps {
  profile: ProfileData | null;
  onUpdate: () => void;
}

export default function ContactInfoSection({ profile, onUpdate }: ContactInfoSectionProps) {
  const [formData, setFormData] = useState({
    personalEmail: profile?.personalEmail || '',
    workEmail: profile?.workEmail || '',
    mobilePhone: profile?.mobilePhone || '',
    homePhone: profile?.homePhone || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData({
      personalEmail: profile?.personalEmail || '',
      workEmail: profile?.workEmail || '',
      mobilePhone: profile?.mobilePhone || '',
      homePhone: profile?.homePhone || '',
    });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user types
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await profileApi.updateContactInfo(formData);
      setSuccess(true);
      onUpdate();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    formData.personalEmail !== (profile?.personalEmail || '') ||
    formData.workEmail !== (profile?.workEmail || '') ||
    formData.mobilePhone !== (profile?.mobilePhone || '') ||
    formData.homePhone !== (profile?.homePhone || '');

  return (
    <div className={styles.contactInfoSection}>
      <h2>Contact Information</h2>

      <div className={styles.formGrid}>
        <Input
          id="personalEmail"
          name="personalEmail"
          type="email"
          label="Personal Email"
          value={formData.personalEmail}
          onChange={handleChange}
          fullWidth
          required
        />

        <Input
          id="workEmail"
          name="workEmail"
          type="email"
          label="Work Email"
          value={formData.workEmail}
          onChange={handleChange}
          fullWidth
          disabled={!profile?.workEmail} // Read-only if not set
        />

        <Input
          id="mobilePhone"
          name="mobilePhone"
          type="tel"
          label="Mobile Phone"
          value={formData.mobilePhone}
          onChange={handleChange}
          fullWidth
        />

        <Input
          id="homePhone"
          name="homePhone"
          type="tel"
          label="Home Phone (Optional)"
          value={formData.homePhone}
          onChange={handleChange}
          fullWidth
        />
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage} role="alert">
          ✅ Contact information saved successfully!
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        variant="primary"
      >
        {saving ? 'Saving...' : 'Save Contact Info'}
      </Button>
    </div>
  );
}

