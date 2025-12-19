'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button, Modal } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { payTypeApi } from '../api/payrollConfigApi';
import { PayType, ApprovalStatus, FilterPayTypeDto, PaySchedule } from '../types';
import { SystemRole } from '@/shared/types/auth';
import { formatDate, formatCurrency } from '@/shared/utils/format';
import PayTypeModal from './PayTypeModal';
import styles from '../page.module.css';

export default function PayTypeList() {
  const { user } = useAuth();
  const [payTypes, setPayTypes] = useState<PayType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterPayTypeDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayType, setSelectedPayType] = useState<PayType | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    id: string;
    status: ApprovalStatus;
    message: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const userRole = user?.roles?.[0];
  const isPayrollSpecialist = userRole === SystemRole.PAYROLL_SPECIALIST;
  const isPayrollManager = userRole === SystemRole.PAYROLL_MANAGER;
  const canEdit = isPayrollSpecialist || isPayrollManager;
  const canDelete = isPayrollManager; // Only Payroll Manager can delete (even approved items)
  const canApprove = isPayrollManager;

  const fetchPayTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await payTypeApi.getAll(filter);
      setPayTypes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pay types');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPayTypes();
  }, [fetchPayTypes]);

  const handleCreate = () => {
    if (!isPayrollSpecialist) return;
    setSelectedPayType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (payType: PayType) => {
    if (!isPayrollSpecialist || payType.status !== ApprovalStatus.DRAFT) return;
    setSelectedPayType(payType);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, status: ApprovalStatus) => {
    if (!isPayrollSpecialist && status === ApprovalStatus.DRAFT) return;
    if (!isPayrollManager && status === ApprovalStatus.APPROVED) return;

    const message = status === ApprovalStatus.APPROVED
      ? 'This is an approved pay type. Are you sure you want to delete it? This action requires manager approval.'
      : 'Are you sure you want to delete this pay type?';

    setDeleteConfirmation({ show: true, id, status, message });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    setDeleteError(null);
    try {
      setActionLoading(deleteConfirmation.id);
      await payTypeApi.delete(
        deleteConfirmation.id,
        deleteConfirmation.status === ApprovalStatus.APPROVED ? user?.userid : undefined
      );
      setDeleteConfirmation(null);
      await fetchPayTypes();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete pay type');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!isPayrollSpecialist) return;
    try {
      setActionLoading(id);
      await payTypeApi.submit(id);
      await fetchPayTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit pay type');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!isPayrollManager || !user?.userid) return;
    try {
      setActionLoading(id);
      await payTypeApi.approve(id, { approvedBy: user.userid });
      await fetchPayTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve pay type');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!isPayrollManager) return;
    if (!confirm('Are you sure you want to reject this pay type?')) return;
    try {
      setActionLoading(id);
      await payTypeApi.reject(id);
      await fetchPayTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject pay type');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const statusMap = {
      [ApprovalStatus.DRAFT]: styles.statusDraft,
      [ApprovalStatus.APPROVED]: styles.statusApproved,
      [ApprovalStatus.REJECTED]: styles.statusRejected,
    };
    return (
      <span className={`${styles.statusBadge} ${statusMap[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getScheduleBadge = (schedule: PaySchedule) => {
    const colors: Record<PaySchedule, string> = {
      [PaySchedule.HOURLY]: '#f59e0b',
      [PaySchedule.DAILY]: '#10b981',
      [PaySchedule.WEEKLY]: '#3b82f6',
      [PaySchedule.MONTHLY]: '#8b5cf6',
      [PaySchedule.CONTRACT_BASED]: '#ef4444',
    };
    return (
      <span style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        background: `${colors[schedule]}20`,
        color: colors[schedule],
        fontSize: '0.875rem',
        fontWeight: '500',
      }}>
        {schedule.replace('_', ' ')}
      </span>
    );
  };

  if (loading && payTypes.length === 0) {
    return <div className={styles.loading}>Loading pay types...</div>;
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>Pay Types</h2>
          <p className={styles.listSubtitle}>
            Manage different payment schedules and calculation methods
          </p>
        </div>
        {isPayrollSpecialist && (
          <Button variant="primary" onClick={handleCreate}>
            + Create Pay Type
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filterContainer}>
        <select
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value as ApprovalStatus || undefined })}
          className={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value={ApprovalStatus.DRAFT}>Draft</option>
          <option value={ApprovalStatus.APPROVED}>Approved</option>
          <option value={ApprovalStatus.REJECTED}>Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Search by type..."
          value={filter.type || ''}
          onChange={(e) => setFilter({ ...filter, type: e.target.value || undefined })}
          className={styles.filterInput}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payTypes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  No pay types found
                </td>
              </tr>
            ) : (
              payTypes.map((payType) => (
                <tr key={payType._id}>
                  <td><strong>{payType.type}</strong></td>
                  <td className={styles.currency}>{formatCurrency(payType.amount, 'EGP')}</td>
                  <td>{getStatusBadge(payType.status)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {payType.status === ApprovalStatus.DRAFT && isPayrollSpecialist && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonEdit}`}
                            onClick={() => handleEdit(payType)}
                            title="Edit"
                            disabled={actionLoading === payType._id}
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDelete(payType._id, payType.status)}
                            title="Delete"
                            disabled={actionLoading === payType._id}
                          >
                            🗑️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(payType._id)}
                            title="Submit for Approval"
                            disabled={actionLoading === payType._id}
                          >
                            📤
                          </button>
                        </>
                      )}
                      {payType.status === ApprovalStatus.DRAFT && isPayrollManager && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(payType._id)}
                            title="Approve"
                            disabled={actionLoading === payType._id}
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(payType._id)}
                            title="Reject"
                            disabled={actionLoading === payType._id}
                          >
                            ❌
                          </button>
                        </>
                      )}
                      {payType.status === ApprovalStatus.APPROVED && (
                        <>
                          <span style={{ color: '#059669', fontSize: '0.875rem', marginRight: '0.5rem' }}>
                            Approved {payType.approvedAt && `on ${formatDate(payType.approvedAt)}`}
                          </span>
                          {isPayrollManager && (
                            <button
                              className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                              onClick={() => handleDelete(payType._id, payType.status)}
                              title="Delete (Manager Only)"
                              disabled={actionLoading === payType._id}
                            >
                              🗑️
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PayTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchPayTypes}
        payType={selectedPayType}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <Modal
          isOpen={deleteConfirmation.show}
          onClose={() => {
            setDeleteConfirmation(null);
            setDeleteError(null);
          }}
          title="Confirm Delete"
          size="sm"
        >
          <div style={{ padding: '1rem' }}>
            <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#374151' }}>
              {deleteConfirmation.message}
            </p>

            {deleteError && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '0.375rem',
                color: '#991b1b',
                fontSize: '0.875rem'
              }}>
                ❌ {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteConfirmation(null);
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                disabled={actionLoading === deleteConfirmation.id}
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {actionLoading === deleteConfirmation.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}