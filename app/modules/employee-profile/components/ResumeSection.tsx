/**
 * Resume/CV Section Component
 * Wraps the CVUpload component for candidates
 */

'use client';

import CVUpload from './CVUpload';
import styles from './ResumeSection.module.css';

interface ResumeSectionProps {
  candidateId: string;
  onUpdate?: () => void;
}

export default function ResumeSection({ candidateId, onUpdate }: ResumeSectionProps) {
  return (
    <div className={styles.resumeSection}>
      <h2>Resume / CV</h2>
      <CVUpload candidateId={candidateId} onUploadSuccess={onUpdate} showHeading={false} />
    </div>
  );
}

