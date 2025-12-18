'use client';

import { useState } from 'react';
import { Button, Input, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import styles from './RecruitmentForms.module.css';

interface ReferralModalProps {
    candidateId: string;
    candidateName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReferralModal({ candidateId, candidateName, onClose, onSuccess }: ReferralModalProps) {
    const [referringEmployeeId, setReferringEmployeeId] = useState('');
    const [role, setRole] = useState('');
    const [level, setLevel] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!referringEmployeeId) {
            setError('Referring Employee ID is required.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await recruitmentApi.tagCandidateReferral(candidateId, {
                referringEmployeeId,
                role,
                level
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to tag referral');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Tag Referral: ${candidateName}`}>
            <div className={styles.publishContainer}>
                <div className={styles.formGroup}>
                    <Input
                        label="Referring Employee ID"
                        value={referringEmployeeId}
                        onChange={(e) => setReferringEmployeeId(e.target.value)}
                        fullWidth
                        required
                        placeholder="e.g. EMP-101"
                    />
                </div>

                <div className={styles.formGroup}>
                    <Input
                        label="Relationship/Role (Optional)"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        fullWidth
                        placeholder="e.g. Former Colleague, Friend"
                    />
                </div>

                <div className={styles.formGroup}>
                    <Input
                        label="Level/Strength of Recommendation (Optional)"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        fullWidth
                        placeholder="e.g. Highly Recommended"
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Tag Referral'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
