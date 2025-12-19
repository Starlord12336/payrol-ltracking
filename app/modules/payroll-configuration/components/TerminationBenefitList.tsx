'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { terminationBenefitApi } from '../api/payrollConfigApi';
import { TerminationBenefit, ApprovalStatus, FilterTerminationBenefitDto, BenefitType, CalculationType } from '../types';
import { SystemRole } from '@/shared/types/auth';
import { formatDate, formatCurrency } from '@/shared/utils/format';
import TerminationBenefitModal from './TerminationBenefitModal';
import styles from '../page.module.css';

export default function TerminationBenefitList() {
  const { user } = useAuth();
  const [benefits, setBenefits] = useState<TerminationBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTerminationBenefitDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<TerminationBenefit | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const userRole = user?.roles?.[0];
  const isPayrollSpecialist = userRole === SystemRole.PAYROLL_SPECIALIST;
  const isPayrollManager = userRole === SystemRole.PAYROLL_MANAGER;
  const canEdit = isPayrollSpecialist || isPayrollManager;
  const canDelete = isPayrollManager; // Only Payroll Manager can delete (even approved items)
  const canApprove = isPayrollManager;

  const fetchBenefits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await terminationBenefitApi.getAll(filter);
      setBenefits(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch termination benefits');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBenefits();
  }, [fetchBenefits]);

  const handleCreate = () => {
    if (!isPayrollSpecialist) return;
    setSelectedBenefit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (benefit: TerminationBenefit) => {
    if (!isPayrollSpecialist || benefit.status !== ApprovalStatus.DRAFT) return;
    setSelectedBenefit(benefit);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, status: ApprovalStatus) => {
    if (!isPayrollSpecialist && status === ApprovalStatus.DRAFT) return;
    if (!isPayrollManager && status === ApprovalStatus.APPROVED) return;
    
    const message = status === ApprovalStatus.APPROVED 
      ? 'This is an approved termination benefit. Are you sure you want to delete it? This action requires manager approval.'
      : 'Are you sure you want to delete this termination benefit?';
    
    if (!confirm(message)) return;

    try {
      setActionLoading(id);
      await terminationBenefitApi.delete(id, status === ApprovalStatus.APPROVED ? user?.userid : undefined);
      await fetchBenefits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete termination benefit');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!isPayrollSpecialist) return;
    try {
      setActionLoading(id);
      await terminationBenefitApi.submit(id);
      await fetchBenefits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit termination benefit');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!isPayrollManager || !user?.userid) return;
    try {
      setActionLoading(id);
      await terminationBenefitApi.approve(id, { approvedBy: user.userid });
      await fetchBenefits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve termination benefit');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!isPayrollManager) return;
    if (!confirm('Are you sure you want to reject this termination benefit?')) return;
    try {
      setActionLoading(id);
      await terminationBenefitApi.reject(id);
      await fetchBenefits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject termination benefit');
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

  const getBenefitTypeBadge = (type: BenefitType) => {
    const colors: Record<BenefitType, string> = {
      [BenefitType.SEVERANCE]: '#3b82f6',
      [BenefitType.GRATUITY]: '#10b981',
      [BenefitType.LEAVE_ENCASHMENT]: '#f59e0b',
    };
    return (
      <span style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        background: `${colors[type]}20`,
        color: colors[type],
        fontSize: '0.875rem',
        fontWeight: '500',
      }}>
        {type.replace('_', ' ')}
      </span>
    );
  };

  if (loading && benefits.length === 0) {
    return <div className={styles.loading}>Loading termination benefits...</div>;
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>Termination Benefits</h2>
          <p className={styles.listSubtitle}>
            Manage severance, notice pay, and end-of-service benefits
          </p>
        </div>
        {isPayrollSpecialist && (
          <Button variant="primary" onClick={handleCreate}>
            + Create Termination Benefit
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
          placeholder="Search by name..."
          value={filter.name || ''}
          onChange={(e) => setFilter({ ...filter, name: e.target.value || undefined })}
          className={styles.filterInput}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Terms</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {benefits.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No termination benefits found
                </td>
              </tr>
            ) : (
              benefits.map((benefit) => (
                <tr key={benefit._id}>
                  <td>
                    <strong>{benefit.name}</strong>
                  </td>
                  <td className={styles.currency}>
                    {formatCurrency(benefit.amount, 'EGP')}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {benefit.terms || '-'}
                    </div>
                  </td>
                  <td>{getStatusBadge(benefit.status)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {benefit.status === ApprovalStatus.DRAFT && isPayrollSpecialist && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonEdit}`}
                            onClick={() => handleEdit(benefit)}
                            title="Edit"
                            disabled={actionLoading === benefit._id}
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDelete(benefit._id, benefit.status)}
                            title="Delete"
                            disabled={actionLoading === benefit._id}
                          >
                            🗑️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(benefit._id)}
                            title="Submit for Approval"
                            disabled={actionLoading === benefit._id}
                          >
                            📤
                          </button>
                        </>
                      )}
                      {benefit.status === ApprovalStatus.DRAFT && isPayrollManager && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(benefit._id)}
                            title="Approve"
                            disabled={actionLoading === benefit._id}
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(benefit._id)}
                            title="Reject"
                            disabled={actionLoading === benefit._id}
                          >
                            ❌
                          </button>
                        </>
                      )}
                      {benefit.status === ApprovalStatus.APPROVED && (
                        <>
                          <span style={{ color: '#059669', fontSize: '0.875rem', marginRight: '0.5rem' }}>
                            Approved {benefit.approvedAt && `on ${formatDate(benefit.approvedAt)}`}
                          </span>
                          {isPayrollManager && (
                            <button
                              className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                              onClick={() => handleDelete(benefit._id, benefit.status)}
                              title="Delete (Manager Only)"
                              disabled={actionLoading === benefit._id}
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

      <TerminationBenefitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchBenefits}
        benefit={selectedBenefit}
      />
    </div>
  );
}
