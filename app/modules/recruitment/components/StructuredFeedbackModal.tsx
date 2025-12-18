'use client';

import { useState, useEffect } from 'react';
import { Button, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { AssessmentForm, AssessmentCriteria } from '../types';
import styles from './RecruitmentForms.module.css';

interface StructuredFeedbackModalProps {
    interviewId: string;
    interviewTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function StructuredFeedbackModal({ interviewId, interviewTitle, onClose, onSuccess }: StructuredFeedbackModalProps) {
    const [forms, setForms] = useState<AssessmentForm[]>([]);
    const [selectedFormKey, setSelectedFormKey] = useState<string>('');
    const [selectedForm, setSelectedForm] = useState<AssessmentForm | null>(null);

    // Scores: key -> score
    const [responses, setResponses] = useState<Record<string, number>>({});
    const [comments, setComments] = useState('');
    const [interviewerId, setInterviewerId] = useState('current-user-id'); // In real app, from auth

    const [loading, setLoading] = useState(false);
    const [loadingForms, setLoadingForms] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchForms();
    }, []);

    useEffect(() => {
        if (selectedFormKey) {
            const form = forms.find(f => f.key === selectedFormKey) || null;
            setSelectedForm(form);
            // Reset responses when form changes
            setResponses({});
        } else {
            setSelectedForm(null);
        }
    }, [selectedFormKey, forms]);

    const fetchForms = async () => {
        try {
            setLoadingForms(true);
            const data = await recruitmentApi.listAssessmentForms();
            setForms(data);
            if (data.length > 0) {
                setSelectedFormKey(data[0].key);
            }
        } catch (err: any) {
            setError('Failed to load assessment forms.');
        } finally {
            setLoadingForms(false);
        }
    };

    const handleScoreChange = (criteriaKey: string, val: number) => {
        setResponses(prev => ({
            ...prev,
            [criteriaKey]: val
        }));
    };

    const handleSubmit = async () => {
        if (!selectedFormKey) {
            setError('Please select an assessment form.');
            return;
        }

        // Validate all criteria scored? Or allow partial? Let's say partial is ok, but warn?
        // Let's enforce all for now or just submit what we have.
        // Backend handles missing as 0 or ignores.

        setLoading(true);
        setError(null);

        try {
            await recruitmentApi.submitStructuredFeedback(interviewId, {
                interviewerId,
                formKey: selectedFormKey,
                responses,
                comments
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit feedback');
            setLoading(false);
        }
    };

    // Calculate current weighted score for preview
    const calculateScore = () => {
        if (!selectedForm) return 0;
        let totalWeight = 0;
        let weightedSum = 0;
        selectedForm.criteria.forEach(c => {
            const score = responses[c.key] || 0;
            weightedSum += score * c.weight;
            totalWeight += c.weight;
        });
        if (totalWeight === 0) return 0;
        return (weightedSum / totalWeight).toFixed(2);
    };

    if (loadingForms) return <Modal isOpen={true} onClose={onClose} title="Loading..."><div className={styles.publishContainer}>Loading forms...</div></Modal>;

    return (
        <Modal isOpen={true} onClose={onClose} title={`Structured Feedback: ${interviewTitle}`}>
            <div className={styles.publishContainer} style={{ minWidth: '600px' }}>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Assessment Form</label>
                    <select
                        className={styles.input}
                        value={selectedFormKey}
                        onChange={(e) => setSelectedFormKey(e.target.value)}
                    >
                        <option value="">-- Select Form --</option>
                        {forms.map(f => (
                            <option key={f.key} value={f.key}>{f.name}</option>
                        ))}
                    </select>
                </div>

                {selectedForm && (
                    <div style={{ marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                            Evaluation Criteria
                        </h4>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {selectedForm.criteria.map(c => (
                                <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{c.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Weight: {c.weight}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        {[1, 2, 3, 4, 5].map(val => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => handleScoreChange(c.key, val)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #d1d5db',
                                                    background: responses[c.key] === val ? '#0ea5e9' : '#fff',
                                                    color: responses[c.key] === val ? '#fff' : '#374151',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '1.5rem', textAlign: 'right', fontWeight: 600, fontSize: '1.1rem' }}>
                            Current Weighted Score: <span style={{ color: '#0ea5e9' }}>{calculateScore()}</span>
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Additional Comments</label>
                    <textarea
                        className={styles.textarea}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Overall feedback details..."
                        style={{ minHeight: '100px' }}
                    />
                </div>

                {error && <div className={styles.error} style={{ marginTop: '1rem' }}>{error}</div>}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Evaluation'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
