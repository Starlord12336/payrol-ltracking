/**
 * Address Section Component
 * Allows users to edit their address (US-E2-05)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/shared/components';
import { profileApi } from '../api/profileApi';
import type { ProfileData } from '../api/profileApi';
import styles from './AddressSection.module.css';

interface AddressSectionProps {
  profile: ProfileData | null;
  onUpdate: () => void;
}

export default function AddressSection({ profile, onUpdate }: AddressSectionProps) {
  const [formData, setFormData] = useState({
    streetAddress: profile?.streetAddress || '',
    city: profile?.city || '',
    country: profile?.country || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData({
      streetAddress: profile?.streetAddress || '',
      city: profile?.city || '',
      country: profile?.country || '',
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
      await profileApi.updateAddress(formData);
      setSuccess(true);
      onUpdate();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    formData.streetAddress !== (profile?.streetAddress || '') ||
    formData.city !== (profile?.city || '') ||
    formData.country !== (profile?.country || '');

  return (
    <div className={styles.addressSection}>
      <h2>Address</h2>

      <div className={styles.formGrid}>
        <Input
          id="streetAddress"
          name="streetAddress"
          type="text"
          label="Street Address"
          value={formData.streetAddress}
          onChange={handleChange}
          fullWidth
        />

        <Input
          id="city"
          name="city"
          type="text"
          label="City"
          value={formData.city}
          onChange={handleChange}
          fullWidth
        />

        <Input
          id="country"
          name="country"
          type="text"
          label="Country"
          value={formData.country}
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
          ✅ Address saved successfully!
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        variant="primary"
      >
        {saving ? 'Saving...' : 'Save Address'}
      </Button>
    </div>
  );
}

