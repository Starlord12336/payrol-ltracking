'use client';

import { useState } from 'react';
import { Button, Modal, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import styles from './RecruitmentForms.module.css';

interface RejectionModalProps {
    applicationId: string;
    candidateName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RejectionModal({ applicationId, candidateName, onClose, onSuccess }: RejectionModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReject = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for rejection.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await recruitmentApi.rejectApplication(applicationId, reason);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to reject application');
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Reject Application: ${candidateName}`}>
            <div className={styles.publishContainer}>
                <p>
                    You are about to reject the application for <strong>{candidateName}</strong>.
                    This action triggers a notification to the candidate.
                </p>

                <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rejection Reason (Internal & Notification)</label>
                    <textarea
                        className={styles.textarea}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. We have decided to move forward with other candidates who more closely match our requirements."
                        style={{ minHeight: '100px' }}
                    />
                </div>

                {error && <div className={styles.error} style={{ marginTop: '1rem' }}>{error}</div>}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="error" onClick={handleReject} disabled={loading}>
                        {loading ? 'Rejecting...' : 'Confirm Rejection'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
