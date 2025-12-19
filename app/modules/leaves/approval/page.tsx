'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import styles from '../leaves.module.css';
import { useLeaves } from '../contexts/LeavesContext';
import { LeaveFilterBar } from '../components/LeaveFilterBar';
import { leavesApi } from '../api/leavesApi';

export default function LeaveApprovalPage() {
    console.log('LeaveApprovalPage rendered');
    const { pendingApprovals, updateRequestStatus, fetchPendingApprovals } = useLeaves();
    console.log('Pending approvals from context:', pendingApprovals);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('Pending');
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch pending approvals on mount
    useEffect(() => {
        const loadPendingApprovals = async () => {
            console.log('Loading pending approvals...');
            setLoading(true);
            try {
                await fetchPendingApprovals();
                setError(null);
            } catch (error: any) {
                console.error('Failed to load pending approvals:', error);
                setError(error?.response?.data?.message || 'Failed to load pending approvals');
            } finally {
                setLoading(false);
            }
        };
        loadPendingApprovals();
    }, [fetchPendingApprovals]);

    // Filter requests
    const filteredRequests = pendingApprovals.filter(r => {
        // Basic filtering for now, ideally backend filtered
        if (filterStatus && r.status !== filterStatus) return false;
        return true;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredRequests.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleBulkAction = async (action: 'approve' | 'reject') => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} requests?`)) return;

        setLoading(true);
        try {
            await leavesApi.bulkProcessRequests({
                requestIds: selectedIds,
                action: action,
                comments: `Bulk ${action} via Manager Portal`
            });

            // Refresh pending approvals after bulk action
            await fetchPendingApprovals();
            setSelectedIds([]);
            setError(null); // Clear any previous errors
        } catch (error: any) {
            console.error('Bulk action failed:', error);
            setError(error?.response?.data?.message || 'Failed to process bulk action');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className={styles.sectionTitle}>Pending Approvals</h2>

            {error && (
                <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-md)',
                    color: '#991b1b',
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <Button
                    variant="outline"
                    onClick={async () => {
                        setLoading(true);
                        try {
                            await fetchPendingApprovals();
                            setError(null);
                        } catch (error: any) {
                            setError('Failed to refresh approvals');
                        } finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Approvals'}
                </Button>
            </div>

            {loading ? (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                }}>
                    Loading pending approvals...
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="checkbox"
                                checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                                onChange={handleSelectAll}
                                style={{ width: '1.25rem', height: '1.25rem' }}
                            />
                            <span>{selectedIds.length} items selected</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                                variant="primary"
                                disabled={selectedIds.length === 0}
                                onClick={() => handleBulkAction('approve')}
                            >
                                Approve Selected
                            </Button>
                            <Button
                                variant="outline"
                                disabled={selectedIds.length === 0}
                                onClick={() => handleBulkAction('reject')}
                                style={{ color: '#dc2626', borderColor: '#fecaca' }}
                            >
                                Reject Selected
                            </Button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredRequests.map(req => (
                            <Card key={req.id}>
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(req.id)}
                                        onChange={() => handleSelectOne(req.id)}
                                        style={{ marginTop: '0.25rem', width: '1.1rem', height: '1.1rem' }}
                                    />

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{req.employeeName}</h3>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                    {req.leaveTypeName}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                                                    {req.days} Days
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {req.justification && (
                                            <div style={{
                                                fontSize: '0.875rem',
                                                backgroundColor: 'var(--bg-tertiary)',
                                                padding: '0.5rem',
                                                borderRadius: 'var(--radius-sm)',
                                                marginBottom: '1rem'
                                            }}>
                                                <strong>Reason:</strong> {req.justification}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                isLoading={processingId === req.id}
                                                onClick={async () => {
                                                    setProcessingId(req.id);
                                                    setError(null);
                                                    try {
                                                        await updateRequestStatus(req.id, 'Rejected' as any);
                                                        // Request should disappear due to status filter
                                                    } catch (err: any) {
                                                        setError(err.message || 'Failed to reject request');
                                                    } finally {
                                                        setProcessingId(null);
                                                    }
                                                }}
                                                style={{ color: '#dc2626' }}
                                                disabled={!!processingId}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                isLoading={processingId === req.id}
                                                onClick={async () => {
                                                    setProcessingId(req.id);
                                                    setError(null);
                                                    try {
                                                        await updateRequestStatus(req.id, 'Approved' as any);
                                                        // Request should disappear due to status filter
                                                    } catch (err: any) {
                                                        setError(err.message || 'Failed to approve request');
                                                    } finally {
                                                        setProcessingId(null);
                                                    }
                                                }}
                                                disabled={!!processingId}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                </>
            )}
        </div>
    );
}
