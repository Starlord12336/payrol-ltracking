/**
 * ========================== EMAD ==========================
 * TaxRuleList Component
 * Displays list of tax rules with filtering and actions
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { taxRuleApi } from '../api/payrollConfigApi';
import type { TaxRule, FilterTaxRuleDto, ApprovalStatus } from '../types';
import TaxRuleModal from './TaxRuleModal';
import styles from '../page.module.css';
import { formatCurrency } from '@/shared/utils/format';

interface TaxRuleListProps {
  userRole?: string;
}

const TaxRuleList: React.FC<TaxRuleListProps> = ({ userRole }) => {
  const { user } = useAuth();
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTaxRuleDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaxRule, setSelectedTaxRule] = useState<TaxRule | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isManager = userRole === SystemRole.PAYROLL_MANAGER || userRole === SystemRole.HR_MANAGER;
  const isSpecialist = userRole === SystemRole.PAYROLL_SPECIALIST || userRole === SystemRole.LEGAL_POLICY_ADMIN;

  const fetchTaxRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taxRuleApi.getAll(filter);
      setTaxRules(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tax rules');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTaxRules();
  }, [fetchTaxRules]);

  const handleCreate = () => {
    setSelectedTaxRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (taxRule: TaxRule) => {
    setSelectedTaxRule(taxRule);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;
    try {
      setActionLoading(id);
      await taxRuleApi.delete(id);
      await fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete tax rule');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      setActionLoading(id);
      await taxRuleApi.submit(id);
      await fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit tax rule');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user?.userid) return;
    try {
      setActionLoading(id);
      await taxRuleApi.approve(id, { approvedBy: user.userid });
      await fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve tax rule');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this tax rule?')) return;
    try {
      setActionLoading(id);
      await taxRuleApi.reject(id);
      await fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject tax rule');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTaxRule(null);
  };

  const handleModalSave = async () => {
    await fetchTaxRules();
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading tax rules...</div>;
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h3>Error</h3>
        <p>{error}</p>
        <Button onClick={fetchTaxRules}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Tax Rules</h2>
        <div className={styles.actions}>
          {isSpecialist && (
            <Button variant="primary" onClick={handleCreate}>
              + Create Tax Rule
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by name..."
          className={styles.filterInput}
          value={filter.name || ''}
          onChange={(e) => setFilter({ ...filter, name: e.target.value || undefined })}
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
      {taxRules.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Tax Rules Found</h3>
          <p>
            {isSpecialist
              ? 'Create your first tax rule to get started.'
              : 'No tax rules available at the moment.'}
          </p>
          {isSpecialist && (
            <Button variant="primary" onClick={handleCreate}>
              + Create Tax Rule
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Tax Rate (%)</th>
                <th>Min Salary</th>
                <th>Max Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxRules.map((taxRule) => (
                <tr key={taxRule._id}>
                  <td>
                    <strong>{taxRule.name}</strong>
                    {taxRule.description && (
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        {taxRule.description}
                      </div>
                    )}
                  </td>
                  <td>{taxRule.rate !== undefined ? `${taxRule.rate}%` : '-'}</td>
                  <td className={styles.currency}>{formatCurrency(taxRule.minSalary, 'EGP')}</td>
                  <td className={styles.currency}>{taxRule.maxSalary ? formatCurrency(taxRule.maxSalary, 'EGP') : 'No limit'}</td>
                  <td>
                    <span className={getStatusClass(taxRule.status)}>{taxRule.status}</span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {/* Edit/Delete only for DRAFT */}
                      {taxRule.status === 'draft' && isSpecialist && (
                        <>
                          <button
                            className={styles.iconButton}
                            onClick={() => handleEdit(taxRule)}
                            disabled={actionLoading === taxRule._id}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDelete(taxRule._id)}
                            disabled={actionLoading === taxRule._id}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(taxRule._id)}
                            disabled={actionLoading === taxRule._id}
                            title="Submit for Approval"
                          >
                            📤
                          </button>
                        </>
                      )}

                      {/* Approve/Reject for PENDING */}
                      {taxRule.status === 'draft' && isManager && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(taxRule._id)}
                            disabled={actionLoading === taxRule._id}
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(taxRule._id)}
                            disabled={actionLoading === taxRule._id}
                            title="Reject"
                          >
                            ❌
                          </button>
                        </>
                      )}

                      {/* View only for APPROVED */}
                      {taxRule.status === 'approved' && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEdit(taxRule)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      )}

                      {/* REJECTED - can edit again */}
                      {taxRule.status === 'rejected' && isSpecialist && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEdit(taxRule)}
                          disabled={actionLoading === taxRule._id}
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
      <TaxRuleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        taxRule={selectedTaxRule}
        readOnly={selectedTaxRule?.status === 'approved'}
      />
    </div>
  );
};

export default TaxRuleList;
