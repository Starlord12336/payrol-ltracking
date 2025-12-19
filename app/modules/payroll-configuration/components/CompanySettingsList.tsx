'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { companySettingsApi } from '../api/payrollConfigApi';
import { CompanySettings, ApprovalStatus, FilterCompanySettingsDto } from '../types';
import { SystemRole } from '@/shared/types/auth';
import { formatDate } from '@/shared/utils/format';
import CompanySettingsModal from './CompanySettingsModal';
import styles from '../page.module.css';

export default function CompanySettingsList() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings[]>([]);
  const [activeSettings, setActiveSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCompanySettingsDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState<CompanySettings | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const userRole = user?.roles?.[0];
  const isSystemAdmin = userRole === SystemRole.SYSTEM_ADMIN;
  const isPayrollManager = userRole === SystemRole.PAYROLL_MANAGER;
  const canEdit = isSystemAdmin;
  const canDelete = isSystemAdmin;
  const canApprove = isPayrollManager;

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch active settings separately
      try {
        const active = await companySettingsApi.getActive();
        setActiveSettings(active);
      } catch (err) {
        // No active settings yet
        setActiveSettings(null);
      }
      
      // Fetch all settings
      const data = await companySettingsApi.getAll(filter);
      setSettings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch company settings');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleCreate = () => {
    if (!canEdit) return;
    setSelectedSettings(null);
    setIsModalOpen(true);
  };

  const handleEdit = (companySettings: CompanySettings) => {
    if (!canEdit || companySettings.status !== ApprovalStatus.DRAFT) return;
    setSelectedSettings(companySettings);
    setIsModalOpen(true);
  };

  const handleEditAsNew = () => {
    if (!canEdit || !activeSettings) return;
    // Create new draft based on active settings
    setSelectedSettings({ ...activeSettings, _id: '', status: ApprovalStatus.DRAFT } as any);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (!confirm('Are you sure you want to delete this company settings draft?')) return;
    try {
      setActionLoading(id);
      await companySettingsApi.delete(id);
      await fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete company settings');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!isSystemAdmin) return;
    try {
      setActionLoading(id);
      await companySettingsApi.submit(id);
      await fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit company settings');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!canApprove) return;
    try {
      setActionLoading(id);
      await companySettingsApi.approve(id);
      await fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve company settings');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!canApprove) return;
    if (!confirm('Are you sure you want to reject this company settings?')) return;
    try {
      setActionLoading(id);
      await companySettingsApi.reject(id);
      await fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject company settings');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: ApprovalStatus, isActive: boolean = false) => {
    if (isActive) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusApproved}`} style={{ 
          background: '#059669', 
          color: 'white',
          fontWeight: 'bold',
        }}>
          ACTIVE
        </span>
      );
    }
    
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

  if (loading && settings.length === 0 && !activeSettings) {
    return <div className={styles.loading}>Loading company settings...</div>;
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>Company Settings</h2>
          <p className={styles.listSubtitle}>
            Manage payroll configuration including pay dates, timezone, and fiscal year
          </p>
        </div>
        {isSystemAdmin && (
          <Button variant="primary" onClick={handleCreate}>
            + Create Company Settings
          </Button>
        )}
      </div>

      {/* Active Settings Card */}
      {activeSettings && (
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✅ Active Company Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Pay Date</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{formatDate(activeSettings.payDate)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Timezone</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{activeSettings.timeZone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Currency</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{activeSettings.currency}</div>
                </div>
              </div>
            </div>
            {isSystemAdmin && (
              <Button 
                variant="secondary" 
                onClick={handleEditAsNew}
                style={{ 
                  background: 'white', 
                  color: '#059669',
                  border: 'none',
                }}
              >
                Edit as New Version
              </Button>
            )}
          </div>
        </div>
      )}

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
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pay Date</th>
              <th>Timezone</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No company settings found
                </td>
              </tr>
            ) : (
              settings.map((setting) => {
                const isActive = activeSettings?._id === setting._id;
                return (
                  <tr key={setting._id} style={isActive ? { background: '#f0fdf4' } : {}}>
                    <td>
                      <strong>{setting.payDate}</strong> of each month
                    </td>
                    <td>{setting.timeZone}</td>
                    <td>{setting.currency}</td>
                    <td>{getStatusBadge(setting.status, isActive)}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        {setting.status === ApprovalStatus.DRAFT && isSystemAdmin && (
                          <>
                            <button
                              className={`${styles.iconButton} ${styles.iconButtonEdit}`}
                              onClick={() => handleEdit(setting)}
                              title="Edit"
                              disabled={actionLoading === setting._id}
                            >
                              ✏️
                            </button>
                            <button
                              className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                              onClick={() => handleDelete(setting._id)}
                              title="Delete"
                              disabled={actionLoading === setting._id}
                            >
                              🗑️
                            </button>
                            <button
                              className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                              onClick={() => handleSubmit(setting._id)}
                              title="Submit for Approval"
                              disabled={actionLoading === setting._id}
                            >
                              📤
                            </button>
                          </>
                        )}
                        {setting.status === ApprovalStatus.DRAFT && canApprove && (
                          <>
                            <button
                              className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                              onClick={() => handleApprove(setting._id)}
                              title="Approve"
                              disabled={actionLoading === setting._id}
                            >
                              ✅
                            </button>
                            <button
                              className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                              onClick={() => handleReject(setting._id)}
                              title="Reject"
                              disabled={actionLoading === setting._id}
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {setting.status === ApprovalStatus.APPROVED && !isActive && (
                          <span style={{ color: '#059669', fontSize: '0.875rem' }}>
                            Approved {setting.approvedAt && `on ${formatDate(setting.approvedAt)}`}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <CompanySettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchSettings}
        companySettings={selectedSettings}
      />
    </div>
  );
}
