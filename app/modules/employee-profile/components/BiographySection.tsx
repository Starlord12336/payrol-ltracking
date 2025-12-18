/**
 * Biography Section Component
 * Allows users to edit their biography (US-E2-12)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components';
import { profileApi } from '../api/profileApi';
import type { ProfileData } from '../api/profileApi';
import styles from './BiographySection.module.css';

interface BiographySectionProps {
  profile: ProfileData | null;
  onUpdate: () => void;
}

export default function BiographySection({ profile, onUpdate }: BiographySectionProps) {
  const [biography, setBiography] = useState(profile?.biography || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Update biography when profile changes (including after fetch/update)
    if (profile?.biography !== undefined) {
      setBiography(profile.biography || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (biography === profile?.biography) {
      return; // No changes
    }

    if (biography.length > 500) {
      setError('Biography must be 500 characters or less');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedProfile = await profileApi.updateBiography(biography);
      // Update local state immediately with the response
      setBiography(updatedProfile.biography || biography);
      setSuccess(true);
      // Trigger parent to refetch to ensure everything is in sync
      onUpdate();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save biography');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = biography !== (profile?.biography || '');

  return (
    <div className={styles.biographySection}>
      <h2>Biography</h2>
      <p className={styles.sectionDescription}>
        Tell us about yourself (optional)
      </p>

      <textarea
        value={biography}
        onChange={(e) => setBiography(e.target.value)}
        placeholder="Write a short biography about yourself..."
        maxLength={500}
        rows={5}
        className={styles.biographyTextarea}
      />

      <div className={styles.characterCount}>
        {biography.length}/500 characters
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage} role="alert">
          ✅ Biography saved successfully!
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        variant="primary"
      >
        {saving ? 'Saving...' : 'Save Biography'}
      </Button>
    </div>
  );
}

