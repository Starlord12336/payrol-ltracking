'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { AssessmentForm, AssessmentCriteria } from '../types';
import styles from './RecruitmentForms.module.css';

interface AssessmentFormBuilderProps {
    initialData?: AssessmentForm;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AssessmentFormBuilder({ initialData, onSuccess, onCancel }: AssessmentFormBuilderProps) {
    const [key, setKey] = useState(initialData?.key || '');
    const [name, setName] = useState(initialData?.name || '');
    const [role, setRole] = useState(initialData?.role || '');
    const [criteria, setCriteria] = useState<AssessmentCriteria[]>(initialData?.criteria || []);

    // New criteria inputs
    const [newLabel, setNewLabel] = useState('');
    const [newWeight, setNewWeight] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddCriteria = () => {
        if (!newLabel.trim()) return;
        const keyName = newLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        setCriteria([...criteria, { key: keyName, label: newLabel, weight: Number(newWeight) }]);
        setNewLabel('');
        setNewWeight(1);
    };

    const handleRemoveCriteria = (index: number) => {
        const newCriteria = [...criteria];
        newCriteria.splice(index, 1);
        setCriteria(newCriteria);
    };

    const handleSave = async () => {
        if (!key.trim() || !name.trim()) {
            setError('Key and Name are required.');
            return;
        }
        if (criteria.length === 0) {
            setError('At least one criterion is required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await recruitmentApi.saveAssessmentForm(key, {
                name,
                role,
                criteria
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to save assessment form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>{initialData ? 'Edit Assessment Form' : 'Create Assessment Form'}</h2>

            <div className={styles.formGroup}>
                <Input
                    label="Form Key (Unique ID)"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    disabled={!!initialData}
                    fullWidth
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <Input
                    label="Form Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <Input
                    label="Target Role (Optional)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    fullWidth
                />
            </div>

            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Evaluation Criteria</h3>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                    <div style={{ flex: 2 }}>
                        <Input
                            label="Criterion Label"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            fullWidth
                            placeholder="e.g. Technical Skills"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="Weight (1-10)"
                            type="number"
                            value={newWeight.toString()}
                            onChange={(e) => setNewWeight(Number(e.target.value))}
                            fullWidth
                        />
                    </div>
                    <Button variant="outline" onClick={handleAddCriteria} style={{ marginBottom: '2px' }}>
                        Add
                    </Button>
                </div>

                {criteria.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                        <thead>
                            <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Label</th>
                                <th style={{ padding: '0.5rem' }}>Weight</th>
                                <th style={{ padding: '0.5rem' }}>Key</th>
                                <th style={{ padding: '0.5rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {criteria.map((c, idx) => (
                                <tr key={c.key + idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{c.label}</td>
                                    <td style={{ padding: '0.5rem' }}>{c.weight}</td>
                                    <td style={{ padding: '0.5rem', color: '#666', fontSize: '0.85rem' }}>{c.key}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <button
                                            onClick={() => handleRemoveCriteria(idx)}
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '1rem' }}>No criteria added yet.</p>
                )}
            </div>

            {error && <div className={styles.error} style={{ marginTop: '1rem' }}>{error}</div>}

            <div className={styles.actions} style={{ marginTop: '2rem' }}>
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Form'}
                </Button>
            </div>
        </div>
    );
}
