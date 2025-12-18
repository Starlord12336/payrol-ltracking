'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/components';
import { PayrollItem } from './PayrollItem';
import { payrollrunApi } from '../../api/payrollExecutionAPI';
import { EmployeeTerminationResignation, BenefitReviewAction, BenefitStatus } from '../../types';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';

export const TerminationBenefitsListPage: React.FC = () => {
  const { user } = useAuth();
  const [benefits, setBenefits] = useState<EmployeeTerminationResignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});
  const [editAmount, setEditAmount] = useState<Record<string, string>>({});
  const [showEditInput, setShowEditInput] = useState<Record<string, boolean>>({});

  // Check if user has Payroll Specialist role
  const userRoles = user?.roles || [];
  const hasPayrollSpecialistRole = userRoles.includes(SystemRole.PAYROLL_SPECIALIST);

  useEffect(() => {
    if (hasPayrollSpecialistRole) {
      loadBenefits();
    }
  }, [hasPayrollSpecialistRole]);

  const loadBenefits = async () => {
    try {
      setLoading(true);
      const data = await payrollrunApi.getAllTerminationBenefits();
      setBenefits(data);
    } catch (error: any) {
      setMessage(error?.message || 'Failed to load termination benefits');
      // Fallback to empty array if API fails
      setBenefits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.reviewTerminationBenefit(id, {
        reviewerId: user?.userid || 'demo-reviewer',
        action: BenefitReviewAction.APPROVE,
      });
      await loadBenefits();
      setMessage('Termination benefit approved successfully');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to approve termination benefit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason[id]?.trim()) {
      setMessage('Please provide a rejection reason');
      return;
    }

    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.reviewTerminationBenefit(id, {
        reviewerId: user?.userid || 'demo-reviewer',
        action: BenefitReviewAction.REJECT,
        rejectionReason: rejectReason[id],
      });
      await loadBenefits();
      setMessage('Termination benefit rejected successfully');
      setRejectReason({ ...rejectReason, [id]: '' });
      setShowRejectInput({ ...showRejectInput, [id]: false });
    } catch (error: any) {
      setMessage(error?.message || 'Failed to reject termination benefit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditAmount = async (id: string) => {
    const amountValue = parseFloat(editAmount[id]);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setMessage('Please enter a valid benefit amount greater than 0');
      return;
    }

    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.editTerminationBenefitAmount(id, amountValue);
      await loadBenefits();
      setMessage('Termination benefit amount updated successfully');
      setShowEditInput({ ...showEditInput, [id]: false });
    } catch (error: any) {
      setMessage(error?.message || 'Failed to update termination benefit amount');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusDisplay = (status: BenefitStatus): 'Pending' | 'Approved' => {
    if (status === BenefitStatus.APPROVED || status === BenefitStatus.PAID) {
      return 'Approved';
    }
    return 'Pending';
  };

  // Early return if user doesn't have the required role
  if (!hasPayrollSpecialistRole) {
    return (
      <div style={{ 
        padding: 48, 
        textAlign: 'center',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 8,
        color: '#dc2626'
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ fontSize: 16 }}>
          You do not have permission to access this page. Only Payroll Specialists can view termination benefits.
        </p>
      </div>
    );
  }

  const pendingBenefits = benefits.filter(
    (b) => b.status === BenefitStatus.PENDING
  );
  const approvedBenefits = benefits.filter(
    (b) => b.status === BenefitStatus.APPROVED || b.status === BenefitStatus.PAID
  );
  const rejectedBenefits = benefits.filter(
    (b) => b.status === BenefitStatus.REJECTED
  );

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading termination benefits...</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Termination Benefits
        </div>
        <div style={{ color: '#475569' }}>
          Review and approve or reject termination and resignation benefits for employees.
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

      {pendingBenefits.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Pending Approval ({pendingBenefits.length})
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {pendingBenefits.map((benefit) => (
              <PayrollItem
                key={benefit._id}
                title={`Employee ID: ${benefit.employeeId}`}
                subtitle={`${benefit.terminationType.charAt(0).toUpperCase() + benefit.terminationType.slice(1)} - Termination Benefits`}
                amountLabel={`$${(benefit.givenAmount ?? 0).toLocaleString()}`}
                status={getStatusDisplay(benefit.status)}
                actions={
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {!showRejectInput[benefit._id] && !showEditInput[benefit._id] && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(benefit._id)}
                          isLoading={processingId === benefit._id}
                          disabled={processingId !== null}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="error"
                          onClick={() =>
                            setShowRejectInput({ ...showRejectInput, [benefit._id]: true })
                          }
                          disabled={processingId !== null}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowEditInput({ ...showEditInput, [benefit._id]: true });
                            setEditAmount({
                              ...editAmount,
                              [benefit._id]: String(benefit.givenAmount ?? 0),
                            });
                          }}
                          disabled={processingId !== null}
                        >
                          Edit Amount
                        </Button>
                      </>
                    )}

                    {showRejectInput[benefit._id] && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 300 }}>
                        <textarea
                          placeholder="Enter rejection reason..."
                          value={rejectReason[benefit._id] || ''}
                          onChange={(e) =>
                            setRejectReason({ ...rejectReason, [benefit._id]: e.target.value })
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
                            variant="error"
                            onClick={() => handleReject(benefit._id)}
                            isLoading={processingId === benefit._id}
                            disabled={processingId !== null}
                          >
                            Confirm Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowRejectInput({ ...showRejectInput, [benefit._id]: false });
                              setRejectReason({ ...rejectReason, [benefit._id]: '' });
                            }}
                            disabled={processingId !== null}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {showEditInput[benefit._id] && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editAmount[benefit._id] ?? ''}
                          onChange={(e) =>
                            setEditAmount({ ...editAmount, [benefit._id]: e.target.value })
                          }
                          style={{
                            padding: 8,
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleEditAmount(benefit._id)}
                            isLoading={processingId === benefit._id}
                            disabled={processingId !== null}
                          >
                            Save Amount
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowEditInput({ ...showEditInput, [benefit._id]: false });
                              setEditAmount({ ...editAmount, [benefit._id]: '' });
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
                    <div>Leave Encashment: ${benefit.leaveEncashment.toLocaleString()}</div>
                    <div>Severance Pay: ${benefit.severancePay.toLocaleString()}</div>
                    <div>End of Service Gratuity: ${benefit.endOfServiceGratuity.toLocaleString()}</div>
                    {benefit.status === BenefitStatus.PENDING && <div style={{ marginTop: 4 }}>Awaiting approval</div>}
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}

      {approvedBenefits.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Approved ({approvedBenefits.length})
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {approvedBenefits.map((benefit) => (
              <PayrollItem
                key={benefit._id}
                title={`Employee ID: ${benefit.employeeId}`}
                subtitle={`${benefit.terminationType.charAt(0).toUpperCase() + benefit.terminationType.slice(1)} - Termination Benefits`}
                amountLabel={`$${(benefit.givenAmount ?? 0).toLocaleString()}`}
                status="Approved"
                footer={
                  <div style={{ display: 'grid', gap: 4, fontSize: 14 }}>
                    <div>Leave Encashment: ${benefit.leaveEncashment.toLocaleString()}</div>
                    <div>Severance Pay: ${benefit.severancePay.toLocaleString()}</div>
                    <div>End of Service Gratuity: ${benefit.endOfServiceGratuity.toLocaleString()}</div>
                    {benefit.approvedAt && (
                      <div style={{ marginTop: 4 }}>
                        Approved on {new Date(benefit.approvedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}

      {rejectedBenefits.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Rejected ({rejectedBenefits.length})
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {rejectedBenefits.map((benefit) => (
              <PayrollItem
                key={benefit._id}
                title={`Employee ID: ${benefit.employeeId}`}
                subtitle={`${benefit.terminationType.charAt(0).toUpperCase() + benefit.terminationType.slice(1)} - Termination Benefits`}
                amountLabel={`$${(benefit.givenAmount ?? 0).toLocaleString()}`}
                status="Pending"
                footer={
                  <div style={{ display: 'grid', gap: 4, fontSize: 14 }}>
                    <div>Total Amount: ${benefit.givenAmount?.toLocaleString()}</div>
                    {benefit.rejectionReason && (
                      <div style={{ marginTop: 4, color: '#dc2626' }}>
                        Rejected: {benefit.rejectionReason}
                      </div>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}

      {benefits.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
          No termination benefits found.
        </div>
      )}
    </div>
  );
};

