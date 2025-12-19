'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './RecruitmentForms.module.css';

interface ClearanceTrackerProps {
    terminationId: string;
    onRefresh?: () => void;
}

export default function ClearanceTracker({ terminationId, onRefresh }: ClearanceTrackerProps) {
    const { user } = useAuth();
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCleared, setIsCleared] = useState(false);

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            const data = await recruitmentApi.getFullClearanceStatus(terminationId);
            setStatus(data);
            const cleared = await recruitmentApi.isEmployeeFullyCleared(terminationId);
            setIsCleared(cleared.isCleared);
        } catch (error: any) {
            console.error('Failed to fetch clearance status', error);
        } finally {
            setLoading(false);
        }
    }, [terminationId]);

    useEffect(() => {
        fetchStatus();
    }, [terminationId, fetchStatus]);

    const handleUpdateStatus = async (department: string, newStatus: 'approved' | 'rejected') => {
        try {
            await recruitmentApi.updateClearanceStatus(
                terminationId,
                department,
                newStatus,
                user?.userid || 'system',
                `Marked as ${newStatus} by HR`
            );
            alert(`${department} clearance marked as ${newStatus}`);
            fetchStatus();
            if (onRefresh) onRefresh();
        } catch (e) {
            alert('Failed to update clearance');
        }
    };

    if (loading) return <div>Loading clearance status...</div>;
    if (!status) return <div>No clearance data found</div>;

    const departments = status.departments || status.clearances || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3>Clearance Tracker</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Termination ID: {terminationId}</p>
                    </div>
                    <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: isCleared ? '#dcfce7' : '#fef3c7',
                        color: isCleared ? '#166534' : '#92400e',
                        fontWeight: 500
                    }}>
                        {isCleared ? '✓ Fully Cleared' : '⏳ Pending Clearance'}
                    </div>
                </div>
            </Card>

            <Card padding="md">
                <h4 style={{ marginBottom: '1rem' }}>Department Clearances</h4>
                {departments.length === 0 ? (
                    <p style={{ color: '#666' }}>No department clearances configured</p>
                ) : (
                    departments.map((dept: any) => (
                        <div key={dept.name || dept.department} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <div>
                                <span style={{ fontWeight: 500 }}>{dept.name || dept.department}</span>
                                {dept.updatedAt && (
                                    <p style={{ fontSize: '0.75rem', color: '#888' }}>
                                        Updated: {new Date(dept.updatedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        background: dept.status === 'approved' ? '#dcfce7' : dept.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                                        color: dept.status === 'approved' ? '#166534' : dept.status === 'rejected' ? '#991b1b' : '#4b5563'
                                    }}
                                >
                                    {(dept.status || 'pending').toUpperCase()}
                                </span>
                                {dept.status !== 'approved' && (
                                    <>
                                        <Button size="sm" variant="success" onClick={() => handleUpdateStatus(dept.name || dept.department, 'approved')}>
                                            Approve
                                        </Button>
                                        <Button size="sm" variant="error" onClick={() => handleUpdateStatus(dept.name || dept.department, 'rejected')}>
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </Card>

            {status.comments && (
                <Card padding="md">
                    <h4>Comments</h4>
                    <p style={{ color: '#666' }}>{status.comments}</p>
                </Card>
            )}
        </div>
    );
}
