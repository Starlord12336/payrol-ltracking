/**
 * Resume/CV Section Component
 * Wraps the CVUpload component for candidates
 */

'use client';

import CVUpload from './CVUpload';
import type { ProfileData } from '../api/profileApi';
import styles from './ResumeSection.module.css';

interface ResumeSectionProps {
  candidateId: string;
  profile?: ProfileData | null;
  onUpdate?: () => void;
}

export default function ResumeSection({ candidateId, profile, onUpdate }: ResumeSectionProps) {
  return (
    <div className={styles.resumeSection}>
      <h2>Resume / CV</h2>
      <CVUpload candidateId={candidateId} profile={profile} onUploadSuccess={onUpdate} showHeading={false} />
    </div>
  );
}

