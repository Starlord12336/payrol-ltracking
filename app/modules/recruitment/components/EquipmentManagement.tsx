'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { CreateEquipmentDto, AssignEquipmentDto } from '../types';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './RecruitmentForms.module.css';

interface EquipmentManagementProps {
    employeeId: string;
    onSuccess?: () => void;
}

export default function EquipmentManagement({ employeeId, onSuccess }: EquipmentManagementProps) {
    const { user } = useAuth();
    const [itemType, setItemType] = useState('laptop');
    const [preferredModel, setPreferredModel] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const equipmentTypes = ['laptop', 'phone', 'badge', 'monitor', 'keyboard', 'mouse', 'headset'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const dto: CreateEquipmentDto = {
                itemType,
                preferredModel: preferredModel || undefined,
                requestedBy: user?.userid || 'hr-admin'
            };

            await recruitmentApi.createEquipmentRequest(employeeId, dto);
            setMessage({ type: 'success', text: `Equipment request for ${itemType} created successfully!` });
            setItemType('laptop');
            setPreferredModel('');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to create request' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="lg">
            <h3>Request Equipment for Employee</h3>
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
                    <label>Equipment Type</label>
                    <select
                        className={styles.input}
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                    >
                        {equipmentTypes.map((type) => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Preferred Model (Optional)</label>
                    <Input
                        placeholder="e.g., MacBook Pro 14&quot;, iPhone 15"
                        value={preferredModel}
                        onChange={(e) => setPreferredModel(e.target.value)}
                    />
                </div>

                <div className={styles.formActions}>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Requesting...' : 'Create Equipment Request'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
