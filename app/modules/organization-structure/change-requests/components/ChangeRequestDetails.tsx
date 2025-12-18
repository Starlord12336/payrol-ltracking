'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button } from '@/shared/components';
import {
  getChangeRequestById,
  updateChangeRequest,
  submitChangeRequest,
  cancelChangeRequest,
} from '../../api/orgStructureApi';
import type { ChangeRequest, ChangeRequestStatus, ChangeRequestType } from '../../types';
import { ReviewChangeRequest } from './ReviewChangeRequest';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import styles from './ChangeRequestDetails.module.css';

interface ChangeRequestDetailsProps {
  request: ChangeRequest;
  onClose: () => void;
  onUpdate: () => void;
}

export function ChangeRequestDetails({
  request: initialRequest,
  onClose,
  onUpdate,
}: ChangeRequestDetailsProps) {
  const { user } = useAuth();
  const [request, setRequest] = useState<ChangeRequest>(initialRequest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    reason: request.reason || '',
    details: request.details || '',
  });

  const fetchRequestDetails = useCallback(async () => {
    try {
      const response = await getChangeRequestById(initialRequest._id);
      setRequest(response.data);
    } catch (err) {
      console.error('Error fetching request details:', err);
    }
  }, [initialRequest._id]);

  useEffect(() => {
    // Refresh request data
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const getStatusBadgeClass = (status: ChangeRequestStatus) => {
    switch (status) {
      case 'DRAFT':
        return styles.statusDraft;
      case 'SUBMITTED':
        return styles.statusSubmitted;
      case 'APPROVED':
        return styles.statusApproved;
      case 'REJECTED':
        return styles.statusRejected;
      case 'CANCELED':
        return styles.statusCanceled;
      case 'IMPLEMENTED':
        return styles.statusImplemented;
      default:
        return styles.statusDefault;
    }
  };

  const getTypeLabel = (type: ChangeRequestType) => {
    switch (type) {
      case 'NEW_DEPARTMENT':
        return 'New Department';
      case 'UPDATE_DEPARTMENT':
        return 'Update Department';
      case 'NEW_POSITION':
        return 'New Position';
      case 'UPDATE_POSITION':
        return 'Update Position';
      case 'CLOSE_POSITION':
        return 'Close Position';
      default:
        return type;
    }
  };

  const handleEdit = async () => {
    if (request.status !== 'DRAFT') {
      alert('Only DRAFT requests can be edited');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateChangeRequest(request._id, {
        reason: editData.reason,
        details: editData.details,
      });
      await fetchRequestDetails();
      setShowEdit(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit this request for review? You won\'t be able to edit it after submission.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitChangeRequest(request._id);
      await fetchRequestDetails();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await cancelChangeRequest(request._id);
      await fetchRequestDetails();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowReview(false);
    fetchRequestDetails();
    onUpdate();
  };

  const userRoles = user?.roles || [];
  const canReview = userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);
  const canEdit = request.status === 'DRAFT';
  const canSubmit = request.status === 'DRAFT';
  const canCancel = request.status === 'DRAFT' || request.status === 'SUBMITTED';
  const canApproveReject = request.status === 'SUBMITTED' && canReview;

  // Parse details if it's JSON (for NEW_DEPARTMENT and NEW_POSITION)
  let parsedDetails: any = null;
  if (request.details) {
    try {
      parsedDetails = JSON.parse(request.details);
    } catch {
      // Not JSON, use as string
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Change Request: ${request.requestNumber}`}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.requestInfo}>
            <div className={styles.requestNumber}>{request.requestNumber}</div>
            <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Request Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Type:</label>
              <span>{getTypeLabel(request.requestType)}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Status:</label>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                {request.status}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Requested By:</label>
              <span>
                {request.requestedByEmployee
                  ? `${request.requestedByEmployee.firstName || ''} ${request.requestedByEmployee.lastName || ''}`.trim() || 'Unknown'
                  : 'Unknown'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Created:</label>
              <span>{new Date(request.createdAt).toLocaleString()}</span>
            </div>
            {request.submittedAt && (
              <div className={styles.infoItem}>
                <label>Submitted:</label>
                <span>{new Date(request.submittedAt).toLocaleString()}</span>
              </div>
            )}
            {request.submittedByEmployee && (
              <div className={styles.infoItem}>
                <label>Submitted By:</label>
                <span>
                  {request.submittedByEmployee.firstName || ''} {request.submittedByEmployee.lastName || ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {parsedDetails && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Request Details</h3>
            <div className={styles.detailsContent}>
              {request.requestType === 'NEW_DEPARTMENT' && (
                <div className={styles.detailsGrid}>
                  <div><strong>Code:</strong> {parsedDetails.code}</div>
                  <div><strong>Name:</strong> {parsedDetails.name}</div>
                  {parsedDetails.description && <div><strong>Description:</strong> {parsedDetails.description}</div>}
                  {parsedDetails.costCenter && <div><strong>Cost Center:</strong> {parsedDetails.costCenter}</div>}
                </div>
              )}
              {request.requestType === 'NEW_POSITION' && (
                <div className={styles.detailsGrid}>
                  <div><strong>Code:</strong> {parsedDetails.code}</div>
                  <div><strong>Title:</strong> {parsedDetails.title}</div>
                  {parsedDetails.description && <div><strong>Description:</strong> {parsedDetails.description}</div>}
                  {parsedDetails.departmentId && <div><strong>Department ID:</strong> {parsedDetails.departmentId}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {!showEdit ? (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Reason</h3>
              <div className={styles.reasonText}>{request.reason || 'No reason provided'}</div>
            </div>

            {request.details && !parsedDetails && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Additional Details</h3>
                <div className={styles.detailsText}>{request.details}</div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Edit Request</h3>
            <div className={styles.formGroup}>
              <label>Reason *</label>
              <textarea
                value={editData.reason}
                onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                rows={4}
                className={styles.textarea}
                maxLength={2000}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Additional Details</label>
              <textarea
                value={editData.details}
                onChange={(e) => setEditData({ ...editData, details: e.target.value })}
                rows={3}
                className={styles.textarea}
                maxLength={2000}
              />
            </div>
            <div className={styles.editActions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEdit(false);
                  setEditData({ reason: request.reason || '', details: request.details || '' });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEdit}
                disabled={loading || !editData.reason.trim()}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.actions}>
          {canEdit && (
            <Button
              variant="secondary"
              onClick={() => setShowEdit(true)}
              disabled={loading}
            >
              Edit
            </Button>
          )}
          {canSubmit && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              Submit for Review
            </Button>
          )}
          {canApproveReject && (
            <Button
              variant="primary"
              onClick={() => setShowReview(true)}
              disabled={loading}
            >
              Review
            </Button>
          )}
          {canCancel && (
            <Button
              variant="error"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel Request
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </Button>
        </div>
      </div>

      {showReview && (
        <ReviewChangeRequest
          request={request}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReview(false)}
        />
      )}
    </Modal>
  );
}

