'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { AssessmentForm } from '../types';
import styles from './RecruitmentForms.module.css';

interface AssessmentFormListProps {
    onCreateNew: () => void;
    onEdit: (form: AssessmentForm) => void;
}

export default function AssessmentFormList({ onCreateNew, onEdit }: AssessmentFormListProps) {
    const [forms, setForms] = useState<AssessmentForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listAssessmentForms();
            setForms(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load assessment forms');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (key: string) => {
        if (!confirm('Are you sure you want to delete this form?')) return;
        try {
            await recruitmentApi.deleteAssessmentForm(key);
            fetchForms();
        } catch (err: any) {
            alert('Failed to delete form: ' + err.message);
        }
    };

    if (loading) return <div>Loading forms...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.listContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Existing Scorecards</h3>
                <Button variant="primary" onClick={onCreateNew}>
                    Create New Form
                </Button>
            </div>

            {forms.length === 0 ? (
                <p>No assessment forms found.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {forms.map(form => (
                        <div key={form.key} className={styles.listItem}>
                            <div className={styles.itemInfo}>
                                <h3 className={styles.itemTitle}>{form.name}</h3>
                                <div className={styles.itemMeta}>
                                    <span>Key: {form.key}</span>
                                    <span>Role: {form.role || 'Any'}</span>
                                    <span>Criteria: {form.criteria?.length || 0}</span>
                                </div>
                            </div>
                            <div className={styles.itemActions}>
                                <Button variant="outline" onClick={() => onEdit(form)}>
                                    Edit
                                </Button>
                                <Button variant="outline" onClick={() => handleDelete(form.key)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
