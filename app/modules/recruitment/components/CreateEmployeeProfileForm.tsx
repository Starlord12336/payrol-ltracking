'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';

interface CreateEmployeeProfileFormProps {
    onSuccess?: (result: any) => void;
}

export default function CreateEmployeeProfileForm({ onSuccess }: CreateEmployeeProfileFormProps) {
    const [contractId, setContractId] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [contractDetails, setContractDetails] = useState<any>(null);

    const handleFetchContract = async () => {
        if (!contractId.trim()) return;
        setLoading(true);
        setError('');
        try {
            const details = await recruitmentApi.getContractDetails(contractId);
            setContractDetails(details);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch contract details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contractId.trim() || !createdBy.trim()) {
            setError('Contract ID and Created By are required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await recruitmentApi.createEmployeeFromContract(contractId, createdBy);
            setSuccess(`Employee profile created! Employee #: ${result.employeeNumber}`);
            onSuccess?.(result);
        } catch (err: any) {
            setError(err.message || 'Failed to create employee profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="lg">
            <h3 style={{ marginBottom: '1rem' }}>Create Employee Profile (ONB-002)</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Create an employee profile from a signed contract. This triggers after offer acceptance.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Input
                        placeholder="Contract ID"
                        value={contractId}
                        onChange={(e) => setContractId(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <Button type="button" variant="outline" onClick={handleFetchContract} disabled={loading}>
                        Fetch Details
                    </Button>
                </div>

                {contractDetails && (
                    <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        <h4>Contract Details</h4>
                        <p><strong>Candidate:</strong> {contractDetails.candidateFirstName} {contractDetails.candidateLastName}</p>
                        <p><strong>National ID:</strong> {contractDetails.candidateNationalId}</p>
                        <p><strong>Role:</strong> {contractDetails.role}</p>
                        <p><strong>Gross Salary:</strong> {contractDetails.grossSalary}</p>
                        {contractDetails.signingBonus && <p><strong>Signing Bonus:</strong> {contractDetails.signingBonus}</p>}
                        <p><strong>Valid for Profile Creation:</strong> {contractDetails.isValidForProfileCreation ? '✅ Yes' : '❌ No (signatures required)'}</p>
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <Input
                        placeholder="Created By (HR Employee ID)"
                        value={createdBy}
                        onChange={(e) => setCreatedBy(e.target.value)}
                    />
                </div>

                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                {success && <p style={{ color: 'green', marginBottom: '1rem' }}>{success}</p>}

                <Button type="submit" variant="primary" disabled={loading || !contractDetails?.isValidForProfileCreation}>
                    {loading ? 'Creating...' : 'Create Employee Profile'}
                </Button>
            </form>
        </Card>
    );
}
