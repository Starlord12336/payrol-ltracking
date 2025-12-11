'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@/shared/components';
import { reviewChangeRequest, approveChangeRequest, rejectChangeRequest } from '../../api/orgStructureApi';
import type { ChangeRequest } from '../../types';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import styles from './ReviewChangeRequest.module.css';

interface ReviewChangeRequestProps {
  request: ChangeRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewChangeRequest({
  request,
  onSuccess,
  onCancel,
}: ReviewChangeRequestProps) {
  const { user } = useAuth();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userRoles = user?.roles || [];
  const isSystemAdmin = userRoles.includes(SystemRole.SYSTEM_ADMIN);

  const handleReview = async () => {
    if (!action) {
      setError('Please select an action (Approve or Reject)');
      return;
    }

    if (action === 'reject' && !comments.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (action === 'approve') {
        if (isSystemAdmin) {
          // System Admin can use approve endpoint
          await approveChangeRequest(request._id, comments.trim() || undefined);
        } else {
          // Others use review endpoint
          await reviewChangeRequest(request._id, true, comments.trim() || undefined);
        }
      } else {
        // Reject
        await rejectChangeRequest(request._id, comments.trim());
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error reviewing change request:', err);
      setError(err.response?.data?.message || 'Failed to review request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={`Review Change Request: ${request.requestNumber}`}
    >
      <div className={styles.container}>
        <div className={styles.requestSummary}>
          <div className={styles.summaryItem}>
            <label>Type:</label>
            <span>{request.requestType}</span>
          </div>
          <div className={styles.summaryItem}>
            <label>Requested By:</label>
            <span>
              {request.requestedByEmployee
                ? `${request.requestedByEmployee.firstName || ''} ${request.requestedByEmployee.lastName || ''}`.trim() || 'Unknown'
                : 'Unknown'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <label>Reason:</label>
            <span className={styles.reasonText}>{request.reason || 'No reason provided'}</span>
          </div>
        </div>

        <div className={styles.actionSelection}>
          <h3 className={styles.sectionTitle}>Select Action</h3>
          <div className={styles.actionButtons}>
            <button
              className={`${styles.actionButton} ${action === 'approve' ? styles.actionButtonActive : ''}`}
              onClick={() => setAction('approve')}
            >
              ✓ Approve
            </button>
            <button
              className={`${styles.actionButton} ${action === 'reject' ? styles.actionButtonActive : ''} ${styles.actionButtonReject}`}
              onClick={() => setAction('reject')}
            >
              ✗ Reject
            </button>
          </div>
        </div>

        <div className={styles.commentsSection}>
          <label>
            {action === 'reject' ? 'Rejection Reason *' : 'Comments (Optional)'}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              action === 'reject'
                ? 'Please provide a reason for rejecting this request...'
                : 'Add any comments about your decision...'
            }
            rows={4}
            className={styles.textarea}
            maxLength={1000}
            required={action === 'reject'}
          />
          {action === 'reject' && (
            <p className={styles.helpText}>
              Rejection reason is required when rejecting a request.
            </p>
          )}
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={action === 'approve' ? 'primary' : 'error'}
            onClick={handleReview}
            disabled={loading || !action || (action === 'reject' && !comments.trim())}
          >
            {loading
              ? 'Processing...'
              : action === 'approve'
              ? 'Approve Request'
              : 'Reject Request'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

