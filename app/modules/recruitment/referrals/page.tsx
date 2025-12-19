'use client';

import { Suspense } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth'; // Adjust import if needed
import { Button, Card } from '@/shared/components';
import ReferralList from '../components/ReferralList';
import styles from '../page.module.css';

function ReferralsPageContent() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    const isHR = user && (user.roles.includes(SystemRole.SYSTEM_ADMIN) || user.roles.includes(SystemRole.HR_MANAGER) || user.roles.includes(SystemRole.RECRUITER));

    if (!isHR) {
        return <div>Access Denied. You must be an HR user/Recruiter.</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Recruitment Module</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Referrals</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <Card padding="lg">
                    <ReferralList />
                </Card>
            </div>
        </div>
    );
}

export default function ReferralsPage() {
    return (
        <Suspense fallback={<div>Loading page...</div>}>
            <ReferralsPageContent />
        </Suspense>
    );
}
