'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, Input } from '@/shared/components';
import { payrollrunApi } from '../../api/payrollExecutionAPI';
import { PayrollRuns, EmployeePayrollDetails, BankStatus, EditEmployeePayrollDetailDto } from '../../types';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';

export const FlagFixPage: React.FC = () => {
  const { user } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRuns[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeePayrollDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, EditEmployeePayrollDetailDto>>({});
  const [showEditForm, setShowEditForm] = useState<Record<string, boolean>>({});

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
      // Filter to show only runs with exceptions
      const runsWithExceptions = data.filter((run) => (run.exceptions || 0) > 0);
      setPayrollRuns(runsWithExceptions);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || error?.message || 'Failed to load payroll runs');
      setPayrollRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeDetails = async (runId: string) => {
    try {
      setLoadingDetails(true);
      setMessage(null);
      const details = await payrollrunApi.getEmployeePayrollDetails(runId);
      const detailsArray = Array.isArray(details) ? details : [details];
      // Filter to show only details with exceptions
      const detailsWithExceptions = detailsArray.filter(
        (detail) => detail.exceptions && detail.exceptions.trim() !== ''
      );
      setEmployeeDetails(detailsWithExceptions);
      setSelectedRunId(runId);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || error?.message || 'Failed to load employee details');
      setEmployeeDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleFix = async (detailId: string) => {
    const editDto = editData[detailId];
    if (!editDto || (!editDto.bankAccountNumber && editDto.netPay === undefined)) {
      setMessage('Please provide at least one field to fix (bank account number or net pay)');
      return;
    }

    setProcessingId(detailId);
    setMessage(null);
    try {
      await payrollrunApi.editEmployeePayrollDetail(detailId, editDto);
      setMessage('Exception fixed successfully');
      setShowEditForm({ ...showEditForm, [detailId]: false });
      setEditData({ ...editData, [detailId]: {} });
      
      // Reload employee details to reflect changes
      if (selectedRunId) {
        await loadEmployeeDetails(selectedRunId);
      }
      
      // Reload payroll runs to update exception counts
      await loadPayrollRuns();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fix exception';
      setMessage(errorMessage);
    } finally {
      setProcessingId(null);
    }
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
          You do not have permission to access this page. Only Payroll Managers can fix payroll exceptions.
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
          Fix Payroll Exceptions
        </div>
        <div style={{ color: '#475569' }}>
          Review and fix exceptions in employee payroll details. Select a payroll run to view employees with exceptions.
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

      <Card padding="md" shadow="md">
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Payroll Runs with Exceptions
        </h3>
        {payrollRuns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
            No payroll runs with exceptions found.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {payrollRuns.map((run) => (
              <div
                key={run._id}
                style={{
                  padding: 12,
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: selectedRunId === run._id ? '#f1f5f9' : 'white',
                }}
                onClick={() => loadEmployeeDetails(run._id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {run.runId || run._id} - {run.payrollPeriod}
                    </div>
                    <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                      Entity: {run.entity || 'N/A'} | Employees: {run.employees || 0} | Exceptions: {run.exceptions || 0}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadEmployeeDetails(run._id);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedRunId && (
        <Card padding="md" shadow="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              Employees with Exceptions ({employeeDetails.length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedRunId(null);
                setEmployeeDetails([]);
              }}
            >
              Close
            </Button>
          </div>

          {loadingDetails ? (
            <div style={{ textAlign: 'center', padding: 24 }}>Loading employee details...</div>
          ) : employeeDetails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
              No employees with exceptions found for this payroll run.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {employeeDetails.map((detail) => (
                <Card key={detail._id} padding="md" shadow="sm">
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                        Employee ID: {typeof detail.employeeId === 'object' && detail.employeeId !== null
                          ? (detail.employeeId as any).employeeNumber || (detail.employeeId as any).fullName || detail.employeeId
                          : detail.employeeId}
                      </div>
                      <div style={{ fontSize: 14, color: '#64748b' }}>
                        Net Pay: ${(detail.netPay || 0).toLocaleString()} | 
                        Bank Status: {detail.bankStatus === BankStatus.VALID ? 'Valid' : 'Missing'}
                      </div>
                    </div>

                    {detail.exceptions && (
                      <div
                        style={{
                          padding: 12,
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: 8,
                          color: '#dc2626',
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Exceptions:</div>
                        <div style={{ fontSize: 14 }}>{detail.exceptions}</div>
                      </div>
                    )}

                    {!showEditForm[detail._id] ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowEditForm({ ...showEditForm, [detail._id]: true });
                          setEditData({
                            ...editData,
                            [detail._id]: {
                              bankAccountNumber: '',
                              netPay: detail.netPay,
                            },
                          });
                        }}
                        disabled={processingId !== null}
                      >
                        Fix Exception
                      </Button>
                    ) : (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {detail.bankStatus === BankStatus.MISSING && (
                          <Input
                            label="Bank Account Number"
                            placeholder="Enter bank account number"
                            value={editData[detail._id]?.bankAccountNumber || ''}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                [detail._id]: {
                                  ...editData[detail._id],
                                  bankAccountNumber: e.target.value,
                                },
                              })
                            }
                            fullWidth
                          />
                        )}

                        {(detail.netPay || 0) < 6000 || (detail.netPay || 0) < 0 ? (
                          <Input
                            label="Net Pay (EGP)"
                            type="number"
                            min="6000"
                            step="0.01"
                            placeholder="Enter new net pay (minimum 6000)"
                            value={editData[detail._id]?.netPay?.toString() || ''}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                [detail._id]: {
                                  ...editData[detail._id],
                                  netPay: parseFloat(e.target.value) || undefined,
                                },
                              })
                            }
                            fullWidth
                          />
                        ) : null}

                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleFix(detail._id)}
                            isLoading={processingId === detail._id}
                            disabled={processingId !== null}
                          >
                            Save Fix
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowEditForm({ ...showEditForm, [detail._id]: false });
                              setEditData({ ...editData, [detail._id]: {} });
                            }}
                            disabled={processingId !== null}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

