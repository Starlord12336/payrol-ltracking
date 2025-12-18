'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { TerminationReview } from '../types';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './RecruitmentForms.module.css';

export default function TerminationReviewList() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<TerminationReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<TerminationReview | null>(null);
    const [showInitiateModal, setShowInitiateModal] = useState(false);
    const [newReview, setNewReview] = useState({ employeeId: '', reason: '' });
    const [hrComments, setHrComments] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await recruitmentApi.getPendingTerminationReviews();
            setReviews(data);
        } catch (error: any) {
            console.error('Failed to fetch termination reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReview.employeeId || !newReview.reason) return;

        try {
            await recruitmentApi.initiateTerminationReview({
                employeeId: newReview.employeeId,
                reason: newReview.reason,
                initiator: user?.userid
            });
            alert('Termination review initiated!');
            setShowInitiateModal(false);
            setNewReview({ employeeId: '', reason: '' });
            fetchReviews();
        } catch (e) {
            alert('Failed to initiate review');
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedReview) return;

        try {
            await recruitmentApi.updateTerminationReviewStatus(selectedReview._id, status, hrComments);
            alert(`Review marked as ${status}`);
            setSelectedReview(null);
            setHrComments('');
            fetchReviews();
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return '#22c55e';
            case 'REJECTED': return '#ef4444';
            case 'UNDER_REVIEW': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Termination Reviews</h3>
                <Button variant="primary" onClick={() => setShowInitiateModal(true)}>
                    Initiate New Review
                </Button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : reviews.length === 0 ? (
                <Card padding="lg">
                    <p style={{ color: '#666', textAlign: 'center' }}>No pending termination reviews</p>
                </Card>
            ) : (
                reviews.map((review) => (
                    <Card key={review._id} padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontWeight: 500 }}>Employee ID: {review.employeeId}</p>
                                <p style={{ color: '#666', marginTop: '0.25rem' }}>Reason: {review.reason}</p>
                                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                                    Initiated: {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: getStatusColor(review.status) + '20',
                                        color: getStatusColor(review.status),
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}
                                >
                                    {review.status}
                                </span>
                                <Button size="sm" variant="outline" onClick={() => setSelectedReview(review)}>
                                    Review
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))
            )}

            {/* Initiate Modal */}
            {showInitiateModal && (
                <Modal isOpen={true} onClose={() => setShowInitiateModal(false)} title="Initiate Termination Review">
                    <form onSubmit={handleInitiate} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Employee ID</label>
                            <Input
                                value={newReview.employeeId}
                                onChange={(e) => setNewReview({ ...newReview, employeeId: e.target.value })}
                                placeholder="Enter Employee ID"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Reason</label>
                            <textarea
                                className={styles.input}
                                value={newReview.reason}
                                onChange={(e) => setNewReview({ ...newReview, reason: e.target.value })}
                                placeholder="Enter reason for termination review"
                                rows={3}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setShowInitiateModal(false)}>Cancel</Button>
                            <Button type="submit" variant="primary">Initiate Review</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Review Details Modal */}
            {selectedReview && (
                <Modal isOpen={true} onClose={() => setSelectedReview(null)} title="Review Termination Request">
                    <div style={{ marginBottom: '1rem' }}>
                        <p><strong>Employee ID:</strong> {selectedReview.employeeId}</p>
                        <p><strong>Reason:</strong> {selectedReview.reason}</p>
                        <p><strong>Status:</strong> {selectedReview.status}</p>
                        <p><strong>Initiated:</strong> {new Date(selectedReview.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.formGroup}>
                        <label>HR Comments</label>
                        <textarea
                            className={styles.input}
                            value={hrComments}
                            onChange={(e) => setHrComments(e.target.value)}
                            placeholder="Add comments..."
                            rows={3}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Button variant="outline" onClick={() => setSelectedReview(null)}>Cancel</Button>
                        <Button variant="error" onClick={() => handleUpdateStatus('REJECTED')}>Reject</Button>
                        <Button variant="success" onClick={() => handleUpdateStatus('APPROVED')}>Approve</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
