'use client';

import { Suspense } from 'react';
import { Button } from '@/shared/components';
import DocumentVerificationList from '../components/DocumentVerificationList';
import styles from '../page.module.css';

function DocumentVerificationPageContent() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Document Verification</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Onboarding</span> / <span>Verify</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <DocumentVerificationList />
            </div>
        </div>
    );
}

export default function DocumentVerificationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DocumentVerificationPageContent />
        </Suspense>
    );
}
