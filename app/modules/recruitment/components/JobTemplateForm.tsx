'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { CreateJobTemplateDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface JobTemplateFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function JobTemplateForm({ onSuccess, onCancel }: JobTemplateFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateJobTemplateDto>({
        title: '',
        department: '',
        description: '',
        qualifications: [],
        skills: [],
        openings: 1,
        location: '',
    });

    // Helper for comma-separated arrays
    const [qualificationsText, setQualificationsText] = useState('');
    const [skillsText, setSkillsText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: CreateJobTemplateDto = {
                ...formData,
                qualifications: qualificationsText.split('\n').filter(line => line.trim()),
                skills: skillsText.split('\n').filter(line => line.trim()),
            };

            await recruitmentApi.createJobTemplate(payload);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to create job template');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof CreateJobTemplateDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className={styles.formContainer}>
            <h2>Create Job Template</h2>
            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <Input
                            label="Job Title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
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

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Qualifications (One per line)</label>
                        <textarea
                            className={styles.textarea}
                            value={qualificationsText}
                            onChange={(e) => setQualificationsText(e.target.value)}
                            placeholder="- 5 years experience&#10;- React knowledge"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Skills (One per line)</label>
                        <textarea
                            className={styles.textarea}
                            value={skillsText}
                            onChange={(e) => setSkillsText(e.target.value)}
                            placeholder="- Java&#10;- Python"
                        />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <Input
                            label="Location"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            required
                            fullWidth
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <Input
                            label="Openings"
                            type="number"
                            value={formData.openings}
                            onChange={(e) => handleChange('openings', Number(e.target.value))}
                            required
                            fullWidth
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button variant="outline" onClick={onCancel} type="button" disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Template'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
