/**
 * Personal Information Display Component
 * Shows read-only personal information (US-E2-04)
 */

'use client';

import type { ProfileData } from '../api/profileApi';
import styles from './PersonalInfoDisplay.module.css';

interface PersonalInfoDisplayProps {
  profile: ProfileData | null;
}

export default function PersonalInfoDisplay({ profile }: PersonalInfoDisplayProps) {
  if (!profile) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.personalInfoSection}>
      <h2>Personal Information</h2>
      <p className={styles.sectionDescription}>This information is read-only and cannot be changed</p>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <strong>Full Name:</strong>
          <span>{profile.fullName || 'N/A'}</span>
        </div>

        {profile.employeeNumber && (
          <div className={styles.infoItem}>
            <strong>Employee Number:</strong>
            <span>{profile.employeeNumber}</span>
          </div>
        )}

        {profile.candidateNumber && (
          <div className={styles.infoItem}>
            <strong>Candidate Number:</strong>
            <span>{profile.candidateNumber}</span>
          </div>
        )}

        <div className={styles.infoItem}>
          <strong>National ID:</strong>
          <span>{profile.nationalId || 'N/A'}</span>
        </div>

        <div className={styles.infoItem}>
          <strong>Date of Birth:</strong>
          <span>{formatDate(profile.dateOfBirth)}</span>
        </div>

        <div className={styles.infoItem}>
          <strong>Gender:</strong>
          <span>{profile.gender || 'N/A'}</span>
        </div>

        <div className={styles.infoItem}>
          <strong>Marital Status:</strong>
          <span>{profile.maritalStatus || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

