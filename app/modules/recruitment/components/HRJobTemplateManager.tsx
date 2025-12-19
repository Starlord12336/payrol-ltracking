'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { JobTemplate, CreateJobTemplateDto } from '../types';
import styles from './RecruitmentForms.module.css';

/**
 * HRJobTemplateManager (REC-003)
 * Allows HR Manager to define standardized job description templates
 * with job details (title, department, location, openings) and qualifications/skills
 */
export default function HRJobTemplateManager() {
    const [templates, setTemplates] = useState<JobTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateJobTemplateDto>({
        title: '',
        department: '',
        description: '',
        qualifications: [],
        skills: [],
        openings: 1,
        location: '',
        positionCode: '',
    });
    const [qualificationsText, setQualificationsText] = useState('');
    const [skillsText, setSkillsText] = useState('');
    const [formLoading, setFormLoading] = useState(false);

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

    const resetForm = () => {
        setFormData({
            title: '',
            department: '',
            description: '',
            qualifications: [],
            skills: [],
            openings: 1,
            location: '',
            positionCode: '',
        });
        setQualificationsText('');
        setSkillsText('');
        setSelectedTemplate(null);
    };

    const handleCreateNew = () => {
        resetForm();
        setShowForm(true);
    };

    const handleViewTemplate = (template: JobTemplate) => {
        setSelectedTemplate(template);
        setFormData({
            title: template.title,
            department: template.department,
            description: template.description,
            qualifications: template.qualifications,
            skills: template.skills,
            openings: template.openings,
            location: template.location,
        });
        setQualificationsText(template.qualifications.join('\n'));
        setSkillsText(template.skills.join('\n'));
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const payload: CreateJobTemplateDto = {
                ...formData,
                qualifications: qualificationsText.split('\n').filter(line => line.trim()),
                skills: skillsText.split('\n').filter(line => line.trim()),
            };

            await recruitmentApi.createJobTemplate(payload);
            await fetchTemplates();
            setShowForm(false);
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to create template');
        } finally {
            setFormLoading(false);
        }
    };

    const handleChange = (field: keyof CreateJobTemplateDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div>Loading job templates...</div>;

    if (showForm) {
        return (
            <div className={styles.formContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>{selectedTemplate ? 'View/Edit Job Template' : 'Create New Job Template'}</h2>
                    <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                        ← Back to List
                    </Button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}><Card padding="md">
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#3b82f6' }}>
                            📋 Job Details
                        </h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <Input
                                    label="Job Title *"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="e.g., Senior Software Engineer"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <Input
                                    label="Department *"
                                    value={formData.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="e.g., Engineering"
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <Input
                                    label="Location *"
                                    value={formData.location}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="e.g., Cairo, Egypt"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <Input
                                    label="Number of Openings *"
                                    type="number"
                                    value={formData.openings}
                                    onChange={(e) => handleChange('openings', Number(e.target.value))}
                                    required
                                    fullWidth
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <Input
                                label="Position Code (From Org Structure)"
                                value={formData.positionCode || ''}
                                onChange={(e) => handleChange('positionCode', e.target.value)}
                                fullWidth
                                placeholder="e.g., ENG-001 (optional, for OS integration)"
                            />
                            <small style={{ color: '#666' }}>
                                Links to Organizational Structure (OS) Jobs/Positions
                            </small>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Job Description *</label>
                            <textarea
                                className={styles.textarea}
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                required
                                rows={4}
                                placeholder="Describe the role, responsibilities, and what the position entails..."
                            />
                        </div>
                    </Card></div>

                    <div style={{ marginBottom: '1rem' }}><Card padding="md">
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#10b981' }}>
                            🎯 Qualifications & Skills
                        </h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Qualifications (One per line)</label>
                                <textarea
                                    className={styles.textarea}
                                    value={qualificationsText}
                                    onChange={(e) => setQualificationsText(e.target.value)}
                                    placeholder="Bachelor's degree in Computer Science&#10;5+ years of experience&#10;Strong communication skills"
                                    rows={5}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Skills Needed (One per line)</label>
                                <textarea
                                    className={styles.textarea}
                                    value={skillsText}
                                    onChange={(e) => setSkillsText(e.target.value)}
                                    placeholder="JavaScript/TypeScript&#10;React.js&#10;Node.js&#10;MongoDB"
                                    rows={5}
                                />
                            </div>
                        </div>
                    </Card></div>

                    <div className={styles.actions}>
                        <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }} type="button" disabled={formLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={formLoading}>
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
                    <h2 style={{ margin: 0 }}>Job Description Templates</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                        Standardized templates ensure consistent job postings (REC-003)
                    </p>
                </div>
                <Button variant="primary" onClick={handleCreateNew}>
                    + Create New Template
                </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {templates.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}><Card padding="lg">
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>No job templates found.</p>
                    <p style={{ color: '#999' }}>Create your first standardized job template to get started.</p>
                    <Button variant="primary" onClick={handleCreateNew}>
                        Create First Template
                    </Button>
                </Card></div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    {templates.map((template) => (
                        <div key={template._id} style={{ cursor: 'pointer' }} onClick={() => handleViewTemplate(template)}><Card padding="md" className={styles.listItem}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {template.title}
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.2rem 0.5rem',
                                            backgroundColor: '#e0f2fe',
                                            color: '#0369a1',
                                            borderRadius: '4px'
                                        }}>
                                            {template.openings} opening{template.openings > 1 ? 's' : ''}
                                        </span>
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                        <span>📍 {template.location}</span>
                                        <span>🏢 {template.department}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewTemplate(template); }}>
                                    View Details
                                </Button>
                            </div>

                            <p style={{ margin: '0.75rem 0', color: '#444', fontSize: '0.9rem' }}>
                                {template.description.substring(0, 150)}{template.description.length > 150 ? '...' : ''}
                            </p>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {template.skills.slice(0, 5).map((skill, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.8rem',
                                        padding: '0.2rem 0.5rem',
                                        backgroundColor: '#f0fdf4',
                                        color: '#166534',
                                        borderRadius: '4px'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                                {template.skills.length > 5 && (
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                        +{template.skills.length - 5} more
                                    </span>
                                )}
                            </div>
                        </Card></div>
                    ))}
                </div>
            )}
        </div>
    );
}
