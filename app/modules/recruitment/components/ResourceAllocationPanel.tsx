'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';

interface ResourceAllocationPanelProps {
    employeeId?: string;
    onSuccess?: (result: any) => void;
}

const EQUIPMENT_TYPES = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'desktop', label: 'Desktop Computer' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'phone', label: 'Desk Phone' },
    { value: 'mobile', label: 'Mobile Phone' },
    { value: 'headset', label: 'Headset' },
    { value: 'keyboard', label: 'Keyboard & Mouse' },
    { value: 'desk', label: 'Desk/Workstation' },
    { value: 'chair', label: 'Office Chair' },
    { value: 'access_card', label: 'Access Card / Badge' },
    { value: 'parking', label: 'Parking Pass' },
    { value: 'locker', label: 'Locker' },
];

export default function ResourceAllocationPanel({ employeeId: initialEmployeeId, onSuccess }: ResourceAllocationPanelProps) {
    const [employeeId, setEmployeeId] = useState(initialEmployeeId || '');
    const [itemType, setItemType] = useState('laptop');
    const [preferredModel, setPreferredModel] = useState('');
    const [requestedBy, setRequestedBy] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [allocatedResources, setAllocatedResources] = useState<any[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId.trim()) {
            setError('Employee ID is required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await recruitmentApi.createResourceRequest(employeeId, {
                itemType,
                preferredModel: preferredModel || undefined,
                requestedBy: requestedBy || undefined,
            });
            setSuccess(`Resource request created! Task Index: ${result.taskIndex}`);
            setAllocatedResources([...allocatedResources, { itemType, preferredModel, taskIndex: result.taskIndex }]);
            setPreferredModel('');
            onSuccess?.(result);
        } catch (err: any) {
            setError(err.message || 'Failed to create resource request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="lg">
            <h3 style={{ marginBottom: '1rem' }}>Allocate Resources (ONB-012)</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Reserve equipment, desk, and access cards for new hires. Resources should be ready on Day 1.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Employee ID</label>
                        <Input
                            placeholder="Enter Employee ID"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            disabled={!!initialEmployeeId}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Requested By</label>
                        <Input
                            placeholder="HR Employee ID (optional)"
                            value={requestedBy}
                            onChange={(e) => setRequestedBy(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Equipment Type</label>
                        <select
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        >
                            {EQUIPMENT_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Preferred Model</label>
                        <Input
                            placeholder="e.g., MacBook Pro 14&quot;"
                            value={preferredModel}
                            onChange={(e) => setPreferredModel(e.target.value)}
                        />
                    </div>
                </div>

                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                {success && <p style={{ color: 'green', marginBottom: '1rem' }}>{success}</p>}

                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Allocating...' : 'Allocate Resource'}
                </Button>
            </form>

            {allocatedResources.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                    <h4>Allocated Resources</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {allocatedResources.map((res, idx) => (
                            <li key={idx} style={{ padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px', marginBottom: '0.5rem' }}>
                                <strong>{res.itemType}</strong>
                                {res.preferredModel && ` - ${res.preferredModel}`}
                                <span style={{ color: '#666', marginLeft: '0.5rem' }}>(Task #{res.taskIndex})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
}
