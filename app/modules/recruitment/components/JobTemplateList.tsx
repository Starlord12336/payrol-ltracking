'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { JobTemplate } from '../types';
import styles from './RecruitmentForms.module.css';

interface JobTemplateListProps {
    onCreateClick: () => void;
}

export default function JobTemplateList({ onCreateClick }: JobTemplateListProps) {
    const [templates, setTemplates] = useState<JobTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listJobTemplates();
            setTemplates(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading templates...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.listContainer}>
            <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: 0 }}>
                <h2>Job Templates</h2>
                <Button variant="primary" onClick={onCreateClick}>
                    Create New Template
                </Button>
            </div>

            {templates.length === 0 ? (
                <p>No job templates found.</p>
            ) : (
                templates.map((template) => (
                    <div key={template._id} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <h3>{template.title}</h3>
                            <div className={styles.itemMeta}>
                                <span>{template.department}</span>
                                <span>{template.location}</span>
                                <span>Openings: {template.openings}</span>
                            </div>
                            <p style={{ marginTop: '0.5rem', color: '#555' }}>
                                {template.description.substring(0, 100)}...
                            </p>
                        </div>
                        {/* View/Edit actions could go here */}
                    </div>
                ))
            )}
        </div>
    );
}
