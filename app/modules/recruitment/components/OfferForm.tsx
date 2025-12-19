'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { CreateOfferDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface OfferFormProps {
    applicationId: string;
    candidateId: string;
    onSubmit: (data: CreateOfferDto) => Promise<void>;
    onCancel: () => void;
}

export default function OfferForm({ applicationId, candidateId, onSubmit, onCancel }: OfferFormProps) {
    const [formData, setFormData] = useState<Partial<CreateOfferDto>>({
        applicationId,
        candidateId,
        grossSalary: 0,
        signingBonus: 0,
        role: '',
        deadline: '',
        content: 'We are pleased to offer you the position...',
        conditions: '',
        insurances: ''
    });
    const [loading, setLoading] = useState(false);
    const [benefitsStr, setBenefitsStr] = useState('');

    const handleChange = (field: keyof CreateOfferDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const benefits = benefitsStr.split(',').map(b => b.trim()).filter(b => b);

            await onSubmit({
                ...formData as CreateOfferDto,
                benefits,
                grossSalary: Number(formData.grossSalary),
                signingBonus: Number(formData.signingBonus)
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label>Job Role / Title</label>
                <Input
                    type="text"
                    value={formData.role || ''}
                    onChange={(e) => handleChange('role', e.target.value)}
                    required
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                    <label>Gross Salary</label>
                    <Input
                        type="number"
                        value={formData.grossSalary || ''}
                        onChange={(e) => handleChange('grossSalary', e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Signing Bonus</label>
                    <Input
                        type="number"
                        value={formData.signingBonus || ''}
                        onChange={(e) => handleChange('signingBonus', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Benefits (comma separated)</label>
                <Input
                    type="text"
                    value={benefitsStr}
                    onChange={(e) => setBenefitsStr(e.target.value)}
                    placeholder="Health Insurance, Gym membership, etc."
                />
            </div>

            <div className={styles.formGroup}>
                <label>Offer Deadline</label>
                <Input
                    type="date"
                    value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Insurances (Details)</label>
                <textarea
                    className={styles.textarea}
                    value={formData.insurances || ''}
                    onChange={(e) => handleChange('insurances', e.target.value)}
                    rows={2}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Conditions</label>
                <textarea
                    className={styles.textarea}
                    value={formData.conditions || ''}
                    onChange={(e) => handleChange('conditions', e.target.value)}
                    rows={2}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Offer Letter Content</label>
                <textarea
                    className={styles.textarea}
                    value={formData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    rows={5}
                    required
                />
            </div>

            <div className={styles.formActions}>
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Creating Draft...' : 'Create Offer Draft'}
                </Button>
            </div>
        </form>
    );
}
