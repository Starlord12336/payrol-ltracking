'use client';

import { useState } from 'react';
import { Button, Modal, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import styles from './RecruitmentForms.module.css';

interface InterviewFeedbackModalProps {
    interviewId: string;
    interviewTitle: string; // e.g. "First Interview on 12/10"
    onClose: () => void;
    onSuccess: () => void;
}

export default function InterviewFeedbackModal({ interviewId, interviewTitle, onClose, onSuccess }: InterviewFeedbackModalProps) {
    const [score, setScore] = useState(3);
    const [comments, setComments] = useState('');
    const [interviewerId, setInterviewerId] = useState('current-user-id'); // In real app, get from auth context
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!comments.trim()) {
            setError('Please provide comments.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await recruitmentApi.submitFeedback(interviewId, {
                interviewerId,
                score,
                comments
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit feedback');
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Assessment: ${interviewTitle}`}>
            <div className={styles.publishContainer}>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Global Score (1-5)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map(val => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setScore(val)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: '1px solid #ccc',
                                    background: score === val ? '#0070f3' : '#fff',
                                    color: score === val ? '#fff' : '#000',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Feedback / Comments</label>
                    <textarea
                        className={styles.textarea}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Candidate strengths, weaknesses, and recommendation..."
                        style={{ minHeight: '120px' }}
                    />
                </div>

                {error && <div className={styles.error} style={{ marginTop: '1rem' }}>{error}</div>}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
