'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { CreateProcessTemplateDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface ProcessTemplateFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ProcessTemplateForm({ onSuccess, onCancel }: ProcessTemplateFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [stagesText, setStagesText] = useState('');

    const generateKey = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!name.trim()) throw new Error('Template name is required');

            const stages = stagesText.split('\n').map(s => s.trim()).filter(Boolean);
            if (stages.length === 0) throw new Error('At least one stage is required');

            const key = generateKey(name);

            const payload: CreateProcessTemplateDto = {
                name,
                stages
            };

            await recruitmentApi.createProcessTemplate(key, payload);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to create process template');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Create Hiring Process Template</h2>
            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <Input
                        label="Template Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                    />
                    <small style={{ color: '#666' }}>
                        Key will be: {name ? generateKey(name) : '...'}
                    </small>
                </div>

                <div className={styles.formGroup}>
                    <label>Stages (Ordered, one per line)</label>
                    <textarea
                        className={styles.textarea}
                        value={stagesText}
                        onChange={(e) => setStagesText(e.target.value)}
                        placeholder="Screening&#10;Interview&#10;Offer"
                        required
                        style={{ minHeight: '150px' }}
                    />
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
