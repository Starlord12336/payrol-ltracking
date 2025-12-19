'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';

interface PayrollInitiationPanelProps {
    employeeId?: string;
    contractId?: string;
    onSuccess?: (result: any) => void;
}

const PAYROLL_TYPES = [
    { value: 'salary', label: 'Base Salary' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'allowance', label: 'Allowance' },
    { value: 'deduction', label: 'Deduction' },
    { value: 'tax', label: 'Tax Setup' },
    { value: 'insurance', label: 'Insurance' },
];

const FREQUENCIES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'biweekly', label: 'Bi-Weekly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'one-time', label: 'One-Time' },
];

export default function PayrollInitiationPanel({ employeeId: initialEmployeeId, contractId: initialContractId, onSuccess }: PayrollInitiationPanelProps) {
    const [employeeId, setEmployeeId] = useState(initialEmployeeId || '');
    const [contractId, setContractId] = useState(initialContractId || '');
    const [payrollType, setPayrollType] = useState('salary');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [initiatedBy, setInitiatedBy] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePayrollInitiation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId.trim()) {
            setError('Employee ID is required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await recruitmentApi.createPayrollInitiation(employeeId, {
                payrollType,
                amount: amount ? parseFloat(amount) : undefined,
                frequency,
                initiatedBy: initiatedBy || undefined,
            });
            setSuccess(`Payroll setup created! Task Index: ${result.taskIndex}`);
            onSuccess?.(result);
        } catch (err: any) {
            setError(err.message || 'Failed to initiate payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleSigningBonus = async () => {
        if (!employeeId.trim() || !contractId.trim()) {
            setError('Employee ID and Contract ID are required for signing bonus');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await recruitmentApi.processSigningBonus(employeeId, contractId);
            if (result.success) {
                setSuccess(`Signing bonus of ${result.amount} processed! Task Index: ${result.taskIndex}`);
            } else {
                setError(result.message || 'No signing bonus to process');
            }
            onSuccess?.(result);
        } catch (err: any) {
            setError(err.message || 'Failed to process signing bonus');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ONB-018: Payroll Initiation */}
            <Card padding="lg">
                <h3 style={{ marginBottom: '1rem' }}>Payroll Initiation (ONB-018)</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    Automatically initiate payroll setup for new employees.
                </p>

                <form onSubmit={handlePayrollInitiation}>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Initiated By</label>
                            <Input
                                placeholder="HR Manager ID (optional)"
                                value={initiatedBy}
                                onChange={(e) => setInitiatedBy(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Payroll Type</label>
                            <select
                                value={payrollType}
                                onChange={(e) => setPayrollType(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                {PAYROLL_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount</label>
                            <Input
                                type="number"
                                placeholder="Amount (optional)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Frequency</label>
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                {FREQUENCIES.map((f) => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Initiating...' : 'Initiate Payroll'}
                    </Button>
                </form>
            </Card>

            {/* ONB-019: Process Signing Bonus */}
            <Card padding="lg">
                <h3 style={{ marginBottom: '1rem' }}>Process Signing Bonus (ONB-019)</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    Automatically process signing bonus from contract and add to payroll.
                </p>

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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Contract ID</label>
                        <Input
                            placeholder="Enter Contract ID"
                            value={contractId}
                            onChange={(e) => setContractId(e.target.value)}
                            disabled={!!initialContractId}
                        />
                    </div>
                </div>

                <Button variant="primary" onClick={handleSigningBonus} disabled={loading}>
                    {loading ? 'Processing...' : 'Process Signing Bonus'}
                </Button>
            </Card>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
}
