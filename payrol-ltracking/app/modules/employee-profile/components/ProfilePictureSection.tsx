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
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Update preview when profile changes
  useEffect(() => {
    let currentBlobUrl: string | null = null;

    const loadProfilePicture = async () => {
      if (profile?.profilePictureUrl) {
        const pictureUrl = profileApi.getProfilePictureUrl(profile.profilePictureUrl);
        
        // Check if it's a GridFS URL (needs authentication)
        // GridFS URLs use the /employee-profile/me/profile-picture endpoint
        if (pictureUrl && pictureUrl.includes('/employee-profile/me/profile-picture')) {
          try {
            // Fetch image with credentials
            const response = await fetch(pictureUrl, {
              credentials: 'include',
            });
            
            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              currentBlobUrl = blobUrl;
              setPreview(blobUrl);
              setImageError(false);
            } else {
              console.error('Failed to load profile picture:', {
                status: response.status,
                statusText: response.statusText,
                url: pictureUrl
              });
              setImageError(true);
              setPreview(null);
            }
          } catch (err) {
            console.error('Error loading profile picture:', err);
            setImageError(true);
            setPreview(null);
          }
        } else if (pictureUrl) {
          // External URL - use directly
          setPreview(pictureUrl);
          setImageError(false);
        }
      } else {
        setPreview(null);
        setImageError(false);
      }
    };

    loadProfilePicture();

    // Cleanup blob URL on unmount or when URL changes
    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [profile?.profilePictureUrl]);

  const handleImageError = () => {
    console.error('Failed to load profile picture:', preview);
    setImageError(true);
  };

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
      // Step 1: Upload image file to GridFS
      const { _id: gridfsFileId } = await profileApi.uploadProfilePicture(file);

      // Step 2: Update profile with GridFS file ID (24 hex characters)
      await profileApi.updateProfilePicture(gridfsFileId);

      // Step 3: Fetch the uploaded image and create blob URL for preview
      const pictureUrl = profileApi.getProfilePictureUrl(gridfsFileId);
      if (pictureUrl) {
        try {
          const response = await fetch(pictureUrl, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            // Cleanup old blob URL if exists
            if (preview && preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }
            setPreview(blobUrl);
            setImageError(false);
          }
        } catch (fetchErr) {
          console.error('Error fetching uploaded image:', fetchErr);
          // Keep the FileReader preview if fetch fails
        }
      }

      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
      // Reset preview on error - will be handled by useEffect
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.profilePictureSection}>
      <h2>Profile Picture</h2>

      <div className={styles.pictureContainer}>
        {preview && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={preview} 
            alt="Profile" 
            className={styles.profilePicture}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        ) : (
          <div className={styles.placeholderPicture}>
            <span>{imageError ? 'Failed to load' : 'No Picture'}</span>
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

      <Button
        variant="primary"
        disabled={uploading}
        onClick={() => {
          const input = document.getElementById('profile-picture-input') as HTMLInputElement;
          if (input && !uploading) {
            input.click();
          }
        }}
      >
        {uploading ? 'Uploading...' : preview ? 'Change Picture' : 'Upload Picture'}
      </Button>

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

