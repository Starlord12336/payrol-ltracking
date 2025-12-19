'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { SubmitResignationRequestDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface ResignationFormProps {
    employeeId: string; // The logged-in user's employee ID
    onSuccess: () => void;
}

export default function ResignationForm({ employeeId, onSuccess }: ResignationFormProps) {
    const [formData, setFormData] = useState<Partial<SubmitResignationRequestDto>>({
        employeeId,
        resignationReason: '',
        lastWorkingDay: '',
        noticePeriodinDays: 30,
        additionalComments: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof SubmitResignationRequestDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await recruitmentApi.submitResignation(formData as SubmitResignationRequestDto);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to submit resignation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="lg">
            <h3>Submit Resignation Request</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Please fill out the form below to initiate your resignation process.
            </p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Reason for Resignation</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.resignationReason || ''}
                        onChange={(e) => handleChange('resignationReason', e.target.value)}
                        required
                        rows={3}
                        placeholder="Please briefly explain your reason for leaving..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Preferred Last Working Day</label>
                    <Input
                        type="date"
                        value={formData.lastWorkingDay || ''}
                        onChange={(e) => handleChange('lastWorkingDay', e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Notice Period (Days)</label>
                    <Input
                        type="number"
                        value={formData.noticePeriodinDays || 30}
                        onChange={(e) => handleChange('noticePeriodinDays', Number(e.target.value))}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Additional Comments</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.additionalComments || ''}
                        onChange={(e) => handleChange('additionalComments', e.target.value)}
                        rows={3}
                    />
                </div>

                <div className={styles.formActions}>
                    <Button type="submit" variant="error" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Resignation'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
