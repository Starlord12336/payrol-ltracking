'use client';

import { useRouter } from 'next/navigation';
import { Button, Card } from '@/shared/components';
import styles from '../page.module.css';

export default function RecruitmentRedirectPage() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <Card padding="lg" shadow="warm">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h1 style={{ marginBottom: '1.5rem' }}>Recruitment Navigation</h1>
                    <p style={{ marginBottom: '2rem' }}>
                        Choose an option below to manage recruitment templates and postings.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="primary"
                            onClick={() => router.push('/modules/recruitment/hr-manager')}
                        >
                            HR Manager Dashboard
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => router.push('/modules/recruitment')}
                        >
                            Go to Job Postings (HR)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment?tab=applications')}
                        >
                            Candidate Tracking (REC-008)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment?tab=applications')}
                        >
                            Go to Applications (HR)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/my-applications')}
                        >
                            My Applications (Candidate)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/templates')}
                        >
                            Go to Job Templates
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/process-templates')}
                        >
                            Go to Process Templates
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/referrals')}
                        >
                            Referrals (REC-030)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/onboarding-templates')}
                        >
                            Onboarding Templates (ONB-001)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/document-verification')}
                        >
                            Verify Documents (ONB-002)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/onboarding-tracker')}
                        >
                            Onboarding Tracker (ONB-005)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/equipment')}
                        >
                            Equipment Provisioning (ONB-007)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/dashboard')}
                        >
                            Assessment Forms (REC-020)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/benefits')}
                        >
                            Benefits Enrollment (ONB-018)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/signing-bonus')}
                        >
                            Signing Bonus (ONB-019)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/dashboard')}
                        >
                            Analytics Dashboard (REC-009)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/panel')}
                        >
                            Panel Management (REC-021)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/offboarding')}
                        >
                            Offboarding (ONB-012)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/termination-reviews')}
                        >
                            Termination Reviews (OFF-001)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/access-revocation')}
                        >
                            Access Revocation (OFF-007)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/clearance')}
                        >
                            Clearance Tracking (ONB-013)
                        </Button>
                        <Button
                            variant="error"
                            onClick={() => router.push('/modules/recruitment/resignation')}
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                            Submit Resignation (REC-018)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/final-settlement')}
                        >
                            Final Settlement (OFF-013)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/modules/recruitment/referrals')}
                        >
                            Referrals Dashboard (REC-030)
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
