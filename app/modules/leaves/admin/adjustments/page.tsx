'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import styles from '../../leaves.module.css';
import { useLeaves } from '../../contexts/LeavesContext';

export default function AdjustBalancePage() {
    const { leaveTypes, adjustBalance } = useLeaves();

    // Form State
    const [formData, setFormData] = useState({
        employeeId: '',
        leaveTypeId: '',
        adjustmentDays: 0,
        reason: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        // Basic Validation
        if (!formData.employeeId || !formData.leaveTypeId || formData.adjustmentDays === 0 || !formData.reason) {
            setError('Please fill all fields. Adjustment cannot be 0.');
            setIsLoading(false);
            return;
        }

        try {
            await adjustBalance(
                formData.employeeId,
                formData.leaveTypeId,
                Number(formData.adjustmentDays),
                formData.reason
            );

            setSuccessMessage(`Successfully adjusted balance by ${formData.adjustmentDays} days.`);

            // Reset Form partially
            setFormData(prev => ({
                ...prev,
                adjustmentDays: 0,
                reason: ''
            }));

        } catch (err: any) {
            setError(err.message || 'Failed to adjust balance.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className={styles.sectionTitle}>Manual Balance Adjustment</h2>
            <Card className={styles.formCard}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.875rem' }}>
                        <strong>Note:</strong> This action will modify the employee&apos;s leave balance immediately and create an audit log entry.
                    </div>

                    <Input
                        label="Employee ID"
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="e.g. 64f1..."
                        required
                    />

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
                            <option value="">Select Leave Type...</option>
                            {leaveTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Adjustment Days (Positive to ADD, Negative to DEDUCT)"
                        type="number"
                        name="adjustmentDays"
                        value={formData.adjustmentDays}
                        onChange={handleChange}
                        placeholder="0"
                        required
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Reason for Adjustment</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={3}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                borderColor: 'var(--border-main)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                fontFamily: 'inherit',
                                width: '100%',
                            }}
                            placeholder="Explain why..."
                            required
                        />
                    </div>

                    {successMessage && (
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 'var(--radius-md)',
                            color: '#15803d'
                        }}>
                            ✅ {successMessage}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-md)',
                            color: '#991b1b'
                        }}>
                            ❌ {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                        >
                            Apply Adjustment
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
