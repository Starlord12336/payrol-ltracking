'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';

interface SystemAccessPanelProps {
    employeeId?: string;
    onSuccess?: (result: any) => void;
}

const ACCESS_TYPES = [
    { value: 'email', label: 'Email Access' },
    { value: 'payroll', label: 'Payroll System' },
    { value: 'erp', label: 'ERP System' },
    { value: 'vpn', label: 'VPN Access' },
    { value: 'building', label: 'Building Access' },
    { value: 'parking', label: 'Parking Access' },
];

const RESOURCES = [
    { value: 'email_account', label: 'Corporate Email Account' },
    { value: 'active_directory', label: 'Active Directory' },
    { value: 'slack', label: 'Slack Workspace' },
    { value: 'jira', label: 'JIRA / Project Management' },
    { value: 'github', label: 'GitHub / Source Code' },
    { value: 'timesheet', label: 'Timesheet System' },
];

export default function SystemAccessPanel({ employeeId: initialEmployeeId, onSuccess }: SystemAccessPanelProps) {
    const [employeeId, setEmployeeId] = useState(initialEmployeeId || '');
    const [resource, setResource] = useState('email_account');
    const [accessType, setAccessType] = useState('email');
    const [requestedBy, setRequestedBy] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // For access revocation
    const [taskIndex, setTaskIndex] = useState('');
    const [revocationDate, setRevocationDate] = useState('');
    const [revocationReason, setRevocationReason] = useState('');

    const handleProvisionAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId.trim()) {
            setError('Employee ID is required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await recruitmentApi.createAccessRequest(employeeId, {
                resource,
                accessType,
                requestedBy: requestedBy || undefined,
            });
            setSuccess(`Access request created! Task Index: ${result.taskIndex}`);
            onSuccess?.(result);
        } catch (err: any) {
            setError(err.message || 'Failed to create access request');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleRevocation = async () => {
        if (!employeeId.trim() || !taskIndex.trim() || !revocationDate) {
            setError('Employee ID, Task Index, and Revocation Date are required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await recruitmentApi.scheduleAccessRevocation(
                employeeId,
                parseInt(taskIndex, 10),
                revocationDate,
                revocationReason || undefined
            );
            setSuccess(`Access revocation scheduled for ${result.scheduledRevocationDate}`);
            onSuccess?.(result);
        } catch (err: any) {
            setError(err.message || 'Failed to schedule revocation');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelNoShow = async () => {
        if (!employeeId.trim()) {
            setError('Employee ID is required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await recruitmentApi.cancelNoShowAccess(employeeId, revocationReason || undefined);
            setSuccess(`No-show access cancelled! ${result.cancelledTasks} tasks cancelled.`);
            onSuccess?.(result);
        } catch (err: any) {
            setError(err.message || 'Failed to cancel access');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ONB-009: Provision System Access */}
            <Card padding="lg">
                <h3 style={{ marginBottom: '1rem' }}>Provision System Access (ONB-009)</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    Provision access to payroll, email, and internal systems. Automated provisioning available.
                </p>

                <form onSubmit={handleProvisionAccess}>
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
                                placeholder="Requester ID (optional)"
                                value={requestedBy}
                                onChange={(e) => setRequestedBy(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Resource</label>
                            <select
                                value={resource}
                                onChange={(e) => setResource(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                {RESOURCES.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Access Type</label>
                            <select
                                value={accessType}
                                onChange={(e) => setAccessType(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                {ACCESS_TYPES.map((a) => (
                                    <option key={a.value} value={a.value}>{a.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Provisioning...' : 'Provision Access'}
                    </Button>
                </form>
            </Card>

            {/* ONB-013: Access Management */}
            <Card padding="lg">
                <h3 style={{ marginBottom: '1rem' }}>Access Management (ONB-013)</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    Schedule access activation and revocation. Supports no-show cancellation.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Task Index</label>
                        <Input
                            placeholder="Access task index"
                            value={taskIndex}
                            onChange={(e) => setTaskIndex(e.target.value)}
                            type="number"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Revocation Date</label>
                        <Input
                            type="datetime-local"
                            value={revocationDate}
                            onChange={(e) => setRevocationDate(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Reason (optional)</label>
                    <Input
                        placeholder="Enter reason for revocation/cancellation"
                        value={revocationReason}
                        onChange={(e) => setRevocationReason(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" onClick={handleScheduleRevocation} disabled={loading}>
                        Schedule Revocation
                    </Button>
                    <Button variant="error" onClick={handleCancelNoShow} disabled={loading}>
                        Cancel No-Show Access
                    </Button>
                </div>
            </Card>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
}
