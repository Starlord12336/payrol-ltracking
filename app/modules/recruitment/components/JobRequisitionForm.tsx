'use client';

import { useState } from 'react';
import { Button, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { CreateJobRequisitionDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface JobRequisitionFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function JobRequisitionForm({ onSuccess, onCancel }: JobRequisitionFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateJobRequisitionDto>({
        jobTitle: '',
        department: '',
        description: '',
        qualifications: [],
        salary: { min: undefined, max: undefined, currency: 'USD' },
        location: '',
        employmentType: 'Full-Time',
        numberOfPositions: 1,
        urgency: 'MEDIUM',
    });

    const [qualificationsText, setQualificationsText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: CreateJobRequisitionDto = {
                ...formData,
                qualifications: qualificationsText.split('\n').filter(line => line.trim()),
            };

            await recruitmentApi.createJobRequisition(payload);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to create job requisition');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof CreateJobRequisitionDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSalaryChange = (field: 'min' | 'max' | 'currency', value: any) => {
        setFormData(prev => ({
            ...prev,
            salary: { ...prev.salary, [field]: value }
        }));
    };

    return (
        <div className={styles.formContainer}>
            <h2>Create New Job Posting (Requisition)</h2>
            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <Input
                            label="Job Title"
                            value={formData.jobTitle}
                            onChange={(e) => handleChange('jobTitle', e.target.value)}
                            required
                            fullWidth
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <Input
                            label="Department"
                            value={formData.department}
                            onChange={(e) => handleChange('department', e.target.value)}
                            required
                            fullWidth
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Qualifications (One per line)</label>
                    <textarea
                        className={styles.textarea}
                        value={qualificationsText}
                        onChange={(e) => setQualificationsText(e.target.value)}
                        placeholder="- 5 years experience&#10;- React knowledge"
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <Input
                            label="Min Salary"
                            type="number"
                            value={formData.salary?.min || ''}
                            onChange={(e) => handleSalaryChange('min', Number(e.target.value))}
                            fullWidth
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <Input
                            label="Max Salary"
                            type="number"
                            value={formData.salary?.max || ''}
                            onChange={(e) => handleSalaryChange('max', Number(e.target.value))}
                            fullWidth
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <Input
                            label="Currency"
                            value={formData.salary?.currency || 'USD'}
                            onChange={(e) => handleSalaryChange('currency', e.target.value)}
                            fullWidth
                        />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <Input
                            label="Location"
                            value={formData.location || ''}
                            onChange={(e) => handleChange('location', e.target.value)}
                            fullWidth
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <Input
                            label="Employment Type"
                            value={formData.employmentType || ''}
                            onChange={(e) => handleChange('employmentType', e.target.value)}
                            fullWidth
                        />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <Input
                            label="Positions"
                            type="number"
                            value={formData.numberOfPositions}
                            onChange={(e) => handleChange('numberOfPositions', Number(e.target.value))}
                            fullWidth
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <Input
                            label="Urgency"
                            value={formData.urgency || 'MEDIUM'}
                            onChange={(e) => handleChange('urgency', e.target.value as any)}
                            fullWidth
                            placeholder="LOW, MEDIUM, HIGH"
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button variant="outline" onClick={onCancel} type="button" disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Posting...' : 'Create Posting'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
