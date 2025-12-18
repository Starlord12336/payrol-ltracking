'use client';

import { useState } from 'react';
import { Button, Modal, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import styles from './RecruitmentForms.module.css';

interface AdvanceStageModalProps {
    applicationId: string;
    candidateName: string;
    currentStage: string;
    onClose: () => void;
    onSuccess: () => void;
}

const COMMON_STAGES = [
    'Screening',
    'First Interview',
    'Technical Assessment',
    'Final Interview',
    'Offer Extension',
    'Hired'
];

export default function AdvanceStageModal({ applicationId, candidateName, currentStage, onClose, onSuccess }: AdvanceStageModalProps) {
    const [selectedStage, setSelectedStage] = useState(COMMON_STAGES[0]);
    const [customStage, setCustomStage] = useState('');
    const [useCustom, setUseCustom] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdvance = async () => {
        const stage = useCustom ? customStage : selectedStage;

        if (!stage.trim()) {
            setError('Please select or enter a stage.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await recruitmentApi.advanceApplication(applicationId, stage);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to advance application');
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Advance Candidate: ${candidateName}`}>
            <div className={styles.publishContainer}>
                <p>
                    Current Stage: <strong>{currentStage}</strong>
                </p>
                <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Select the next stage for this candidate.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New Stage</label>
                    {!useCustom ? (
                        <select
                            className={styles.input}
                            value={selectedStage}
                            onChange={(e) => setSelectedStage(e.target.value)}
                        >
                            {COMMON_STAGES.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    ) : (
                        <Input
                            id="customStage"
                            name="customStage"
                            type="text"
                            value={customStage}
                            onChange={(e) => setCustomStage(e.target.value)}
                            placeholder="Enter custom stage name"
                            fullWidth
                        />
                    )}

                    <button
                        type="button"
                        onClick={() => setUseCustom(!useCustom)}
                        style={{ background: 'none', border: 'none', color: '#dd0033', cursor: 'pointer', marginTop: '0.5rem', padding: 0, textDecoration: 'underline' }}
                    >
                        {useCustom ? 'Select from list' : 'Enter custom stage'}
                    </button>
                </div>

                {error && <div className={styles.error} style={{ marginTop: '1rem' }}>{error}</div>}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAdvance} disabled={loading}>
                        {loading ? 'Updating...' : 'Advance Stage'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
