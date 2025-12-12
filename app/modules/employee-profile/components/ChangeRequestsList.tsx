/**
 * Change Requests List Component
 * Displays all change requests for the current employee
 */

'use client';

import { useState } from 'react';
import type { ChangeRequest } from '../api/profileApi';
import styles from './ChangeRequestsList.module.css';

interface ChangeRequestsListProps {
  changeRequests: ChangeRequest[];
}

export default function ChangeRequestsList({ changeRequests }: ChangeRequestsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (changeRequests.length === 0) {
    return null;
  }

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
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'PENDING':
      default:
        return 'Pending Review';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateCompact = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const parseFieldName = (request: ChangeRequest): string => {
    // Try to extract field name from requestDescription
    if (request.requestDescription) {
      const match = request.requestDescription.match(/Field:\s*(.+?)(?:\n|$)/i);
      if (match) {
        return match[1].trim();
      }
    }
    // Fallback to fieldName if available
    return request.fieldName || 'Unknown Field';
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={toggleExpand}>
        <div className={styles.headerLeft}>
          <button className={styles.expandButton} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
            <span className={`${styles.arrow} ${isExpanded ? styles.arrowExpanded : ''}`}>
              ▶
            </span>
          </button>
          <h2>Change Requests</h2>
          <span className={styles.count}>({changeRequests.length})</span>
        </div>
        {!isExpanded && (
          <div className={styles.summary}>
            {changeRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className={styles.pendingCount}>
                {changeRequests.filter(r => r.status === 'PENDING').length} Pending
              </span>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <p className={styles.description}>
            Track the status of your profile correction requests
          </p>

          <div className={styles.requestsList}>
            {changeRequests.map((request) => (
              <div key={request._id} className={styles.requestCard}>
                <div className={styles.requestHeader}>
                  <div className={styles.fieldName}>
                    <strong>{parseFieldName(request)}</strong>
                    {request.requestId && (
                      <span className={styles.requestId}>#{request.requestId}</span>
                    )}
                  </div>
                  <div className={`${styles.statusBadge} ${getStatusClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </div>
                </div>

                {request.requestDescription && (
                  <div className={styles.requestDescription}>
                    <pre>{request.requestDescription}</pre>
                  </div>
                )}

                <div className={styles.requestDetails}>
                  <div className={styles.detailItem}>
                    <strong>Submitted:</strong> {formatDate(request.submittedAt)}
                  </div>
                  {request.processedAt && (
                    <div className={styles.detailItem}>
                      <strong>Processed:</strong> {formatDate(request.processedAt)}
                    </div>
                  )}
                  {request.reviewedBy && (
                    <div className={styles.detailItem}>
                      <strong>Reviewed By:</strong> {request.reviewedBy}
                    </div>
                  )}
                </div>

                {request.comments && (
                  <div className={styles.comments}>
                    <strong>HR Comments:</strong>
                    <p>{request.comments}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!isExpanded && (
        <div className={styles.compactList}>
          {changeRequests.slice(0, 3).map((request) => (
            <div key={request._id} className={styles.compactCard}>
              <div className={styles.compactHeader}>
                <span className={styles.compactFieldName}>{parseFieldName(request)}</span>
                <div className={`${styles.compactStatusBadge} ${getStatusClass(request.status)}`}>
                  {getStatusText(request.status)}
                </div>
              </div>
              <div className={styles.compactMeta}>
                {request.requestId && (
                  <span className={styles.compactId}>#{request.requestId}</span>
                )}
                <span className={styles.compactDate}>
                  {formatDateCompact(request.submittedAt)}
                </span>
              </div>
            </div>
          ))}
          {changeRequests.length > 3 && (
            <div className={styles.moreIndicator}>
              +{changeRequests.length - 3} more request{changeRequests.length - 3 !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

