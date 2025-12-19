'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { Interview } from '../types';
import styles from './RecruitmentForms.module.css';
import InterviewFeedbackModal from './InterviewFeedbackModal';
import StructuredFeedbackModal from './StructuredFeedbackModal';
import ScheduleInterviewModal from './ScheduleInterviewModal';

interface InterviewListModalProps {
    applicationId: string;
    candidateName: string;
    onClose: () => void;
}

export default function InterviewListModal({ applicationId, candidateName, onClose }: InterviewListModalProps) {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedbackTarget, setFeedbackTarget] = useState<{ id: string, title: string } | null>(null);
    const [structuredTarget, setStructuredTarget] = useState<{ id: string, title: string } | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const fetchInterviews = useCallback(async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listInterviews(applicationId);
            setInterviews(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load interviews');
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        fetchInterviews();
    }, [applicationId, fetchInterviews]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Interviews for ${candidateName}`}>
            <div className={styles.publishContainer} style={{ minWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
                        Schedule Interview
                    </Button>
                </div>

                {loading && <p>Loading interviews...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {!loading && !error && interviews.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                        No interviews scheduled for this candidate yet.
                    </p>
                )}

                {!loading && interviews.length > 0 && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {interviews.map(interview => (
                            <div key={interview._id} style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '1rem',
                                background: '#f9fafb'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: '#1f2937' }}>{interview.stage}</span>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '12px',
                                        background: interview.status === 'completed' ? '#d1fae5' : '#e0f2fe',
                                        color: interview.status === 'completed' ? '#065f46' : '#075985',
                                        textTransform: 'capitalize'
                                    }}>
                                        {interview.status}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem' }}>
                                    <div>Date: {new Date(interview.scheduledDate).toLocaleString()}</div>
                                    <div>Method: {interview.method} {interview.videoLink && '(Video)'}</div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    {interview.status !== 'completed' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFeedbackTarget({
                                                    id: interview._id,
                                                    title: `${interview.stage} (${new Date(interview.scheduledDate).toLocaleDateString()})`
                                                })}
                                            >
                                                Quick Feedback
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => setStructuredTarget({
                                                    id: interview._id,
                                                    title: `${interview.stage} (${new Date(interview.scheduledDate).toLocaleDateString()})`
                                                })}
                                            >
                                                Structured Scorecard
                                            </Button>
                                        </div>
                                    )}
                                    {interview.status === 'completed' && (
                                        <span style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 500 }}>
                                            ✓ Feedback Submitted
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>

            {feedbackTarget && (
                <InterviewFeedbackModal
                    interviewId={feedbackTarget.id}
                    interviewTitle={feedbackTarget.title}
                    onClose={() => setFeedbackTarget(null)}
                    onSuccess={() => {
                        // Ideally refresh list or mark local state
                        fetchInterviews();
                    }}
                />
            )}

            {structuredTarget && (
                <StructuredFeedbackModal
                    interviewId={structuredTarget.id}
                    interviewTitle={structuredTarget.title}
                    onClose={() => setStructuredTarget(null)}
                    onSuccess={() => {
                        fetchInterviews();
                    }}
                />
            )}

            {showScheduleModal && (
                <ScheduleInterviewModal // Assuming this is imported or needs import
                    applicationId={applicationId}
                    candidateName={candidateName}
                    onClose={() => setShowScheduleModal(false)}
                    onSuccess={() => {
                        fetchInterviews();
                    }}
                />
            )}
        </Modal>
    );
}
