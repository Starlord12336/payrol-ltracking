'use client';

import { Suspense } from 'react';
import { Button } from '@/shared/components';
import SigningBonusList from '../components/SigningBonusList';
import styles from '../page.module.css';

function SigningBonusPageContent() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Signing Bonuses</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Onboarding</span> / <span>Signing Bonus</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <SigningBonusList />
            </div>
        </div>
    );
}

export default function SigningBonusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SigningBonusPageContent />
        </Suspense>
    );
}
