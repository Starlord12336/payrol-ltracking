'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Modal } from '@/shared/components';
import { Select } from './Select';
import { recruitmentApi } from '../api/recruitment.api';
import { ScheduleInterviewDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface ScheduleInterviewModalProps {
    applicationId: string;
    candidateName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ScheduleInterviewModal({ applicationId, candidateName, onClose, onSuccess }: ScheduleInterviewModalProps) {
    const [formData, setFormData] = useState<ScheduleInterviewDto>({
        applicationId,
        stage: 'screening',
        scheduledDate: '',
        method: 'video',
        panelEmails: [],
        durationMinutes: 60,
        videoLink: ''
    });

    // UI Logic
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!formData.scheduledDate) {
            setError('Date and time are required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Format date to ISO string if possible, or send as is if backend handles it.
            // datetime-local gives 'YYYY-MM-DDTHH:mm', backend IsDateString often expects full ISO.
            // Let's create a proper Date object and send ISO string.
            const dateObj = new Date(formData.scheduledDate);
            const isoDate = dateObj.toISOString();

            await recruitmentApi.scheduleInterview({
                ...formData,
                scheduledDate: isoDate,
                // Panel emails and IDs are now removed from UI, passing empty list or preserved state if any (empty in init)
            } as any);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Schedule Interview: ${candidateName}`}>
            <div className={styles.publishContainer}>

                <div className={styles.formGroup}>
                    <Select
                        label="Interview Stage"
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        options={[
                            { value: 'screening', label: 'Screening' },
                            { value: 'hr_interview', label: 'HR Interview' },
                            { value: 'department_interview', label: 'Department Interview' },
                            { value: 'offer', label: 'Offer Round' },
                        ]}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Date & Time</label>
                    <input
                        type="datetime-local"
                        className={styles.input} // reusing class if possible or style it
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <Select
                        label="Method"
                        value={formData.method}
                        onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                        options={[
                            { value: 'video', label: 'Video Call' },
                            { value: 'in-person', label: 'In Person' },
                            { value: 'phone', label: 'Phone Call' },
                        ]}
                    />
                </div>

                {formData.method === 'video' && (
                    <div className={styles.formGroup}>
                        <Input
                            label="Video Link (Optional)"
                            value={formData.videoLink || ''}
                            onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                            fullWidth
                            placeholder="e.g. Zoom or Google Meet link"
                        />
                    </div>
                )}

                <div className={styles.formGroup}>
                    <Input
                        label="Duration (minutes)"
                        type="number"
                        value={formData.durationMinutes.toString()}
                        onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                        fullWidth
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Scheduling...' : 'Schedule Interview'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
