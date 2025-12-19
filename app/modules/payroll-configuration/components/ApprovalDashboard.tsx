/**
 * ========================== EMAD ==========================
 * ApprovalDashboard Component
 * Displays pending approvals and approved configurations dashboard
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import {
  approvalApi,
  payGradeApi,
  allowanceApi,
  taxRuleApi,
  insuranceBracketApi,
  payrollPolicyApi,
  signingBonusApi,
  payTypeApi,
  terminationBenefitApi,
  companySettingsApi,
} from '../api/payrollConfigApi';
import type { PendingApprovalsDashboard, ApprovedConfigurations } from '../types';
import styles from '../page.module.css';

interface ApprovalDashboardProps {
  userRole?: SystemRole;
}

const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({ userRole }) => {
  const [pendingData, setPendingData] = useState<PendingApprovalsDashboard | null>(null);
  const [approvedData, setApprovedData] = useState<ApprovedConfigurations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  // Check if user has manager permissions for approval actions
  const isManager = userRole === SystemRole.PAYROLL_MANAGER || userRole === SystemRole.HR_MANAGER;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pending, approved] = await Promise.all([
        approvalApi.getPendingDashboard(),
        approvalApi.getAllApproved(),
      ]);

      setPendingData(pending);
      setApprovedData(approved);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApprove = async (
    type:
      | 'payGrade'
      | 'allowance'
      | 'taxRule'
      | 'insuranceBracket'
      | 'payrollPolicy'
      | 'signingBonus'
      | 'payType'
      | 'terminationBenefit'
      | 'companySettings',
    id: string
  ) => {
    try {
      setActionLoading(`${type}-${id}`);
      switch (type) {
        case 'payGrade':
          await payGradeApi.approve(id);
          break;
        case 'allowance':
          await allowanceApi.approve(id);
          break;
        case 'taxRule':
          await taxRuleApi.approve(id);
          break;
        case 'insuranceBracket':
          await insuranceBracketApi.approve(id);
          break;
        case 'payrollPolicy':
          await payrollPolicyApi.approve(id);
          break;
        case 'signingBonus':
          await signingBonusApi.approve(id);
          break;
        case 'payType':
          await payTypeApi.approve(id);
          break;
        case 'terminationBenefit':
          await terminationBenefitApi.approve(id);
          break;
        case 'companySettings':
          await companySettingsApi.approve(id);
          break;
      }
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (
    type:
      | 'payGrade'
      | 'allowance'
      | 'taxRule'
      | 'insuranceBracket'
      | 'payrollPolicy'
      | 'signingBonus'
      | 'payType'
      | 'terminationBenefit'
      | 'companySettings',
    id: string
  ) => {
    if (!confirm('Are you sure you want to reject this item?')) return;
    try {
      setActionLoading(`${type}-${id}`);
      switch (type) {
        case 'payGrade':
          await payGradeApi.reject(id);
          break;
        case 'allowance':
          await allowanceApi.reject(id);
          break;
        case 'taxRule':
          await taxRuleApi.reject(id);
          break;
        case 'insuranceBracket':
          await insuranceBracketApi.reject(id);
          break;
        case 'payrollPolicy':
          await payrollPolicyApi.reject(id);
          break;
        case 'signingBonus':
          await signingBonusApi.reject(id);
          break;
        case 'payType':
          await payTypeApi.reject(id);
          break;
        case 'terminationBenefit':
          await terminationBenefitApi.reject(id);
          break;
        case 'companySettings':
          await companySettingsApi.reject(id);
          break;
      }
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading approval dashboard...</div>;
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h3>Error</h3>
        <p>{error}</p>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  // Use backend's totalPending which includes all 9 entity types
  const totalPending = pendingData?.totalPending || 0;

  const totalApproved =
    (approvedData?.payGrades?.length || 0) +
    (approvedData?.allowances?.length || 0) +
    (approvedData?.taxRules?.length || 0) +
    (approvedData?.insuranceBrackets?.length || 0) +
    (approvedData?.payrollPolicies?.length || 0) +
    (approvedData?.signingBonuses?.length || 0) +
    (approvedData?.payTypes?.length || 0) +
    (approvedData?.terminationBenefits?.length || 0) +
    (approvedData?.companySettings?.length || 0);

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Approval Dashboard</h2>
        <div className={styles.actions}>
          <Button variant="outline" onClick={fetchDashboardData}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardCard} onClick={() => setActiveTab('pending')} style={{ cursor: 'pointer' }}>
          <h3>Draft Configurations</h3>
          <p className={styles.dashboardCardValue}>{totalPending}</p>
          <p className={styles.dashboardCardLabel}>Items awaiting approval</p>
        </div>
        <div className={styles.dashboardCard} onClick={() => setActiveTab('approved')} style={{ cursor: 'pointer', borderLeftColor: '#059669' }}>
          <h3>Approved Configurations</h3>
          <p className={styles.dashboardCardValue} style={{ color: '#059669' }}>{totalApproved}</p>
          <p className={styles.dashboardCardLabel}>Active configurations</p>
        </div>
        <div className={styles.dashboardCard} style={{ borderLeftColor: '#3b82f6' }}>
          <h3>Pay Grades</h3>
          <p className={styles.dashboardCardValue} style={{ color: '#3b82f6' }}>
            {pendingData?.payGrades?.count || 0} / {approvedData?.payGrades?.length || 0}
          </p>
          <p className={styles.dashboardCardLabel}>Draft / Approved</p>
        </div>
        <div className={styles.dashboardCard} style={{ borderLeftColor: '#8b5cf6' }}>
          <h3>Allowances</h3>
          <p className={styles.dashboardCardValue} style={{ color: '#8b5cf6' }}>
            {pendingData?.allowances?.count || 0} / {approvedData?.allowances?.length || 0}
          </p>
          <p className={styles.dashboardCardLabel}>Draft / Approved</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Draft Configurations ({totalPending})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'approved' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Configurations ({totalApproved})
          </button>
        </div>
      </div>

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className={styles.tabContent}>
          {totalPending === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Draft Configurations</h3>
              <p>All items have been reviewed. Great job!</p>
            </div>
          ) : (
            <>
              {/* Pending Pay Grades */}
              {pendingData?.payGrades?.items && pendingData.payGrades.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Pay Grades ({pendingData.payGrades.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Salary Range</th>
                        <th>Created</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.payGrades.items.map((pg) => (
                        <tr key={pg._id}>
                          <td>
                            <strong>{pg.grade}</strong>
                            {pg.description && (
                              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                {pg.description}
                              </div>
                            )}
                          </td>
                          <td>
                            {formatCurrency(pg.baseSalary, pg.currency)} -{' '}
                            {formatCurrency(pg.grossSalary, pg.currency)}
                          </td>
                          <td>{formatDate(pg.createdAt)}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('payGrade', pg._id)}
                                  disabled={actionLoading === `payGrade-${pg._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('payGrade', pg._id)}
                                  disabled={actionLoading === `payGrade-${pg._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Allowances */}
              {pendingData?.allowances?.items && pendingData.allowances.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Allowances ({pendingData.allowances.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.allowances.items.map((al) => (
                        <tr key={al._id}>
                          <td>
                            <strong>{al.name}</strong>
                          </td>
                          <td>{formatCurrency(al.amount)}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('allowance', al._id)}
                                  disabled={actionLoading === `allowance-${al._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('allowance', al._id)}
                                  disabled={actionLoading === `allowance-${al._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Tax Rules */}
              {pendingData?.taxRules?.items && pendingData.taxRules.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Tax Rules ({pendingData.taxRules.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Tax Rate</th>
                        <th>Salary Range</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.taxRules.items.map((tr) => (
                        <tr key={tr._id}>
                          <td>
                            <strong>{tr.name}</strong>
                            {tr.description && (
                              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                {tr.description}
                              </div>
                            )}
                          </td>
                          <td>{tr.taxRate}%</td>
                          <td>
                            {formatCurrency(tr.minSalary)}
                            {tr.maxSalary ? ` - ${formatCurrency(tr.maxSalary)}` : '+'}
                          </td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('taxRule', tr._id)}
                                  disabled={actionLoading === `taxRule-${tr._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('taxRule', tr._id)}
                                  disabled={actionLoading === `taxRule-${tr._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Insurance Brackets */}
              {pendingData?.insuranceBrackets?.items && pendingData.insuranceBrackets.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Insurance Brackets ({pendingData.insuranceBrackets.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Salary Range</th>
                        <th>Employee/Employer Rates</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.insuranceBrackets.items.map((ib) => (
                        <tr key={ib._id}>
                          <td><strong>{ib.name}</strong></td>
                          <td>
                            {formatCurrency(ib.minSalary)} - {formatCurrency(ib.maxSalary)}
                          </td>
                          <td>{ib.employeeRate}% / {ib.employerRate}%</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('insuranceBracket', ib._id)}
                                  disabled={actionLoading === `insuranceBracket-${ib._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('insuranceBracket', ib._id)}
                                  disabled={actionLoading === `insuranceBracket-${ib._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Payroll Policies */}
              {pendingData?.payrollPolicies?.items && pendingData.payrollPolicies.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Payroll Policies ({pendingData.payrollPolicies.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Policy Name</th>
                        <th>Type</th>
                        <th>Applicability</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.payrollPolicies.items.map((pp) => (
                        <tr key={pp._id}>
                          <td><strong>{pp.policyName}</strong></td>
                          <td>{pp.policyType}</td>
                          <td>{pp.applicability}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('payrollPolicy', pp._id)}
                                  disabled={actionLoading === `payrollPolicy-${pp._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('payrollPolicy', pp._id)}
                                  disabled={actionLoading === `payrollPolicy-${pp._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Signing Bonuses */}
              {pendingData?.signingBonuses?.items && pendingData.signingBonuses.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Signing Bonuses ({pendingData.signingBonuses.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Amount</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.signingBonuses.items.map((sb) => (
                        <tr key={sb._id}>
                          <td><strong>{sb.positionName}</strong></td>
                          <td>{formatCurrency(sb.amount)}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('signingBonus', sb._id)}
                                  disabled={actionLoading === `signingBonus-${sb._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('signingBonus', sb._id)}
                                  disabled={actionLoading === `signingBonus-${sb._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Pay Types */}
              {pendingData?.payTypes?.items && pendingData.payTypes.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Pay Types ({pendingData.payTypes.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.payTypes.items.map((pt) => (
                        <tr key={pt._id}>
                          <td><strong>{pt.type}</strong></td>
                          <td>{formatCurrency(pt.amount)}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('payType', pt._id)}
                                  disabled={actionLoading === `payType-${pt._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('payType', pt._id)}
                                  disabled={actionLoading === `payType-${pt._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Termination Benefits */}
              {pendingData?.terminationBenefits?.items && pendingData.terminationBenefits.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Termination Benefits ({pendingData.terminationBenefits.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.terminationBenefits.items.map((tb) => (
                        <tr key={tb._id}>
                          <td><strong>{tb.name}</strong></td>
                          <td>{formatCurrency(tb.amount)}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('terminationBenefit', tb._id)}
                                  disabled={actionLoading === `terminationBenefit-${tb._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('terminationBenefit', tb._id)}
                                  disabled={actionLoading === `terminationBenefit-${tb._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Company Settings */}
              {pendingData?.companySettings?.items && pendingData.companySettings.items.length > 0 && (
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Company Settings ({pendingData.companySettings.count})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Pay Date</th>
                        <th>Time Zone</th>
                        <th>Currency</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.companySettings.items.map((cs) => (
                        <tr key={cs._id}>
                          <td>{formatDate(cs.payDate)}</td>
                          <td>{cs.timeZone}</td>
                          <td>{cs.currency}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('companySettings', cs._id)}
                                  disabled={actionLoading === `companySettings-${cs._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('companySettings', cs._id)}
                                  disabled={actionLoading === `companySettings-${cs._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Approved Configurations Tab */}
      {activeTab === 'approved' && (
        <div className={styles.tabContent}>
          {totalApproved === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Approved Configurations</h3>
              <p>No configurations have been approved yet.</p>
            </div>
          ) : (
            <>
              {/* Approved Pay Grades */}
              {approvedData?.payGrades && approvedData.payGrades.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Pay Grades ({approvedData.payGrades.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Salary Range</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.payGrades.map((pg) => (
                        <tr key={pg._id}>
                          <td>
                            <strong>{pg.grade}</strong>
                          </td>
                          <td>
                            {formatCurrency(pg.baseSalary, pg.currency)} -{' '}
                            {formatCurrency(pg.grossSalary, pg.currency)}
                          </td>
                          <td>{pg.approvedAt ? formatDate(pg.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Allowances */}
              {approvedData?.allowances && approvedData.allowances.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Allowances ({approvedData.allowances.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.allowances.map((al) => (
                        <tr key={al._id}>
                          <td>
                            <strong>{al.name}</strong>
                          </td>
                          <td>{formatCurrency(al.amount)}</td>
                          <td>{al.approvedAt ? formatDate(al.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Tax Rules */}
              {approvedData?.taxRules && approvedData.taxRules.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Tax Rules ({approvedData.taxRules.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Tax Rate</th>
                        <th>Salary Range</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.taxRules.map((tr) => (
                        <tr key={tr._id}>
                          <td>
                            <strong>{tr.name}</strong>
                            {tr.description && (
                              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                {tr.description}
                              </div>
                            )}
                          </td>
                          <td>{tr.taxRate}%</td>
                          <td>
                            {formatCurrency(tr.minSalary)}
                            {tr.maxSalary ? ` - ${formatCurrency(tr.maxSalary)}` : '+'}
                          </td>
                          <td>{tr.approvedAt ? formatDate(tr.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Insurance Brackets */}
              {approvedData?.insuranceBrackets && approvedData.insuranceBrackets.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Insurance Brackets ({approvedData.insuranceBrackets.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Salary Range</th>
                        <th>Employee/Employer Rates</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.insuranceBrackets.map((ib) => (
                        <tr key={ib._id}>
                          <td><strong>{ib.name}</strong></td>
                          <td>
                            {formatCurrency(ib.minSalary)} - {formatCurrency(ib.maxSalary)}
                          </td>
                          <td>{ib.employeeRate}% / {ib.employerRate}%</td>
                          <td>{ib.approvedAt ? formatDate(ib.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Payroll Policies */}
              {approvedData?.payrollPolicies && approvedData.payrollPolicies.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Payroll Policies ({approvedData.payrollPolicies.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Policy Name</th>
                        <th>Type</th>
                        <th>Applicability</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.payrollPolicies.map((pp) => (
                        <tr key={pp._id}>
                          <td><strong>{pp.policyName}</strong></td>
                          <td>{pp.policyType}</td>
                          <td>{pp.applicability}</td>
                          <td>{pp.approvedAt ? formatDate(pp.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Signing Bonuses */}
              {approvedData?.signingBonuses && approvedData.signingBonuses.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Signing Bonuses ({approvedData.signingBonuses.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Amount</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.signingBonuses.map((sb) => (
                        <tr key={sb._id}>
                          <td><strong>{sb.positionName}</strong></td>
                          <td>{formatCurrency(sb.amount)}</td>
                          <td>{sb.approvedAt ? formatDate(sb.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Pay Types */}
              {approvedData?.payTypes && approvedData.payTypes.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Pay Types ({approvedData.payTypes.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.payTypes.map((pt) => (
                        <tr key={pt._id}>
                          <td><strong>{pt.type}</strong></td>
                          <td>{formatCurrency(pt.amount)}</td>
                          <td>{pt.approvedAt ? formatDate(pt.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Termination Benefits */}
              {approvedData?.terminationBenefits && approvedData.terminationBenefits.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Termination Benefits ({approvedData.terminationBenefits.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.terminationBenefits.map((tb) => (
                        <tr key={tb._id}>
                          <td><strong>{tb.name}</strong></td>
                          <td>{formatCurrency(tb.amount)}</td>
                          <td>{tb.approvedAt ? formatDate(tb.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Company Settings */}
              {approvedData?.companySettings && approvedData.companySettings.length > 0 && (
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Company Settings ({approvedData.companySettings.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Pay Date</th>
                        <th>Time Zone</th>
                        <th>Currency</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.companySettings.map((cs) => (
                        <tr key={cs._id}>
                          <td>{formatDate(cs.payDate)}</td>
                          <td>{cs.timeZone}</td>
                          <td>{cs.currency}</td>
                          <td>{cs.approvedAt ? formatDate(cs.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalDashboard;
