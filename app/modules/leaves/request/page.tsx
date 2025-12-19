'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import styles from '../leaves.module.css';
import { useLeaves } from '../contexts/LeavesContext';

function LeaveRequestContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');
    const { addRequest, editRequest, leaveTypes, requests, balances } = useLeaves();

    // Filter existing requests for display
    const existingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Approved');

    const [formData, setFormData] = useState({
        leaveTypeId: '',
        fromDate: '',
        toDate: '',
        justification: '',
        attachment: null as File | null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestedDays, setRequestedDays] = useState<number | null>(null);

    useEffect(() => {
        if (editId) {
            const req = requests.find(r => r.id === editId);
            if (req) {
                setFormData({
                    leaveTypeId: req.leaveTypeId,
                    fromDate: req.fromDate,
                    toDate: req.toDate,
                    justification: req.justification,
                    attachment: null
                });
            }
        }
    }, [editId, requests]);

    // Calculate requested days when dates change
    useEffect(() => {
        if (formData.fromDate && formData.toDate) {
            const from = new Date(formData.fromDate);
            const to = new Date(formData.toDate);
            if (to >= from) {
                let count = 0;
                const current = new Date(from);
                while (current <= to) {
                    const dayOfWeek = current.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        count++;
                    }
                    current.setDate(current.getDate() + 1);
                }
                setRequestedDays(count);
            } else {
                setRequestedDays(null);
            }
        } else {
            setRequestedDays(null);
        }
    }, [formData.fromDate, formData.toDate]);

    // Get current balance for selected leave type
    const selectedBalance = balances.find(b => {
        const selectedType = leaveTypes.find(t => t.id === formData.leaveTypeId);
        return selectedType && b.type === selectedType.name;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Find the selected type object to get its name
        const selectedType = leaveTypes.find(t => t.id === formData.leaveTypeId);

        // Validate balance before submission
        if (selectedBalance && requestedDays !== null) {
            if (selectedBalance.remaining < requestedDays) {
                setError(
                    `Insufficient balance. You have ${selectedBalance.remaining} days remaining, but requested ${requestedDays} days.`
                );
                setIsLoading(false);
                return;
            }
        }

        try {
            if (editId) {
                editRequest(editId, {
                    leaveTypeId: formData.leaveTypeId,
                    leaveTypeName: selectedType ? selectedType.name : 'Unknown Type',
                    fromDate: formData.fromDate,
                    toDate: formData.toDate,
                    justification: formData.justification
                });
                setIsLoading(false);
                router.push('/modules/leaves/history');
            } else {
                await addRequest({
                    employeeId: 'u1', // Mock current user
                    employeeName: 'Current User',
                    leaveTypeId: formData.leaveTypeId,
                    leaveTypeName: selectedType ? selectedType.name : 'Unknown Type',
                    fromDate: formData.fromDate,
                    toDate: formData.toDate,
                    justification: formData.justification
                });
                setIsLoading(false);
                router.push('/modules/leaves/history');
            }
        } catch (err: any) {
            setIsLoading(false);
            // Display the error message from the backend
            const errorMessage = err?.message || 'Failed to submit request. Please check your balance and try again.';
            setError(errorMessage);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <h2 className={styles.sectionTitle}>{editId ? 'Edit Leave Request' : 'Submit New Leave Request'}</h2>
            <Card className={styles.formCard}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Leave Type</label>
                        <select
                            name="leaveTypeId"
                            value={formData.leaveTypeId}
                            onChange={handleChange}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                borderColor: 'var(--border-main)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                backgroundColor: 'var(--bg-card)',
                                fontFamily: 'inherit',
                            }}
                            required
                        >
                            <option value="">Select a type...</option>
                            {leaveTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        {selectedBalance && (
                            <div style={{
                                fontSize: '0.875rem',
                                padding: '0.5rem',
                                backgroundColor: selectedBalance.remaining > 0 ? '#f0f9ff' : '#fef2f2',
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid ${selectedBalance.remaining > 0 ? '#bfdbfe' : '#fecaca'}`,
                                color: selectedBalance.remaining > 0 ? '#1e40af' : '#991b1b'
                            }}>
                                <strong>Available Balance:</strong> {selectedBalance.remaining} days
                                {selectedBalance.total > 0 && ` (${selectedBalance.used} used of ${selectedBalance.total} total)`}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input
                            label="From Date"
                            type="date"
                            name="fromDate"
                            value={formData.fromDate}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="To Date"
                            type="date"
                            name="toDate"
                            value={formData.toDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {requestedDays !== null && requestedDays > 0 && (
                        <div style={{
                            fontSize: '0.875rem',
                            padding: '0.5rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #e5e7eb'
                        }}>
                            <strong>Requested Days:</strong> {requestedDays} {requestedDays === 1 ? 'day' : 'days'}
                            {selectedBalance && requestedDays > selectedBalance.remaining && (
                                <span style={{ color: '#dc2626', marginLeft: '0.5rem', fontWeight: 600 }}>
                                    ⚠️ Exceeds available balance
                                </span>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Justification</label>
                        <textarea
                            name="justification"
                            value={formData.justification}
                            onChange={handleChange}
                            rows={4}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                borderColor: 'var(--border-main)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                fontFamily: 'inherit',
                                width: '100%',
                                resize: 'vertical'
                            }}
                            placeholder="Reason for leave..."
                            required
                        />
                    </div>

                    <Input
                        label="Attachment (Optional)"
                        type="file"
                        name="attachment"
                        onChange={() => { }} // Handle file manually if needed
                    />

                    {existingRequests.length > 0 && (
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#fefce8',
                            border: '1px solid #fbbf24',
                            borderRadius: 'var(--radius-md)',
                            color: '#92400e',
                            fontSize: '0.875rem'
                        }}>
                            <strong>⚠️ Existing Leave Requests:</strong>
                            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem' }}>
                                {existingRequests.map(req => (
                                    <li key={req.id}>
                                        {req.leaveTypeName}: {req.fromDate} to {req.toDate} ({req.status})
                                    </li>
                                ))}
                            </ul>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
                                Make sure your new request doesn&apos;t overlap with existing ones.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-md)',
                            color: '#991b1b',
                            fontSize: '0.875rem'
                        }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                            disabled={selectedBalance && requestedDays !== null && requestedDays > selectedBalance.remaining}
                        >
                            {editId ? 'Update Request' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default function LeaveRequestPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
            <LeaveRequestContent />
        </Suspense>
    );
}
