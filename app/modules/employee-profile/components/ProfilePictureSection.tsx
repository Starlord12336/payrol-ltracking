/**
 * Profile Picture Section Component
 * Allows users to upload/change their profile picture
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components';
import { profileApi } from '../api/profileApi';
import type { ProfileData } from '../api/profileApi';
import styles from './ProfilePictureSection.module.css';

interface ProfilePictureSectionProps {
  profile: ProfileData | null;
  onUpdate: () => void;
}

export default function ProfilePictureSection({ profile, onUpdate }: ProfilePictureSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(profile?.profilePictureUrl || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(profile?.profilePictureUrl || null);
  }, [profile?.profilePictureUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, GIF, or WEBP allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Step 1: Upload image file
      const { imageUrl } = await profileApi.uploadProfilePicture(file);

      // Step 2: Update profile with URL
      await profileApi.updateProfilePicture(imageUrl);

      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
      // Reset preview on error
      setPreview(profile?.profilePictureUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.profilePictureSection}>
      <h2>Profile Picture</h2>

      <div className={styles.pictureContainer}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Profile" className={styles.profilePicture} />
        ) : (
          <div className={styles.placeholderPicture}>
            <span>No Picture</span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        disabled={uploading}
        id="profile-picture-input"
        className={styles.fileInput}
      />

      <label htmlFor="profile-picture-input" className={styles.labelButton}>
        <Button variant="primary" disabled={uploading}>
          {uploading ? 'Uploading...' : preview ? 'Change Picture' : 'Upload Picture'}
        </Button>
      </label>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      <p className={styles.helperText}>
        Max size: 5MB. Formats: JPG, PNG, GIF, WEBP
      </p>
    </div>
  );
}

