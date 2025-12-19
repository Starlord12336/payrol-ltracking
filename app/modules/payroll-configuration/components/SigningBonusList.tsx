'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { signingBonusApi } from '../api/payrollConfigApi';
import { SigningBonus, ApprovalStatus, FilterSigningBonusDto } from '../types';
import { SystemRole } from '@/shared/types/auth';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import SigningBonusModal from './SigningBonusModal';
import styles from '../page.module.css';

export default function SigningBonusList() {
  const { user } = useAuth();
  const [bonuses, setBonuses] = useState<SigningBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterSigningBonusDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<SigningBonus | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const userRole = user?.roles?.[0];
  const isPayrollSpecialist = userRole === SystemRole.PAYROLL_SPECIALIST;
  const isPayrollManager = userRole === SystemRole.PAYROLL_MANAGER;
  const canEdit = isPayrollSpecialist || isPayrollManager;
  const canDelete = isPayrollSpecialist || isPayrollManager;
  const canApprove = isPayrollManager;

  const fetchBonuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await signingBonusApi.getAll(filter);
      setBonuses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch signing bonuses');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBonuses();
  }, [fetchBonuses]);

  const handleCreate = () => {
    if (!isPayrollSpecialist) return;
    setSelectedBonus(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bonus: SigningBonus) => {
    if (!isPayrollSpecialist || bonus.status !== ApprovalStatus.DRAFT) return;
    setSelectedBonus(bonus);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isPayrollSpecialist) return;
    if (!confirm('Are you sure you want to delete this signing bonus?')) return;
    try {
      setActionLoading(id);
      await signingBonusApi.delete(id);
      await fetchBonuses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete signing bonus');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!isPayrollSpecialist) return;
    try {
      setActionLoading(id);
      await signingBonusApi.submit(id);
      await fetchBonuses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit signing bonus');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!isPayrollManager || !user?.userid) return;
    try {
      setActionLoading(id);
      await signingBonusApi.approve(id, { approvedBy: user.userid });
      await fetchBonuses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve signing bonus');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!isPayrollManager) return;
    if (!confirm('Are you sure you want to reject this signing bonus?')) return;
    try {
      setActionLoading(id);
      await signingBonusApi.reject(id);
      await fetchBonuses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject signing bonus');
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

  if (loading && bonuses.length === 0) {
    return <div className={styles.loading}>Loading signing bonuses...</div>;
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>Signing Bonuses</h2>
          <p className={styles.listSubtitle}>
            Manage signing bonuses for new hires by position (one bonus per position)
          </p>
        </div>
        {isPayrollSpecialist && (
          <Button variant="primary" onClick={handleCreate}>
            + Create Signing Bonus
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
          placeholder="Search by position name..."
          value={filter.positionName || ''}
          onChange={(e) => setFilter({ ...filter, positionName: e.target.value || undefined })}
          className={styles.filterInput}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Position Name</th>
              <th>Bonus Amount</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bonuses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No signing bonuses found
                </td>
              </tr>
            ) : (
              bonuses.map((bonus) => (
                <tr key={bonus._id}>
                  <td>
                    <strong>{bonus.positionName}</strong>
                  </td>
                  <td>
                    <strong style={{ color: '#059669', fontSize: '1.125rem' }}>
                      {formatCurrency(bonus.amount, 'EGP')}
                    </strong>
                  </td>
                  <td>{getStatusBadge(bonus.status)}</td>
                  <td>{formatDate(bonus.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {bonus.status === ApprovalStatus.DRAFT && isPayrollSpecialist && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonEdit}`}
                            onClick={() => handleEdit(bonus)}
                            title="Edit"
                            disabled={actionLoading === bonus._id}
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDelete(bonus._id)}
                            title="Delete"
                            disabled={actionLoading === bonus._id}
                          >
                            🗑️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(bonus._id)}
                            title="Submit for Approval"
                            disabled={actionLoading === bonus._id}
                          >
                            📤
                          </button>
                        </>
                      )}
                      {bonus.status === ApprovalStatus.DRAFT && isPayrollManager && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(bonus._id)}
                            title="Approve"
                            disabled={actionLoading === bonus._id}
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(bonus._id)}
                            title="Reject"
                            disabled={actionLoading === bonus._id}
                          >
                            ❌
                          </button>
                        </>
                      )}
                      {bonus.status === ApprovalStatus.APPROVED && (
                        <span style={{ color: '#059669', fontSize: '0.875rem' }}>
                          Approved {bonus.approvedAt && `on ${formatDate(bonus.approvedAt)}`}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SigningBonusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchBonuses}
        bonus={selectedBonus}
      />
    </div>
  );
}
