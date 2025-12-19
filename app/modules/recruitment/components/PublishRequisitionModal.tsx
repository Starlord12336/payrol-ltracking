'use client';

import { useState } from 'react';
import { Button, Modal, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import styles from './RecruitmentForms.module.css';

interface PublishRequisitionModalProps {
    requisitionId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PublishRequisitionModal({ requisitionId, onClose, onSuccess }: PublishRequisitionModalProps) {
    const [expiryDays, setExpiryDays] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePublish = async () => {
        setLoading(true);
        setError(null);
        try {
            const dto = expiryDays ? { expiryDays: Number(expiryDays) } : {};
            await recruitmentApi.publishRequisition(requisitionId, dto);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to publish requisition');
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Publish Job Requisition">
            <div className={styles.publishContainer}>
                <p>
                    Are you sure you want to publish this requisition?
                    Once published, it will be visible to candidates.
                </p>

                <div style={{ marginTop: '1rem' }}>
                    <Input
                        label="Expiry Days (Optional)"
                        type="number"
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(Number(e.target.value))}
                        placeholder="e.g. 30"
                        fullWidth
                    />
                    <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                        Leave empty for default expiry.
                    </small>
                </div>

                {error && <div className={styles.error} style={{ marginTop: '1rem' }}>{error}</div>}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handlePublish} disabled={loading}>
                        {loading ? 'Publishing...' : 'Confirm Publish'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
