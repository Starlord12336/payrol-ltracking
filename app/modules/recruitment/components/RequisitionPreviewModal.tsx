'use client';

import { useEffect, useState } from 'react';
import { Button, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { JobRequisition } from '../types';
import styles from './RecruitmentForms.module.css';

interface RequisitionPreviewModalProps {
    requisitionId: string;
    onClose: () => void;
}

export default function RequisitionPreviewModal({ requisitionId, onClose }: RequisitionPreviewModalProps) {
    const [requisition, setRequisition] = useState<JobRequisition | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPreview();
    }, [requisitionId]);

    const loadPreview = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.previewRequisition(requisitionId);
            setRequisition(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load preview');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Modal isOpen={true} onClose={onClose} title="Loading..."><div className={styles.loading}>Loading preview...</div></Modal>;
    if (error) return <Modal isOpen={true} onClose={onClose} title="Error"><div className={styles.error}>{error}</div></Modal>;
    if (!requisition) return null;

    return (
        <Modal isOpen={true} onClose={onClose} title="Job Requisition Preview">
            <div className={styles.previewContainer}>
                <div className={styles.previewHeader}>
                    <h3>{requisition.jobTitle}</h3>
                    <span className={styles.badge}>{requisition.department}</span>
                    <span className={styles.badge}>{requisition.location}</span>
                </div>

                <section className={styles.previewSection}>
                    <h4>Description</h4>
                    <p>{requisition.description}</p>
                </section>

                <section className={styles.previewSection}>
                    <h4>Qualifications</h4>
                    <ul>
                        {requisition.qualifications.map((q, i) => (
                            <li key={i}>{q}</li>
                        ))}
                    </ul>
                </section>

                <section className={styles.previewSection}>
                    <h4>Details</h4>
                    <p><strong>Salary:</strong> {requisition.salary?.min} - {requisition.salary?.max} {requisition.salary?.currency}</p>
                    <p><strong>Employment Type:</strong> {requisition.employmentType}</p>
                    <p><strong>Openings:</strong> {requisition.numberOfPositions}</p>
                    <p><strong>Urgency:</strong> {requisition.urgency}</p>
                </section>

                <div className={styles.previewActions}>
                    <Button variant="outline" onClick={onClose}>Close Preview</Button>
                </div>
            </div>
        </Modal>
    );
}
