'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { ProcessTemplate, CreateProcessTemplateDto } from '../types';
import styles from './RecruitmentForms.module.css';

/**
 * HRProcessTemplateManager (REC-004)
 * Allows HR Manager to establish hiring process templates
 * with defined stages for automatic progress tracking
 */

const DEFAULT_STAGES = [
    'Screening',
    'Shortlisting',
    'Interview',
    'Offer',
    'Hired'
];

export default function HRProcessTemplateManager() {
    const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [stages, setStages] = useState<string[]>([]);
    const [newStage, setNewStage] = useState('');
    const [formLoading, setFormLoading] = useState(false);

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

    const generateKey = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const resetForm = () => {
        setName('');
        setStages([]);
        setNewStage('');
        setSelectedTemplate(null);
    };

    const handleCreateNew = () => {
        resetForm();
        setShowForm(true);
    };

    const handleUseDefault = () => {
        setStages([...DEFAULT_STAGES]);
    };

    const handleViewTemplate = (template: ProcessTemplate) => {
        setSelectedTemplate(template);
        setName(template.name);
        setStages([...template.stages]);
        setShowForm(true);
    };

    const handleAddStage = () => {
        if (newStage.trim() && !stages.includes(newStage.trim())) {
            setStages([...stages, newStage.trim()]);
            setNewStage('');
        }
    };

    const handleRemoveStage = (index: number) => {
        setStages(stages.filter((_, i) => i !== index));
    };

    const handleMoveStage = (index: number, direction: 'up' | 'down') => {
        const newStages = [...stages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < stages.length) {
            [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
            setStages(newStages);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (!name.trim()) throw new Error('Template name is required');
            if (stages.length === 0) throw new Error('At least one stage is required');

            const key = selectedTemplate?.key || generateKey(name);
            const payload: CreateProcessTemplateDto = { name, stages };

            await recruitmentApi.createProcessTemplate(key, payload);
            await fetchTemplates();
            setShowForm(false);
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to save template');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (key: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await recruitmentApi.deleteProcessTemplate(key);
            await fetchTemplates();
        } catch (err: any) {
            alert('Failed to delete: ' + err.message);
        }
    };

    // Calculate progress percentage for each stage
    const getStageProgress = (stageIndex: number, totalStages: number) => {
        return Math.round(((stageIndex + 1) / totalStages) * 100);
    };

    if (loading) return <div>Loading process templates...</div>;

    if (showForm) {
        return (
            <div className={styles.formContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>{selectedTemplate ? 'Edit Hiring Process' : 'Create Hiring Process Template'}</h2>
                    <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                        ← Back to List
                    </Button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}><Card padding="md">
                        <div className={styles.formGroup}>
                            <Input
                                label="Template Name *"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                fullWidth
                                placeholder="e.g., Standard Engineering Hiring"
                            />
                            <small style={{ color: '#666' }}>
                                Key will be: {name ? generateKey(name) : '...'}
                            </small>
                        </div>
                    </Card></div>

                    <div style={{ marginBottom: '1rem' }}><Card padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#3b82f6' }}>⚙️ Hiring Stages</h3>
                            <Button variant="outline" size="sm" type="button" onClick={handleUseDefault}>
                                Use Default Stages
                            </Button>
                        </div>

                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Define the stages of your hiring process. Applications will track through these stages automatically.
                        </p>

                        {/* Stage List */}
                        <div style={{ marginBottom: '1rem' }}>
                            {stages.length === 0 ? (
                                <p style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>
                                    No stages defined yet. Add stages below or use default.
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {stages.map((stage, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <span style={{
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                borderRadius: '50%',
                                                fontSize: '0.8rem',
                                                fontWeight: 600
                                            }}>
                                                {index + 1}
                                            </span>

                                            <span style={{ flex: 1, fontWeight: 500 }}>{stage}</span>

                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: '#dbeafe',
                                                color: '#1d4ed8',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem'
                                            }}>
                                                {getStageProgress(index, stages.length)}% Progress
                                            </span>

                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveStage(index, 'up')}
                                                    disabled={index === 0}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                        opacity: index === 0 ? 0.3 : 1
                                                    }}
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveStage(index, 'down')}
                                                    disabled={index === stages.length - 1}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: index === stages.length - 1 ? 'not-allowed' : 'pointer',
                                                        opacity: index === stages.length - 1 ? 0.3 : 1
                                                    }}
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveStage(index)}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: 'pointer',
                                                        color: '#ef4444'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add Stage Input */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Input
                                value={newStage}
                                onChange={(e) => setNewStage(e.target.value)}
                                placeholder="Enter stage name (e.g., Technical Interview)"
                                fullWidth
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddStage();
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" onClick={handleAddStage}>
                                Add Stage
                            </Button>
                        </div>
                    </Card></div>

                    <div className={styles.actions}>
                        <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }} type="button" disabled={formLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={formLoading || stages.length === 0}>
                            {formLoading ? 'Saving...' : (selectedTemplate ? 'Update Template' : 'Create Template')}
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.listContainer}>
            <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: 0 }}>
                <div>
                    <h2 style={{ margin: 0 }}>Hiring Process Templates</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                        Define stages to automatically track application progress (REC-004)
                    </p>
                </div>
                <Button variant="primary" onClick={handleCreateNew}>
                    + Create New Process
                </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {templates.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}><Card padding="lg">
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>No hiring process templates found.</p>
                    <p style={{ color: '#999' }}>Create a process template to define hiring stages.</p>
                    <Button variant="primary" onClick={handleCreateNew} style={{ marginTop: '1rem' }}>
                        Create First Process
                    </Button>
                </Card></div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    {templates.map((template) => (
                        <Card key={template.key} padding="md" className={styles.listItem}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{template.name}</h3>
                                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>
                                        Key: {template.key} • {template.stages.length} stages
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button variant="outline" size="sm" onClick={() => handleViewTemplate(template)}>
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(template.key)} style={{ color: '#ef4444' }}>
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            {/* Visual Stage Flow */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                {template.stages.map((stage, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '0.4rem 0.75rem',
                                            backgroundColor: '#f0f9ff',
                                            color: '#0369a1',
                                            borderRadius: '16px',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            <span style={{
                                                width: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#0369a1',
                                                color: 'white',
                                                borderRadius: '50%',
                                                fontSize: '0.7rem'
                                            }}>
                                                {i + 1}
                                            </span>
                                            {stage}
                                        </span>
                                        {i < template.stages.length - 1 && (
                                            <span style={{ margin: '0 0.25rem', color: '#94a3b8' }}>→</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
