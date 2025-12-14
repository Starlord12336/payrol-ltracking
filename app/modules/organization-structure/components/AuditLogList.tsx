'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal } from '@/shared/components';
import { getAuditLogs } from '../api/orgStructureApi';
import type { ChangeLog } from '../types';
import { ChangeLogAction } from '../types';
import { ChangeDetailsModal } from './ChangeDetailsModal';
import styles from './AuditLogList.module.css';

export function AuditLogList() {
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ChangeLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filters
  const [actionFilter, setActionFilter] = useState<ChangeLogAction | 'ALL'>('ALL');
  const [entityTypeFilter, setEntityTypeFilter] = useState<'Department' | 'Position' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        limit,
      };
      
      if (actionFilter !== 'ALL') {
        params.action = actionFilter;
      }
      
      if (entityTypeFilter !== 'ALL') {
        params.entityType = entityTypeFilter;
      }
      
      if (searchQuery.trim()) {
        // Search by entity ID or summary
        params.entityId = searchQuery.trim();
      }
      
      const response = await getAuditLogs(params);
      setLogs(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load audit logs');
      setLogs([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityTypeFilter, searchQuery, page]);

  useEffect(() => {
    // Initial load
    fetchLogs().catch((err) => {
      console.error('Error in fetchLogs:', err);
    });
  }, [fetchLogs]);

  const handleViewDetails = (log: ChangeLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const getActionBadgeClass = (action: ChangeLogAction | string) => {
    if (!action) return '';
    switch (action) {
      case ChangeLogAction.CREATED:
      case 'CREATED':
        return styles.badgeCreated;
      case ChangeLogAction.UPDATED:
      case 'UPDATED':
        return styles.badgeUpdated;
      case ChangeLogAction.DEACTIVATED:
      case 'DEACTIVATED':
        return styles.badgeDeactivated;
      case ChangeLogAction.REASSIGNED:
      case 'REASSIGNED':
        return styles.badgeReassigned;
      default:
        return '';
    }
  };

  const getActionLabel = (action: ChangeLogAction | string) => {
    if (!action) return 'Unknown';
    switch (action) {
      case ChangeLogAction.CREATED:
      case 'CREATED':
        return '🟢 CREATED';
      case ChangeLogAction.UPDATED:
      case 'UPDATED':
        return '🔵 UPDATED';
      case ChangeLogAction.DEACTIVATED:
      case 'DEACTIVATED':
        return '🔴 DEACTIVATED';
      case ChangeLogAction.REASSIGNED:
      case 'REASSIGNED':
        return '🟡 REASSIGNED';
      default:
        return String(action);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return formatDate(dateString);
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Audit Log</h2>
          <p>Track all changes to departments and positions</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Action</label>
          <select
            className={styles.filterSelect}
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value as ChangeLogAction | 'ALL');
              setPage(1);
            }}
          >
            <option value="ALL">All Actions</option>
            <option value={ChangeLogAction.CREATED}>Created</option>
            <option value={ChangeLogAction.UPDATED}>Updated</option>
            <option value={ChangeLogAction.DEACTIVATED}>Deactivated</option>
            <option value={ChangeLogAction.REASSIGNED}>Reassigned</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Entity Type</label>
          <select
            className={styles.filterSelect}
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value as 'Department' | 'Position' | 'ALL');
              setPage(1);
            }}
          >
            <option value="ALL">All Types</option>
            <option value="Department">Department</option>
            <option value="Position">Position</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Search</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Entity ID or summary..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Card padding="lg">
          <div className={styles.loading}>Loading audit logs...</div>
        </Card>
      ) : error ? (
        <Card padding="lg">
          <div className={styles.error}>Error: {error}</div>
        </Card>
      ) : logs.length === 0 ? (
        <Card padding="lg">
          <div className={styles.emptyState}>
            <h3>No audit logs found</h3>
            <p>No changes have been recorded yet.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Summary</th>
                  <th>Performed By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  if (!log || !log._id) return null;
                  return (
                    <tr key={log._id}>
                      <td>
                        <span className={`${styles.actionBadge} ${getActionBadgeClass(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.entityType}>{log.entityType || 'Unknown'}</span>
                      </td>
                      <td className={styles.summary}>
                        {log.summary || `${log.action || 'Unknown'} ${log.entityType || 'Entity'}`}
                      </td>
                      <td>
                        {log.performedByEmployee
                          ? `${log.performedByEmployee.firstName || ''} ${log.performedByEmployee.lastName || ''}`.trim() || 'Unknown'
                          : 'System'}
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          <div className={styles.relativeTime}>
                            {log.createdAt ? formatRelativeTime(log.createdAt) : 'Unknown'}
                          </div>
                          <div className={styles.fullDate}>
                            {log.createdAt ? formatDate(log.createdAt) : ''}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages} ({total} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <ChangeDetailsModal
          log={selectedLog}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
}

