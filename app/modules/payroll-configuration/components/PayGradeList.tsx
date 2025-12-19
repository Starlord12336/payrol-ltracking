/**
 * ========================== EMAD ==========================
 * PayGradeList Component
 * Displays list of pay grades with filtering and actions
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { payGradeApi } from '../api/payrollConfigApi';
import type { PayGrade, FilterPayGradeDto, ApprovalStatus } from '../types';
import PayGradeModal from './PayGradeModal';
import styles from '../page.module.css';

interface PayGradeListProps {
  userRole?: string;
}

const PayGradeList: React.FC<PayGradeListProps> = ({ userRole }) => {
  const { user } = useAuth();
  const [payGrades, setPayGrades] = useState<PayGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterPayGradeDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayGrade, setSelectedPayGrade] = useState<PayGrade | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isPayrollManager = userRole === SystemRole.PAYROLL_MANAGER;
  const isHRManager = userRole === SystemRole.HR_MANAGER;
  const isSpecialist = userRole === SystemRole.PAYROLL_SPECIALIST;
  const canEdit = isSpecialist || isPayrollManager;
  const canDelete = isSpecialist || isPayrollManager;
  const canApprove = isPayrollManager;

  const fetchPayGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await payGradeApi.getAll(filter);
      setPayGrades(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pay grades');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPayGrades();
  }, [fetchPayGrades]);

  const handleCreate = () => {
    setSelectedPayGrade(null);
    setIsModalOpen(true);
  };

  const handleEdit = (payGrade: PayGrade) => {
    setSelectedPayGrade(payGrade);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pay grade?')) return;
    try {
      setActionLoading(id);
      await payGradeApi.delete(id);
      await fetchPayGrades();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete pay grade');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      setActionLoading(id);
      await payGradeApi.submit(id);
      await fetchPayGrades();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit pay grade');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user?.userid) return;
    try {
      setActionLoading(id);
      await payGradeApi.approve(id, { approvedBy: user.userid });
      await fetchPayGrades();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve pay grade');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this pay grade?')) return;
    try {
      setActionLoading(id);
      await payGradeApi.reject(id);
      await fetchPayGrades();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject pay grade');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPayGrade(null);
  };

  const handleModalSave = async () => {
    await fetchPayGrades();
    handleModalClose();
  };

  const getStatusClass = (status: ApprovalStatus): string => {
    const statusClasses: Record<ApprovalStatus, string> = {
      draft: styles.statusDraft,
      approved: styles.statusApproved,
      rejected: styles.statusRejected,
    };
    return `${styles.statusBadge} ${statusClasses[status] || ''}`;
  };

  const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className={styles.loading}>Loading pay grades...</div>;
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h3>Error</h3>
        <p>{error}</p>
        <Button onClick={fetchPayGrades}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Pay Grades</h2>
        <div className={styles.actions}>
          {isSpecialist && (
            <Button variant="primary" onClick={handleCreate}>
              + Create Pay Grade
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by grade..."
          className={styles.filterInput}
          value={filter.grade || ''}
          onChange={(e) => setFilter({ ...filter, grade: e.target.value || undefined })}
        />
        <select
          className={styles.filterSelect}
          value={filter.status || ''}
          onChange={(e) =>
            setFilter({ ...filter, status: (e.target.value as ApprovalStatus) || undefined })
          }
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft (Pending Approval)</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Data Table */}
      {payGrades.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Pay Grades Found</h3>
          <p>
            {isSpecialist
              ? 'Create your first pay grade to get started.'
              : 'No pay grades available at the moment.'}
          </p>
          {isSpecialist && (
            <Button variant="primary" onClick={handleCreate}>
              + Create Pay Grade
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Base Salary</th>
                <th>Gross Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payGrades.map((payGrade) => (
                <tr key={payGrade._id}>
                  <td>
                    <strong>{payGrade.grade}</strong>
                    {payGrade.description && (
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        {payGrade.description}
                      </div>
                    )}
                  </td>
                  <td className={styles.currency}>
                    {formatCurrency(payGrade.baseSalary, 'EGP')}
                  </td>
                  <td className={styles.currency}>
                    {formatCurrency(payGrade.grossSalary, 'EGP')}
                  </td>
                  <td>
                    <span className={getStatusClass(payGrade.status)}>{payGrade.status}</span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {/* Edit/Delete for DRAFT - Specialist or Payroll Manager */}
                      {payGrade.status === 'draft' && canEdit && (
                        <>
                          <button
                            className={styles.iconButton}
                            onClick={() => handleEdit(payGrade)}
                            disabled={actionLoading === payGrade._id}
                            title="Edit"
                          >
                            ✏️
                          </button>
                        </>
                      )}
                      {payGrade.status === 'draft' && canDelete && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDelete(payGrade._id)}
                            disabled={actionLoading === payGrade._id}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      {payGrade.status === 'draft' && isSpecialist && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(payGrade._id)}
                            disabled={actionLoading === payGrade._id}
                            title="Submit for Approval"
                          >
                            📤
                          </button>
                        </>
                      )}

                      {/* Approve/Reject for DRAFT - Payroll Manager only */}
                      {payGrade.status === 'draft' && canApprove && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(payGrade._id)}
                            disabled={actionLoading === payGrade._id}
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(payGrade._id)}
                            disabled={actionLoading === payGrade._id}
                            title="Reject"
                          >
                            ❌
                          </button>
                        </>
                      )}

                      {/* View for APPROVED */}
                      {payGrade.status === 'approved' && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEdit(payGrade)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      )}

                      {/* REJECTED - can edit again */}
                      {payGrade.status === 'rejected' && isSpecialist && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEdit(payGrade)}
                          disabled={actionLoading === payGrade._id}
                          title="Edit & Resubmit"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <PayGradeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        payGrade={selectedPayGrade}
        readOnly={selectedPayGrade?.status === 'approved'}
      />
    </div>
  );
};

export default PayGradeList;
