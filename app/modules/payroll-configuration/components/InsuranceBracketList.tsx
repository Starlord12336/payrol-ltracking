'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { insuranceBracketApi } from '../api/payrollConfigApi';
import { InsuranceBracket, ApprovalStatus, FilterInsuranceBracketDto } from '../types';
import { SystemRole } from '@/shared/types/auth';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import InsuranceBracketModal from './InsuranceBracketModal';
import styles from '../page.module.css';

export default function InsuranceBracketList() {
  const { user } = useAuth();
  const [brackets, setBrackets] = useState<InsuranceBracket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterInsuranceBracketDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBracket, setSelectedBracket] = useState<InsuranceBracket | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const userRole = user?.roles?.[0];
  const isPayrollSpecialist = userRole === SystemRole.PAYROLL_SPECIALIST;
  const isHRManager = userRole === SystemRole.HR_MANAGER;
  const canEdit = isPayrollSpecialist || isHRManager;
  const canDelete = isHRManager;
  const canApprove = isHRManager;

  const fetchBrackets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await insuranceBracketApi.getAll(filter);
      setBrackets(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch insurance brackets');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBrackets();
  }, [fetchBrackets]);

  const handleCreate = () => {
    if (!isPayrollSpecialist) return;
    setSelectedBracket(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bracket: InsuranceBracket) => {
    if (!canEdit || bracket.status !== ApprovalStatus.DRAFT) return;
    setSelectedBracket(bracket);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isHRManager) return;
    if (!confirm('Are you sure you want to delete this insurance bracket?')) return;
    try {
      setActionLoading(id);
      await insuranceBracketApi.delete(id);
      await fetchBrackets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete insurance bracket');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!isPayrollSpecialist) return;
    try {
      setActionLoading(id);
      await insuranceBracketApi.submit(id);
      await fetchBrackets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit insurance bracket');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!isHRManager || !user?.userid) return;
    try {
      setActionLoading(id);
      await insuranceBracketApi.approve(id, { approvedBy: user.userid });
      await fetchBrackets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve insurance bracket');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!isHRManager) return;
    if (!confirm('Are you sure you want to reject this insurance bracket?')) return;
    try {
      setActionLoading(id);
      await insuranceBracketApi.reject(id);
      await fetchBrackets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject insurance bracket');
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

  if (loading && brackets.length === 0) {
    return <div className={styles.loading}>Loading insurance brackets...</div>;
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>Insurance Brackets</h2>
          <p className={styles.listSubtitle}>
            Manage insurance brackets for social and health insurance
            <span className={styles.roleBadge} style={{ marginLeft: '1rem', background: '#ff9f1c', color: 'white' }}>
              HR Manager Approves
            </span>
          </p>
        </div>
        {isPayrollSpecialist && (
          <Button variant="primary" onClick={handleCreate}>
            + Create Insurance Bracket
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
              <th>Min Salary</th>
              <th>Max Salary</th>
              <th>Employee Rate (%)</th>
              <th>Employer Rate (%)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brackets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  No insurance brackets found
                </td>
              </tr>
            ) : (
              brackets.map((bracket) => (
                <tr key={bracket._id}>
                  <td>
                    <strong>{bracket.name}</strong>
                  </td>
                  <td className={styles.currency}>{formatCurrency(bracket.minSalary, 'EGP')}</td>
                  <td className={styles.currency}>{formatCurrency(bracket.maxSalary, 'EGP')}</td>
                  <td>{bracket.employeePercentage}%</td>
                  <td>{formatCurrency(bracket.employerRate, 'EGP')}</td>
                  <td>{getStatusBadge(bracket.status)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {bracket.status === ApprovalStatus.DRAFT && isPayrollSpecialist && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonEdit}`}
                            onClick={() => handleEdit(bracket)}
                            title="Edit"
                            disabled={actionLoading === bracket._id}
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(bracket._id)}
                            title="Submit for Approval"
                            disabled={actionLoading === bracket._id}
                          >
                            📤
                          </button>
                        </>
                      )}
                      {bracket.status === ApprovalStatus.DRAFT && isHRManager && (
                        <button
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          onClick={() => handleDelete(bracket._id)}
                          title="Delete"
                          disabled={actionLoading === bracket._id}
                        >
                          🗑️
                        </button>
                      )}
                      {bracket.status === ApprovalStatus.DRAFT && isHRManager && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(bracket._id)}
                            title="Approve"
                            disabled={actionLoading === bracket._id}
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(bracket._id)}
                            title="Reject"
                            disabled={actionLoading === bracket._id}
                          >
                            ❌
                          </button>
                        </>
                      )}
                      {bracket.status === ApprovalStatus.APPROVED && (
                        <span style={{ color: '#059669', fontSize: '0.875rem' }}>
                          Approved {bracket.approvedAt && `on ${formatDate(bracket.approvedAt)}`}
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

      <InsuranceBracketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchBrackets}
        bracket={selectedBracket}
      />
    </div>
  );
}
