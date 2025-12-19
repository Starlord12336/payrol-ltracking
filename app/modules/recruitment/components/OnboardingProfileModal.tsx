'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './RecruitmentForms.module.css';

interface OnboardingProfileModalProps {
    contractId: string; // The backend treats offerId as contractId in some contexts, but usually they are distinct.
    // Assuming contractId is the offerId for this flow based on how create-profile works in backend (usually links offer)
    // Or if backend generates a contract doc ID.
    // Based on controller, it takes "contractId" param.
    // Let's assume for now we pass the Offer ID if that's what serves as contract ID, or we need to find the specific contract document ID.
    // Re-reading controller: `onboarding/contract/:contractId`. Ideally this is the signed contract.
    candidateName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function OnboardingProfileModal({ contractId, candidateName, onClose, onSuccess }: OnboardingProfileModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [contractDetails, setContractDetails] = useState<any>(null);

    useEffect(() => {
        // Fetch contract details to show preview before creation
        const fetchDetails = async () => {
            try {
                const data = await recruitmentApi.getContractDetails(contractId);
                setContractDetails(data);
            } catch (error) {
                console.error('Failed to fetch contract details', error);
            }
        };
        fetchDetails();
    }, [contractId]);

    const handleCreateProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await recruitmentApi.createEmployeeProfile(contractId, user.userid || 'hr-admin');
            alert('Employee Profile Created Successfully! Employee Number generated.');
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(`Failed to create profile: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Onboard Candidate: ${candidateName}`}>
            <div className={styles.publishContainer}>
                <p>Verify contract details below before creating the official employee record.</p>

                {contractDetails ? (
                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '4px', margin: '1rem 0', fontSize: '0.9rem' }}>
                        <p><strong>Role:</strong> {contractDetails.role || 'N/A'}</p>
                        <p><strong>Start Date:</strong> {contractDetails.startDate || 'N/A'}</p>
                        <p><strong>Salary:</strong> {contractDetails.salary || contractDetails.grossSalary || 'N/A'}</p>
                        <p><strong>Candidate Email:</strong> {contractDetails.candidateEmail || 'N/A'}</p>
                        {/* Add more fields as per actual API response */}
                    </div>
                ) : (
                    <p>Loading contract details...</p>
                )}

                <div className={styles.formActions}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateProfile} disabled={loading || !contractDetails}>
                        {loading ? 'Creating...' : 'Create Employee Profile'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
