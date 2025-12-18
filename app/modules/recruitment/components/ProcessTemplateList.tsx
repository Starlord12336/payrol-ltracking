'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { ProcessTemplate } from '../types';
import styles from './RecruitmentForms.module.css';

interface ProcessTemplateListProps {
    onCreateClick: () => void;
}

export default function ProcessTemplateList({ onCreateClick }: ProcessTemplateListProps) {
    const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listProcessTemplates();
            setTemplates(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (key: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await recruitmentApi.deleteProcessTemplate(key);
            setTemplates(prev => prev.filter(t => t.key !== key));
        } catch (err: any) {
            alert('Failed to delete template: ' + err.message);
        }
    };

    if (loading) return <div>Loading process templates...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.listContainer}>
            <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: 0 }}>
                <h2>Hiring Process Templates</h2>
                <Button variant="primary" onClick={onCreateClick}>
                    Create New Process
                </Button>
            </div>

            {templates.length === 0 ? (
                <p>No process templates found.</p>
            ) : (
                templates.map((template) => (
                    <div key={template.key} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <h3>{template.name}</h3>
                            <div className={styles.itemMeta}>
                                <span>Key: {template.key}</span>
                                <span>{template.stages.length} Stages</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {template.stages.map((stage, i) => (
                                    <span key={i} className={styles.badge} style={{ fontSize: '0.8rem' }}>
                                        {i + 1}. {stage}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Button variant="outline" onClick={() => handleDelete(template.key)}>
                                Delete
                            </Button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
