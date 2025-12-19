'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { CreateBenefitsDto } from '../types';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './RecruitmentForms.module.css';

interface BenefitsEnrollmentProps {
    employeeId: string;
    onSuccess?: () => void;
}

const benefitPlans = [
    { id: 'health', name: 'Health Insurance', options: ['Basic', 'Standard', 'Premium'] },
    { id: 'dental', name: 'Dental Insurance', options: ['Basic', 'Premium'] },
    { id: 'vision', name: 'Vision Insurance', options: ['Basic', 'Premium'] },
    { id: 'pension', name: 'Pension Plan', options: ['5%', '10%', '15%'] },
    { id: 'life', name: 'Life Insurance', options: ['1x Salary', '2x Salary', '3x Salary'] },
];

export default function BenefitsEnrollment({ employeeId, onSuccess }: BenefitsEnrollmentProps) {
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState('health');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const currentPlan = benefitPlans.find(p => p.id === selectedPlan);

    const toggleOption = (option: string) => {
        setSelectedOptions(prev =>
            prev.includes(option)
                ? prev.filter(o => o !== option)
                : [...prev, option]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOptions.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one option' });
            return;
        }

        setMessage(null);
        setLoading(true);

        try {
            const dto: CreateBenefitsDto = {
                planType: selectedPlan,
                options: selectedOptions,
                initiatedBy: user?.userid || 'hr-admin'
            };

            await recruitmentApi.createBenefitsRequest(employeeId, dto);
            setMessage({ type: 'success', text: `Benefits enrollment for ${currentPlan?.name} submitted!` });
            setSelectedOptions([]);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to submit enrollment' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="lg">
            <h3>Benefits Enrollment</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Employee ID: <strong>{employeeId}</strong>
            </p>

            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Select Benefit Plan</label>
                    <select
                        className={styles.input}
                        value={selectedPlan}
                        onChange={(e) => { setSelectedPlan(e.target.value); setSelectedOptions([]); }}
                    >
                        {benefitPlans.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Select Options</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {currentPlan?.options.map(option => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => toggleOption(option)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: selectedOptions.includes(option) ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                    backgroundColor: selectedOptions.includes(option) ? '#eff6ff' : 'white',
                                    color: selectedOptions.includes(option) ? '#2563eb' : '#374151',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Enroll in Benefits'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
