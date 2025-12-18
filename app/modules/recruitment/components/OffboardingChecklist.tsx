'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { OffboardingChecklistSummary } from '../types';
import styles from './RecruitmentForms.module.css';

interface OffboardingChecklistProps {
    terminationId: string;
    onRefresh?: () => void;
}

export default function OffboardingChecklist({ terminationId, onRefresh }: OffboardingChecklistProps) {
    const [summary, setSummary] = useState<OffboardingChecklistSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [finalPay, setFinalPay] = useState<any>(null);

    useEffect(() => {
        fetchSummary();
    }, [terminationId]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const data = await recruitmentApi.getOffboardingChecklistSummary(terminationId);
            setSummary(data);
        } catch (error: any) {
            console.error('Failed to fetch offboarding summary', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeptApproval = async (dept: string, status: 'approved' | 'rejected') => {
        try {
            await recruitmentApi.updateDepartmentApproval(terminationId, dept, status);
            alert(`Department ${dept} marked as ${status}`);
            fetchSummary();
        } catch (e) {
            alert('Failed to update department status');
        }
    };

    const handleEquipmentReturn = async (name: string, returned: boolean) => {
        try {
            await recruitmentApi.updateEquipmentReturn(terminationId, [{ name, returned, condition: returned ? 'good' : undefined }]);
            alert(`Equipment ${name} marked as ${returned ? 'returned' : 'not returned'}`);
            fetchSummary();
        } catch (e) {
            alert('Failed to update equipment');
        }
    };

    const handleComplete = async () => {
        try {
            await recruitmentApi.completeOffboarding(terminationId);
            alert('Offboarding completed!');
            fetchSummary();
            if (onRefresh) onRefresh();
        } catch (e) {
            alert('Cannot complete - check all items first');
        }
    };

    const handleFinalPay = async () => {
        try {
            const data = await recruitmentApi.calculateFinalPay(terminationId);
            setFinalPay(data);
        } catch (e) {
            alert('Failed to calculate final pay');
        }
    };

    if (loading) return <div>Loading offboarding checklist...</div>;
    if (!summary) return <div>No offboarding data found</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3>Offboarding Checklist</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Termination ID: {terminationId}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: summary.isComplete ? '#22c55e' : '#f59e0b' }}>
                            {summary.percentComplete}%
                        </div>
                        <p style={{ fontSize: '0.8rem' }}>{summary.completedItems}/{summary.totalItems} Complete</p>
                    </div>
                </div>

                <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', marginTop: '1rem' }}>
                    <div style={{
                        width: `${summary.percentComplete}%`,
                        height: '100%',
                        background: summary.isComplete ? '#22c55e' : '#f59e0b',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </Card>

            {/* Department Approvals */}
            <Card padding="md">
                <h4 style={{ marginBottom: '1rem' }}>Department Clearance</h4>
                {summary.departments.map((dept) => (
                    <div key={dept.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontWeight: 500 }}>{dept.name}</span>
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
                                {dept.status.toUpperCase()}
                            </span>
                            {dept.status === 'pending' && (
                                <>
                                    <Button size="sm" variant="success" onClick={() => handleDeptApproval(dept.name, 'approved')}>Approve</Button>
                                    <Button size="sm" variant="error" onClick={() => handleDeptApproval(dept.name, 'rejected')}>Reject</Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </Card>

            {/* Equipment Return */}
            <Card padding="md">
                <h4 style={{ marginBottom: '1rem' }}>Equipment Return</h4>
                {summary.equipment.map((item) => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: item.returned ? '#dcfce7' : '#f3f4f6',
                                    color: item.returned ? '#166534' : '#4b5563'
                                }}
                            >
                                {item.returned ? 'RETURNED' : 'PENDING'}
                            </span>
                            {!item.returned && (
                                <Button size="sm" variant="success" onClick={() => handleEquipmentReturn(item.name, true)}>Mark Returned</Button>
                            )}
                        </div>
                    </div>
                ))}
            </Card>

            {/* Final Pay */}
            <Card padding="md">
                <h4 style={{ marginBottom: '1rem' }}>Final Pay Calculation</h4>
                <Button variant="outline" onClick={handleFinalPay}>Calculate Final Pay</Button>
                {finalPay && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '4px' }}>
                        <p><strong>Final Amount:</strong> ${finalPay.totalAmount || finalPay.finalPay || 'N/A'}</p>
                        <p><strong>Leave Balance:</strong> {finalPay.leaveBalance || 'N/A'} days</p>
                        <p><strong>Prorated Salary:</strong> ${finalPay.proratedSalary || 'N/A'}</p>
                    </div>
                )}
            </Card>

            {/* Complete Button */}
            {!summary.isComplete && (
                <Button variant="primary" onClick={handleComplete}>Complete Offboarding</Button>
            )}
            {summary.isComplete && (
                <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '4px', textAlign: 'center', color: '#166534', fontWeight: 500 }}>
                    ✓ Offboarding Completed
                </div>
            )}
        </div>
    );
}
