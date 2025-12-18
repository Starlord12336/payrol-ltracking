'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import OfferForm from '../../components/OfferForm';
import { recruitmentApi } from '../../api/recruitment.api';
import { CreateOfferDto } from '../../types';
import styles from '../../components/RecruitmentForms.module.css';

export default function CreateOfferPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const applicationId = searchParams.get('applicationId');
    const candidateId = searchParams.get('candidateId');
    const candidateName = searchParams.get('candidateName') || 'Candidate';

    if (!applicationId || !candidateId) {
        return <div className="p-4">Missing application or candidate information.</div>;
    }

    const handleSubmit = async (data: CreateOfferDto) => {
        if (!user || !user.userid) {
            alert('You must be logged in to create an offer.');
            return;
        }
        try {
            await recruitmentApi.createOffer({
                ...data,
                hrEmployeeId: user.userid
            });
            alert('Offer created successfully!');
            router.push('/modules/recruitment');
        } catch (error: any) {
            alert('Failed to create offer: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Button variant="ghost" onClick={() => router.back()}>
                    ← Back to Applications
                </Button>
            </div>
            <Card>
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                    Send Offer to {candidateName}
                </h2>
                <OfferForm
                    applicationId={applicationId}
                    candidateId={candidateId}
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                />
            </Card>
        </div>
    );
}
