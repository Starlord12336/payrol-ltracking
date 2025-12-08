/**
 * Change Requests Page
 * Review and approve/reject employee-submitted profile changes
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, Button, ProtectedRoute } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { hrApi, type ChangeRequest } from '../api/hrApi';
import styles from './page.module.css';

function ChangeRequestsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Check if user has HR role
  const userRoles = user?.roles || [];
  const hasHrRole = 
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.getPendingChangeRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load change requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await hrApi.updateChangeRequestStatus(requestId, 'APPROVED');
      await fetchRequests(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const comments = prompt('Enter rejection reason (optional):');
    if (comments === null) return; // User cancelled

    try {
      setProcessingId(requestId);
      await hrApi.updateChangeRequestStatus(requestId, 'REJECTED', comments || undefined);
      await fetchRequests(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (!hasHrRole) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          Access denied. HR role required.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading change requests...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pending Change Requests</h1>
        <p>Review and approve employee profile change requests</p>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No pending change requests</p>
          </div>
        </Card>
      ) : (
        <div className={styles.requestsList}>
          {requests.map((request) => (
            <Card key={request._id} padding="lg" shadow="warm" className={styles.requestCard}>
              <div className={styles.requestHeader}>
                <div>
                  <h3>{request.employeeName || 'Unknown Employee'}</h3>
                  <p className={styles.requestType}>{request.requestType}</p>
                </div>
                <span className={styles.date}>
                  {new Date(request.submittedAt).toLocaleDateString()}
                </span>
              </div>

              <div className={styles.requestDetails}>
                <div className={styles.fieldChange}>
                  <strong>Field:</strong> {request.fieldName}
                </div>
                <div className={styles.valueComparison}>
                  <div className={styles.valueBox}>
                    <span className={styles.valueLabel}>Current:</span>
                    <span className={styles.oldValue}>
                      {request.oldValue?.toString() || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.arrow}>→</div>
                  <div className={styles.valueBox}>
                    <span className={styles.valueLabel}>Requested:</span>
                    <span className={styles.newValue}>
                      {request.newValue?.toString() || 'N/A'}
                    </span>
                  </div>
                </div>
                {request.reason && (
                  <div className={styles.reason}>
                    <strong>Reason:</strong> {request.reason}
                  </div>
                )}
              </div>

              <div className={styles.requestActions}>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(request._id)}
                  disabled={processingId === request._id}
                  size="sm"
                >
                  {processingId === request._id ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(request._id)}
                  disabled={processingId === request._id}
                  size="sm"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/modules/hr/employees/${request.employeeProfileId}`)}
                  size="sm"
                >
                  View Employee
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChangeRequestsPage() {
  return (
    <ProtectedRoute>
      <ChangeRequestsContent />
    </ProtectedRoute>
  );
}

