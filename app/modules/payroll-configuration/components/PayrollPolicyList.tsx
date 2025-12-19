'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { payrollPolicyApi } from '../api/payrollConfigApi';
import { PayrollPolicy, ApprovalStatus, FilterPayrollPolicyDto, PolicyType, PolicyApplicability } from '../types';
import { SystemRole } from '@/shared/types/auth';
import { formatDate } from '@/shared/utils/format';
import PayrollPolicyModal from './PayrollPolicyModal';
import styles from '../page.module.css';

export default function PayrollPolicyList() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<PayrollPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterPayrollPolicyDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PayrollPolicy | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const userRole = user?.roles?.[0];
  const isPayrollSpecialist = userRole === SystemRole.PAYROLL_SPECIALIST;
  const isPayrollManager = userRole === SystemRole.PAYROLL_MANAGER;
  const canEdit = isPayrollSpecialist || isPayrollManager;
  const canDelete = isPayrollSpecialist || isPayrollManager;
  const canApprove = isPayrollManager;

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await payrollPolicyApi.getAll(filter);
      setPolicies(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payroll policies');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleCreate = () => {
    if (!isPayrollSpecialist) return;
    setSelectedPolicy(null);
    setIsModalOpen(true);
  };

  const handleEdit = (policy: PayrollPolicy) => {
    if (!isPayrollSpecialist || policy.status !== ApprovalStatus.DRAFT) return;
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isPayrollSpecialist) return;
    if (!confirm('Are you sure you want to delete this payroll policy?')) return;
    try {
      setActionLoading(id);
      await payrollPolicyApi.delete(id);
      await fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payroll policy');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!isPayrollSpecialist) return;
    try {
      setActionLoading(id);
      await payrollPolicyApi.submit(id);
      await fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit payroll policy');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!isPayrollManager || !user?.userid) return;
    try {
      setActionLoading(id);
      await payrollPolicyApi.approve(id, { approvedBy: user.userid });
      await fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve policy');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!isPayrollManager) return;
    if (!confirm('Are you sure you want to reject this payroll policy?')) return;
    try {
      setActionLoading(id);
      await payrollPolicyApi.reject(id);
      await fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject payroll policy');
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

  const formatApplicability = (policy: PayrollPolicy) => {
    if (policy.applicability === PolicyApplicability.ALL) return 'All Employees';
    if (policy.applicability === PolicyApplicability.DEPARTMENT) return 'Department';
    if (policy.applicability === PolicyApplicability.POSITION) return 'Position';
    if (policy.applicability === PolicyApplicability.INDIVIDUAL) return 'Individual';
    return policy.applicability;
  };

  if (loading && policies.length === 0) {
    return <div className={styles.loading}>Loading payroll policies...</div>;
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>Payroll Policies</h2>
          <p className={styles.listSubtitle}>
            Manage deductions, allowances, bonuses, penalties, and leave policies
          </p>
        </div>
        {isPayrollSpecialist && (
          <Button variant="primary" onClick={handleCreate}>
            + Create Payroll Policy
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

        <select
          value={filter.policyType || ''}
          onChange={(e) => setFilter({ ...filter, policyType: e.target.value as PolicyType || undefined })}
          className={styles.filterSelect}
        >
          <option value="">All Policy Types</option>
          <option value={PolicyType.DEDUCTION}>Deduction</option>
          <option value={PolicyType.ALLOWANCE}>Allowance</option>
          <option value={PolicyType.BONUS}>Bonus</option>
          <option value={PolicyType.PENALTY}>Penalty</option>
          <option value={PolicyType.LEAVE}>Leave</option>
        </select>

        <select
          value={filter.applicability || ''}
          onChange={(e) => setFilter({ ...filter, applicability: e.target.value as PolicyApplicability || undefined })}
          className={styles.filterSelect}
        >
          <option value="">All Applicability</option>
          <option value={PolicyApplicability.ALL}>All Employees</option>
          <option value={PolicyApplicability.DEPARTMENT}>Department</option>
          <option value={PolicyApplicability.POSITION}>Position</option>
          <option value={PolicyApplicability.INDIVIDUAL}>Individual</option>
        </select>

        <input
          type="text"
          placeholder="Search by name..."
          value={filter.policyName || ''}
          onChange={(e) => setFilter({ ...filter, policyName: e.target.value || undefined })}
          className={styles.filterInput}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Policy Name</th>
              <th>Policy Type</th>
              <th>Applicability</th>
              <th>Effective Date</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  No payroll policies found
                </td>
              </tr>
            ) : (
              policies.map((policy) => (
                <tr key={policy._id}>
                  <td>
                    <strong>{policy.policyName}</strong>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem',
                      background: policy.policyType === PolicyType.DEDUCTION || policy.policyType === PolicyType.PENALTY ? '#fee2e2' : '#dcfce7',
                      color: policy.policyType === PolicyType.DEDUCTION || policy.policyType === PolicyType.PENALTY ? '#991b1b' : '#166534',
                      fontSize: '0.875rem',
                    }}>
                      {policy.policyType}
                    </span>
                  </td>
                  <td>{formatApplicability(policy)}</td>
                  <td>{formatDate(policy.effectiveDate)}</td>
                  <td>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {policy.description || '-'}
                    </div>
                  </td>
                  <td>{getStatusBadge(policy.status)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {policy.status === ApprovalStatus.DRAFT && isPayrollSpecialist && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonEdit}`}
                            onClick={() => handleEdit(policy)}
                            title="Edit"
                            disabled={actionLoading === policy._id}
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDelete(policy._id)}
                            title="Delete"
                            disabled={actionLoading === policy._id}
                          >
                            🗑️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(policy._id)}
                            title="Submit for Approval"
                            disabled={actionLoading === policy._id}
                          >
                            📤
                          </button>
                        </>
                      )}
                      {policy.status === ApprovalStatus.DRAFT && isPayrollManager && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(policy._id)}
                            title="Approve"
                            disabled={actionLoading === policy._id}
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(policy._id)}
                            title="Reject"
                            disabled={actionLoading === policy._id}
                          >
                            ❌
                          </button>
                        </>
                      )}
                      {policy.status === ApprovalStatus.APPROVED && (
                        <span style={{ color: '#059669', fontSize: '0.875rem' }}>
                          Approved {policy.approvedAt && `on ${formatDate(policy.approvedAt)}`}
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

      <PayrollPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchPolicies}
        policy={selectedPolicy}
      />
    </div>
  );
}
