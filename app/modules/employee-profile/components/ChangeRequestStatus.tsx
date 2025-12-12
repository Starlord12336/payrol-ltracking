/**
 * Change Request Status Component
 * Shows the status of change requests for a specific field
 */

'use client';

import type { ChangeRequest } from '../api/profileApi';
import styles from './ChangeRequestStatus.module.css';

interface ChangeRequestStatusProps {
  fieldName: string;
  changeRequests: ChangeRequest[];
}

export default function ChangeRequestStatus({
  fieldName,
  changeRequests,
}: ChangeRequestStatusProps) {
  // Filter change requests for this field
  const fieldRequests = changeRequests.filter(
    (req) => req.fieldName === fieldName || 
    (req.requestDescription?.toLowerCase().includes(`field: ${fieldName.toLowerCase()}`))
  );

  if (fieldRequests.length === 0) {
    return null;
  }

  // Get the most recent request
  const latestRequest = fieldRequests.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )[0];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return styles.statusApproved;
      case 'REJECTED':
        return styles.statusRejected;
      case 'PENDING':
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '✓ Approved';
      case 'REJECTED':
        return '✗ Rejected';
      case 'PENDING':
      default:
        return '⏳ Pending Review';
    }
  };

  return (
    <div className={styles.statusContainer}>
      <div className={`${styles.statusBadge} ${getStatusClass(latestRequest.status)}`}>
        {getStatusText(latestRequest.status)}
      </div>
      {latestRequest.processedAt && (
        <div className={styles.processedDate}>
          {new Date(latestRequest.processedAt).toLocaleDateString()}
        </div>
      )}
      {latestRequest.comments && (
        <div className={styles.comments}>
          <strong>Comment:</strong> {latestRequest.comments}
        </div>
      )}
    </div>
  );
}

