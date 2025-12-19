'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './RecruitmentForms.module.css';

interface ApplyJobModalProps {
    requisitionId: string;
    jobTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ApplyJobModal({ requisitionId, jobTitle, onClose, onSuccess }: ApplyJobModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApply = async () => {
        try {
            setLoading(true);
            setError(null);
            // Apply without specifying a CV document ID
            await recruitmentApi.applyToRequisition(requisitionId);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`Apply for ${jobTitle}`}
            size="md"
        >
            <div className={styles.formSection}>
                <p>Are you sure you want to apply for the position of <strong>{jobTitle}</strong>?</p>

                {error && (
                    <div className={styles.error} style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                        {error}
                    </div>
                )}

                <div className={styles.actions} style={{ marginTop: '2rem' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleApply}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Confirm Application'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
