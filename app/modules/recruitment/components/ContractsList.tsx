import { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import styles from '../page.module.css';

interface ContractListProps {
    onSuccess?: (result: any) => void;
}

export default function ContractsList({ onSuccess }: ContractListProps) {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingProfile, setCreatingProfile] = useState<string | null>(null);

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listContracts();
            setContracts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProfile = async (contractId: string) => {
        try {
            setCreatingProfile(contractId);
            // In a real app, you'd get the current user ID. Hardcoding 'HR_USER' for now as per previous pattern or needing context.
            // However, the backend endpoint expects { createdBy: string }.
            const result = await recruitmentApi.createEmployeeFromContract(contractId, 'HR_ACTION');
            if (onSuccess) {
                // Show message before navigating
                if (result.message) alert(result.message);
                onSuccess(result);
            } else {
                alert(result.message || 'Employee profile created successfully!');
                loadContracts();
            }
        } catch (error: any) {
            console.error('Failed to create profile:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            if (error.response?.status === 409) {
                alert('Profile already exists. Refreshing list...');
                loadContracts();
            } else {
                alert(`Failed to create employee profile: ${errorMessage}`);
            }
        } finally {
            setCreatingProfile(null);
        }
    };

    if (loading) return <div>Loading contracts...</div>;

    return (
        <div className={styles.container}>
            <h2>Signed Contracts</h2>
            <p>Select a contract to create an employee profile.</p>

            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {contracts.length === 0 ? (
                    <p>No contracts found.</p>
                ) : (
                    contracts.map((contract) => {
                        const isFullySigned = !!(contract.employeeSignedAt && contract.employerSignedAt);
                        const candidate = contract.offerId?.candidateId;
                        const hasMissingData = !candidate?.nationalId || !candidate?.firstName || !candidate?.lastName;
                        const canCreateProfile = isFullySigned && !hasMissingData && !contract.hasProfile;

                        return (
                            <Card key={contract._id} padding="md">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3>{candidate?.firstName} {candidate?.lastName}</h3>
                                        <p><strong>Role:</strong> {contract.role}</p>
                                        <p><strong>Accepted:</strong> {new Date(contract.acceptanceDate).toLocaleDateString()}</p>
                                        <p><strong>Gross Salary:</strong> {contract.grossSalary}</p>
                                        <p>
                                            <strong>Signatures:</strong>{' '}
                                            <span style={{ color: contract.employeeSignedAt ? 'green' : 'orange' }}>
                                                Employee {contract.employeeSignedAt ? '✓' : '○'}
                                            </span>{' | '}
                                            <span style={{ color: contract.employerSignedAt ? 'green' : 'orange' }}>
                                                Employer {contract.employerSignedAt ? '✓' : '○'}
                                            </span>
                                        </p>
                                        {hasMissingData && (
                                            <p style={{ color: 'red', fontSize: '0.85rem' }}>
                                                ⚠️ Candidate missing required data (nationalId, name)
                                            </p>
                                        )}
                                    </div>
                                    {contract.hasProfile ? (
                                        <Button
                                            disabled
                                            variant="outline"
                                        >
                                            Profile Exists
                                        </Button>
                                    ) : !isFullySigned ? (
                                        <Button
                                            disabled
                                            variant="outline"
                                        >
                                            Awaiting Signatures
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleCreateProfile(contract._id)}
                                            disabled={loading || creatingProfile === contract._id || !canCreateProfile}
                                            variant="primary"
                                        >
                                            {creatingProfile === contract._id ? 'Creating...' : 'Create Employee Profile'}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
