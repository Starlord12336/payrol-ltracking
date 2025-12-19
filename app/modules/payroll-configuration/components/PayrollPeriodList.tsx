/**
 * ========================== MOHAMMED EMAD ==========================
 * PayrollPeriodList Component - Frontend-Only Workflow
 *
 * Implements the Payroll Period Approval – Frontend-Only Workflow:
 * - REQ-PY-24: Review Payroll period (Approve or Reject)
 * - REQ-PY-26: Edit payroll initiation (period) if rejected
 *
 * This is a FRONTEND-ONLY workflow:
 * - Period data is generated on the frontend based on current date
 * - Approval state is managed in React state (with localStorage persistence)
 * - NO backend storage for payroll periods
 * - Only status values: draft, approved, rejected (NO pending_approval)
 *
 * Workflow:
 * 1. System auto-generates current payroll period (month/year based on today)
 * 2. User reviews the displayed period
 * 3. User must explicitly choose "Approve Period" or "Reject Period"
 * 4. If rejected, user can edit dates and re-review
 * 5. If approved, "Initiate Payroll Run" button becomes enabled
 * 6. When clicked, initiates payroll run creation (via payroll-execution)
 *
 * Author: Mohammed Emad
 * ========================== MOHAMMED EMAD ==========================
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import type {
  PayrollPeriod,
  PayrollPeriodStatus,
  PayrollPeriodWorkflowState,
} from '../types';
import {
  INITIAL_WORKFLOW_STATE,
  PAYROLL_PERIOD_STORAGE_KEY,
} from '../types';
import styles from '../page.module.css';

interface PayrollPeriodListProps {
  userRole?: string;
}

/**
 * Get the number of working days in a month (excluding weekends)
 */
const getWorkingDaysInMonth = (year: number, month: number): number => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
};

/**
 * Generate a payroll period for the current month
 */
const generateCurrentPeriod = (): PayrollPeriod => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const paymentDate = new Date(year, month, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return {
    id: `period-${year}-${month}`,
    name: `${monthNames[month - 1]} ${year} Payroll`,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    paymentDate: paymentDate.toISOString(),
    year,
    month,
    status: 'draft' as PayrollPeriodStatus,
    currency: 'EGP',
    workingDays: getWorkingDaysInMonth(year, month),
  };
};

/**
 * Format a date string for display
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get month name from month number
 */
const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] || `Month ${month}`;
};

/**
 * Load workflow state from localStorage
 */
const loadWorkflowState = (): PayrollPeriodWorkflowState => {
  if (typeof window === 'undefined') {
    return INITIAL_WORKFLOW_STATE;
  }
  try {
    const stored = localStorage.getItem(PAYROLL_PERIOD_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if the stored period is for the current month
      const currentPeriod = generateCurrentPeriod();
      if (
        parsed.currentPeriod &&
        parsed.currentPeriod.year === currentPeriod.year &&
        parsed.currentPeriod.month === currentPeriod.month
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load workflow state from localStorage:', error);
  }
  return INITIAL_WORKFLOW_STATE;
};

/**
 * Save workflow state to localStorage
 */
const saveWorkflowState = (state: PayrollPeriodWorkflowState): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PAYROLL_PERIOD_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save workflow state to localStorage:', error);
  }
};

const PayrollPeriodList: React.FC<PayrollPeriodListProps> = ({ userRole }) => {
  const { user } = useAuth();

  // Workflow state (persisted to localStorage)
  const [workflowState, setWorkflowState] = useState<PayrollPeriodWorkflowState>(
    INITIAL_WORKFLOW_STATE
  );

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Editable period fields
  const [editableStartDate, setEditableStartDate] = useState('');
  const [editableEndDate, setEditableEndDate] = useState('');
  const [editablePaymentDate, setEditablePaymentDate] = useState('');

  // Role-based permissions
  const isPayrollManager = userRole === SystemRole.PAYROLL_MANAGER;
  const isPayrollSpecialist = userRole === SystemRole.PAYROLL_SPECIALIST;
  const isSystemAdmin = userRole === SystemRole.SYSTEM_ADMIN;
  const canApprove = isPayrollManager || isPayrollSpecialist || isSystemAdmin;
  const canInitiatePayrollRun = isPayrollManager || isPayrollSpecialist || isSystemAdmin;

  /**
   * Initialize workflow state on mount
   */
  useEffect(() => {
    const loadedState = loadWorkflowState();
    if (loadedState.currentPeriod) {
      setWorkflowState(loadedState);
      setEditableStartDate(loadedState.currentPeriod.startDate.split('T')[0]);
      setEditableEndDate(loadedState.currentPeriod.endDate.split('T')[0]);
      setEditablePaymentDate(loadedState.currentPeriod.paymentDate.split('T')[0]);
    } else {
      // Generate a new period for current month
      const newPeriod = generateCurrentPeriod();
      const newState: PayrollPeriodWorkflowState = {
        ...INITIAL_WORKFLOW_STATE,
        currentPeriod: newPeriod,
      };
      setWorkflowState(newState);
      saveWorkflowState(newState);
      setEditableStartDate(newPeriod.startDate.split('T')[0]);
      setEditableEndDate(newPeriod.endDate.split('T')[0]);
      setEditablePaymentDate(newPeriod.paymentDate.split('T')[0]);
    }
  }, []);

  /**
   * Update workflow state and persist to localStorage
   */
  const updateWorkflowState = useCallback(
    (updates: Partial<PayrollPeriodWorkflowState>) => {
      setWorkflowState((prev) => {
        const newState = { ...prev, ...updates };
        saveWorkflowState(newState);
        return newState;
      });
    },
    []
  );

  /**
   * Handle period approval (Frontend-Only)
   * REQ-PY-24: Review Payroll period (Approve)
   */
  const handleApprove = () => {
    if (!workflowState.currentPeriod || !user?.userid) return;

    const now = new Date().toISOString();
    const approvedPeriod: PayrollPeriod = {
      ...workflowState.currentPeriod,
      status: 'approved' as PayrollPeriodStatus,
      approvedBy: user.userid,
      approvedAt: now,
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
    };

    updateWorkflowState({
      currentPeriod: approvedPeriod,
      isApproved: true,
      isRejected: false,
      canCreatePayrollRun: true,
      approvedBy: user.userid,
      approvedAt: now,
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
    });

    alert(`Period "${approvedPeriod.name}" has been approved. You can now initiate a payroll run.`);
  };

  /**
   * Handle period rejection (Frontend-Only)
   * REQ-PY-24: Review Payroll period (Reject)
   */
  const handleReject = () => {
    if (!workflowState.currentPeriod || !user?.userid || !rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    const now = new Date().toISOString();
    const rejectedPeriod: PayrollPeriod = {
      ...workflowState.currentPeriod,
      status: 'rejected' as PayrollPeriodStatus,
      rejectedBy: user.userid,
      rejectedAt: now,
      rejectionReason: rejectionReason.trim(),
      approvedBy: undefined,
      approvedAt: undefined,
    };

    updateWorkflowState({
      currentPeriod: rejectedPeriod,
      isApproved: false,
      isRejected: true,
      canCreatePayrollRun: false,
      rejectedBy: user.userid,
      rejectedAt: now,
      rejectionReason: rejectionReason.trim(),
      approvedBy: undefined,
      approvedAt: undefined,
    });

    setShowRejectionModal(false);
    setRejectionReason('');
    setIsEditing(true);

    alert(`Period has been rejected. Please edit the dates and re-submit for approval.`);
  };

  /**
   * Handle saving edited period
   * REQ-PY-26: Edit payroll initiation (period) if rejected
   */
  const handleSaveEdit = () => {
    if (!workflowState.currentPeriod) return;

    const startDate = new Date(editableStartDate);
    const endDate = new Date(editableEndDate);
    const paymentDate = new Date(editablePaymentDate);

    // Validate dates
    if (startDate >= endDate) {
      alert('Start date must be before end date.');
      return;
    }
    if (paymentDate < endDate) {
      alert('Payment date should be on or after the period end date.');
      return;
    }

    // Calculate working days for the new date range
    let workingDays = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const updatedPeriod: PayrollPeriod = {
      ...workflowState.currentPeriod,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      paymentDate: paymentDate.toISOString(),
      workingDays,
      status: 'draft' as PayrollPeriodStatus,
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
    };

    updateWorkflowState({
      currentPeriod: updatedPeriod,
      isApproved: false,
      isRejected: false,
      canCreatePayrollRun: false,
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
    });

    setIsEditing(false);
    alert('Period updated. Please review and approve.');
  };

  /**
   * Handle initiating payroll run
   * This will eventually call payroll-execution API
   */
  const handleInitiatePayrollRun = async () => {
    if (!workflowState.currentPeriod || !workflowState.isApproved) {
      alert('Period must be approved before initiating a payroll run.');
      return;
    }

    setActionLoading(true);
    try {
      // TODO: Call payroll-execution API to create payroll run
      // For now, just show a success message
      alert(
        `Payroll run initiated for "${workflowState.currentPeriod.name}".\n\n` +
        `Period: ${formatDate(workflowState.currentPeriod.startDate)} - ${formatDate(workflowState.currentPeriod.endDate)}\n` +
        `Working Days: ${workflowState.currentPeriod.workingDays}\n` +
        `Payment Date: ${formatDate(workflowState.currentPeriod.paymentDate)}\n\n` +
        `Note: This will be handled by the payroll-execution subsystem.`
      );
    } catch (error: any) {
      alert(error.message || 'Failed to initiate payroll run.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Reset period to generate a new one for current month
   */
  const handleResetPeriod = () => {
    if (!confirm('This will reset the current period. Are you sure?')) return;

    const newPeriod = generateCurrentPeriod();
    const newState: PayrollPeriodWorkflowState = {
      ...INITIAL_WORKFLOW_STATE,
      currentPeriod: newPeriod,
    };
    setWorkflowState(newState);
    saveWorkflowState(newState);
    setEditableStartDate(newPeriod.startDate.split('T')[0]);
    setEditableEndDate(newPeriod.endDate.split('T')[0]);
    setEditablePaymentDate(newPeriod.paymentDate.split('T')[0]);
    setIsEditing(false);
  };

  const { currentPeriod, isApproved, isRejected, canCreatePayrollRun } = workflowState;

  if (!currentPeriod) {
    return <div className={styles.loading}>Loading payroll period...</div>;
  }

  const statusBadgeClass = isApproved
    ? styles.statusApproved
    : isRejected
    ? styles.statusRejected
    : styles.statusDraft;

  return (
    <div className={styles.payrollPeriodContainer}>
      <div className={styles.sectionHeader}>
        <h2>Payroll Period Approval</h2>
        <p className={styles.sectionDescription}>
          Review and approve the current payroll period before initiating a payroll run.
          This is a frontend-only workflow - approval state is managed locally.
        </p>
      </div>

      {/* Current Period Card */}
      <div className={styles.periodCard}>
        <div className={styles.periodCardHeader}>
          <h3>{currentPeriod.name}</h3>
          <span className={`${styles.statusBadge} ${statusBadgeClass}`}>
            {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Draft'}
          </span>
        </div>

        <div className={styles.periodDetails}>
          {isEditing ? (
            /* Editable Form */
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={editableStartDate}
                  onChange={(e) => setEditableStartDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Date</label>
                <input
                  type="date"
                  value={editableEndDate}
                  onChange={(e) => setEditableEndDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Payment Date</label>
                <input
                  type="date"
                  value={editablePaymentDate}
                  onChange={(e) => setEditablePaymentDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.editActions}>
                <Button onClick={handleSaveEdit} variant="primary">
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* Display Mode */
            <>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Period:</span>
                <span className={styles.detailValue}>
                  {formatDate(currentPeriod.startDate)} - {formatDate(currentPeriod.endDate)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Month/Year:</span>
                <span className={styles.detailValue}>
                  {getMonthName(currentPeriod.month)} {currentPeriod.year}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Working Days:</span>
                <span className={styles.detailValue}>{currentPeriod.workingDays}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Payment Date:</span>
                <span className={styles.detailValue}>{formatDate(currentPeriod.paymentDate)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Currency:</span>
                <span className={styles.detailValue}>{currentPeriod.currency}</span>
              </div>

              {/* Approval Info */}
              {isApproved && workflowState.approvedAt && (
                <div className={styles.approvalInfo}>
                  <span className={styles.approvalLabel}>Approved:</span>
                  <span className={styles.approvalValue}>
                    {formatDate(workflowState.approvedAt)}
                  </span>
                </div>
              )}

              {/* Rejection Info */}
              {isRejected && workflowState.rejectionReason && (
                <div className={styles.rejectionInfo}>
                  <span className={styles.rejectionLabel}>Rejection Reason:</span>
                  <span className={styles.rejectionValue}>
                    {workflowState.rejectionReason}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className={styles.periodActions}>
            {/* Draft Status - Show Approve/Reject buttons */}
            {!isApproved && !isRejected && canApprove && (
              <>
                <Button onClick={handleApprove} variant="primary">
                  Approve Period
                </Button>
                <Button
                  onClick={() => setShowRejectionModal(true)}
                  variant="error"
                >
                  Reject Period
                </Button>
              </>
            )}

            {/* Rejected Status - Show Edit button */}
            {isRejected && (
              <Button onClick={() => setIsEditing(true)} variant="secondary">
                Edit Period
              </Button>
            )}

            {/* Approved Status - Show Initiate Payroll Run button */}
            {isApproved && canInitiatePayrollRun && (
              <Button
                onClick={handleInitiatePayrollRun}
                variant="primary"
                disabled={actionLoading}
              >
                {actionLoading ? 'Initiating...' : 'Initiate Payroll Run'}
              </Button>
            )}

            {/* Reset button (always available) */}
            <Button onClick={handleResetPeriod} variant="ghost">
              Reset Period
            </Button>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Reject Payroll Period</h3>
            <p>Please provide a reason for rejecting this period.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className={styles.rejectionTextarea}
              rows={4}
            />
            <div className={styles.modalActions}>
              <Button onClick={handleReject} variant="error">
                Confirm Rejection
              </Button>
              <Button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Info */}
      <div className={styles.workflowInfo}>
        <h4>Workflow Information</h4>
        <ul>
          <li>
            <strong>Status:</strong>{' '}
            {isApproved ? 'Approved ✓' : isRejected ? 'Rejected ✗' : 'Draft (Pending Review)'}
          </li>
          <li>
            <strong>Can Initiate Payroll Run:</strong> {canCreatePayrollRun ? 'Yes' : 'No'}
          </li>
          <li>
            <strong>Note:</strong> This is a frontend-only workflow. Approval state is stored
            locally and will be sent with the payroll run creation request.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PayrollPeriodList;
