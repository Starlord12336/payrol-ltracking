'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { CreateOfferDto } from '../types';
import OfferForm from './OfferForm';
import styles from './RecruitmentForms.module.css';

interface CreateOfferModalProps {
    applicationId: string;
    candidateId: string;
    candidateName: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateOfferModal({ applicationId, candidateId, candidateName, onClose, onSuccess }: CreateOfferModalProps) {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: CreateOfferDto) => {
        try {
            await recruitmentApi.createOffer(data);
            if (onSuccess) onSuccess();
            onClose();
            alert('Offer draft created successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to create offer');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Create Offer for ${candidateName}`}>
            <div className={styles.publishContainer}>
                {error && <div className={styles.error}>{error}</div>}

                <OfferForm
                    applicationId={applicationId}
                    candidateId={candidateId}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                />
            </div>
        </Modal>
    );
}
