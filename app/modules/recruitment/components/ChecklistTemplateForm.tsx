'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { CreateChecklistDto } from '../types';
import styles from './RecruitmentForms.module.css';

export default function ChecklistTemplateForm({ onSuccess }: { onSuccess?: () => void }) {
    const [formData, setFormData] = useState<Partial<CreateChecklistDto>>({
        templateName: '',
        description: '',
        departmentId: '',
    });
    const [tasksStr, setTasksStr] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const taskNames = tasksStr.split(',').map(t => t.trim()).filter(t => t);
            await recruitmentApi.createChecklist({
                ...formData as CreateChecklistDto,
                taskNames
            });
            setMessage({ type: 'success', text: 'Onboarding template created successfully!' });
            setFormData({ templateName: '', description: '', departmentId: '' });
            setTasksStr('');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to create template' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="lg">
            <h3>Create Onboarding Checklist Template</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Define standard task lists for new hires based on department or role.
            </p>

            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Template Name</label>
                    <Input
                        value={formData.templateName || ''}
                        onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                        required
                        placeholder="e.g. Engineering Onboarding"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Task List (Comma Separated)</label>
                    <textarea
                        className={styles.textarea}
                        value={tasksStr}
                        onChange={(e) => setTasksStr(e.target.value)}
                        rows={4}
                        placeholder="Introduction to Team, Setup Email, Security Training, read Handbook"
                    />
                    <small style={{ color: '#666' }}>Enter standard tasks separated by commas</small>
                </div>

                <div className={styles.formActions}>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Template'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
