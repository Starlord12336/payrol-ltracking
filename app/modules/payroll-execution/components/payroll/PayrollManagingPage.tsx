'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/components';
import { PayrollItem } from './PayrollItem';
import { payrollrunApi } from '../../api/payrollExecutionAPI';
import { PayrollRuns, PayRollStatus, ApprovePayrollDto } from '../../types';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';

export const PayrollManagingPage: React.FC = () => {
  const { user } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRuns[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [unfreezeReason, setUnfreezeReason] = useState<Record<string, string>>({});
  const [showUnfreezeInput, setShowUnfreezeInput] = useState<Record<string, boolean>>({});
  const [approveComments, setApproveComments] = useState<Record<string, string>>({});
  const [showApproveInput, setShowApproveInput] = useState<Record<string, boolean>>({});

  // Check if user has Payroll Manager role
  const userRoles = user?.roles || [];
  const hasPayrollManagerRole = userRoles.includes(SystemRole.PAYROLL_MANAGER);

  useEffect(() => {
    if (hasPayrollManagerRole) {
      loadPayrollRuns();
    }
  }, [hasPayrollManagerRole]);

  const loadPayrollRuns = async () => {
    try {
      setLoading(true);
      const data = await payrollrunApi.getPayrollRuns();
      // Filter to show only runs that can be managed (under review, approved, locked, unlocked, pending finance approval)
      const manageableRuns = data.filter(
        (run) =>
          run.status === PayRollStatus.UNDER_REVIEW ||
          run.status === PayRollStatus.APPROVED ||
          run.status === PayRollStatus.LOCKED ||
          run.status === PayRollStatus.UNLOCKED ||
          run.status === PayRollStatus.PENDING_FINANCE_APPROVAL
      );
      setPayrollRuns(manageableRuns);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || error?.message || 'Failed to load payroll runs');
      setPayrollRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async (id: string) => {
    if (!user?.userid) {
      setMessage('User not authenticated. Please log in again.');
      return;
    }

    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.freezePayroll(id, user.userid);
      await loadPayrollRuns();
      setMessage('Payroll frozen successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to freeze payroll';
      setMessage(errorMessage);
      await loadPayrollRuns(); // Reload even on error to show current state
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnfreeze = async (id: string) => {
    if (!user?.userid) {
      setMessage('User not authenticated. Please log in again.');
      return;
    }

    if (!unfreezeReason[id]?.trim()) {
      setMessage('Please provide a reason for unfreezing');
      return;
    }

    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.unfreezePayroll(id, {
        managerId: user.userid,
        unlockReason: unfreezeReason[id],
      });
      setUnfreezeReason({ ...unfreezeReason, [id]: '' });
      setShowUnfreezeInput({ ...showUnfreezeInput, [id]: false });
      await loadPayrollRuns();
      setMessage('Payroll unfrozen successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to unfreeze payroll';
      setMessage(errorMessage);
      await loadPayrollRuns(); // Reload even on error to show current state
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user?.userid) {
      setMessage('User not authenticated. Please log in again.');
      return;
    }

    setProcessingId(id);
    setMessage(null);
    try {
      const approveDto: ApprovePayrollDto = {
        approverId: user.userid,
        comments: approveComments[id]?.trim() || undefined,
      };
      await payrollrunApi.approveByManager(id, approveDto);
      setApproveComments({ ...approveComments, [id]: '' });
      setShowApproveInput({ ...showApproveInput, [id]: false });
      await loadPayrollRuns();
      setMessage('Payroll approved successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to approve payroll';
      setMessage(errorMessage);
      await loadPayrollRuns(); // Reload even on error to show current state
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusDisplay = (status: PayRollStatus): string => {
    if (status === PayRollStatus.UNDER_REVIEW) {
      return 'Under Review';
    }
    if (status === PayRollStatus.APPROVED) {
      return 'Approved';
    }
    if (status === PayRollStatus.LOCKED) {
      return 'Locked';
    }
    if (status === PayRollStatus.UNLOCKED) {
      return 'Unlocked';
    }
    if (status === PayRollStatus.PENDING_FINANCE_APPROVAL) {
      return 'Pending Finance Approval';
    }
    return status; // Return the status as-is for any other values
  };

  const isFrozen = (status: PayRollStatus): boolean => {
    return status === PayRollStatus.LOCKED;
  };

  const canFreeze = (status: PayRollStatus): boolean => {
    // Manager can freeze at any time except when already frozen (LOCKED)
    return status !== PayRollStatus.LOCKED;
  };

  const canApprove = (status: PayRollStatus): boolean => {
    return status === PayRollStatus.UNDER_REVIEW;
  };

  // Early return if user doesn't have the required role
  if (!hasPayrollManagerRole) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: 'center',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          color: '#dc2626',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Access Denied</h2>
        <p style={{ fontSize: 16 }}>
          You do not have permission to access this page. Only Payroll Managers can manage payroll runs.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading payroll runs...</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Payroll Management
        </div>
        <div style={{ color: '#475569' }}>
          Freeze, unfreeze, and approve payroll runs. Only payroll runs under review or approved can be managed.
        </div>
      </div>

      {message && (
        <div
          style={{
            color: message.includes('success') ? '#047857' : '#dc2626',
            background: message.includes('success') ? '#ecfdf3' : '#fef2f2',
            border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`,
            padding: 12,
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}

      {payrollRuns.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
          No manageable payroll runs found. Payroll runs must be under review or approved to be managed.
        </div>
      )}

      {payrollRuns.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Payroll Runs ({payrollRuns.length})
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {payrollRuns.map((run) => (
              <PayrollItem
                key={run._id}
                title={`${run.runId || run._id} - ${run.payrollPeriod}`}
                subtitle={`Entity: ${run.entity || 'N/A'} | Employees: ${run.employees || 0} | Exceptions: ${run.exceptions || 0}`}
                amountLabel={`Total Net Pay: $${(run.totalnetpay || 0).toLocaleString()}`}
                status={getStatusDisplay(run.status)}
                actions={
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* Freeze/Unfreeze Button */}
                    {!showUnfreezeInput[run._id] && !showApproveInput[run._id] && (
                      <>
                        {isFrozen(run.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowUnfreezeInput({ ...showUnfreezeInput, [run._id]: true })
                            }
                            disabled={processingId !== null}
                          >
                            Unfreeze
                          </Button>
                        ) : canFreeze(run.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFreeze(run._id)}
                            isLoading={processingId === run._id}
                            disabled={processingId !== null}
                          >
                            Freeze
                          </Button>
                        ) : null}

                        {/* Approve Button */}
                        {canApprove(run.status) && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setShowApproveInput({ ...showApproveInput, [run._id]: true });
                              setApproveComments({ ...approveComments, [run._id]: '' });
                            }}
                            disabled={processingId !== null}
                          >
                            Approve
                          </Button>
                        )}
                      </>
                    )}

                    {/* Unfreeze Input */}
                    {showUnfreezeInput[run._id] && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 300 }}>
                        <textarea
                          placeholder="Enter reason for unfreezing..."
                          value={unfreezeReason[run._id] || ''}
                          onChange={(e) =>
                            setUnfreezeReason({ ...unfreezeReason, [run._id]: e.target.value })
                          }
                          style={{
                            padding: 8,
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            minHeight: 60,
                            resize: 'vertical',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnfreeze(run._id)}
                            isLoading={processingId === run._id}
                            disabled={processingId !== null}
                          >
                            Confirm Unfreeze
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowUnfreezeInput({ ...showUnfreezeInput, [run._id]: false });
                              setUnfreezeReason({ ...unfreezeReason, [run._id]: '' });
                            }}
                            disabled={processingId !== null}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Approve Input */}
                    {showApproveInput[run._id] && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 300 }}>
                        <textarea
                          placeholder="Optional comments for approval..."
                          value={approveComments[run._id] || ''}
                          onChange={(e) =>
                            setApproveComments({ ...approveComments, [run._id]: e.target.value })
                          }
                          style={{
                            padding: 8,
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            minHeight: 60,
                            resize: 'vertical',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(run._id)}
                            isLoading={processingId === run._id}
                            disabled={processingId !== null}
                          >
                            Confirm Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowApproveInput({ ...showApproveInput, [run._id]: false });
                              setApproveComments({ ...approveComments, [run._id]: '' });
                            }}
                            disabled={processingId !== null}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                }
                footer={
                  <div style={{ display: 'grid', gap: 4, fontSize: 14 }}>
                    {run.managerApprovalDate && (
                      <div>Manager Approved: {new Date(run.managerApprovalDate).toLocaleDateString()}</div>
                    )}
                    {run.unlockReason && (
                      <div style={{ color: '#64748b' }}>Unlock Reason: {run.unlockReason}</div>
                    )}
                    {run.status === PayRollStatus.UNDER_REVIEW && (
                      <div style={{ marginTop: 4, color: '#c2410c' }}>Awaiting manager approval</div>
                    )}
                    {run.status === PayRollStatus.LOCKED && (
                      <div style={{ marginTop: 4, color: '#4338ca' }}>Payroll is frozen</div>
                    )}
                    {run.status === PayRollStatus.PENDING_FINANCE_APPROVAL && (
                      <div style={{ marginTop: 4, color: '#059669' }}>Approved by manager - Pending finance approval</div>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

