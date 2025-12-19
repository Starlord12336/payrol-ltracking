'use client';

import { Suspense } from 'react';
import { Button } from '@/shared/components';
import AccessRevocationList from '../components/AccessRevocationList';
import styles from '../page.module.css';

function AccessRevocationPageContent() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Access Revocation</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Offboarding</span> / <span>Access Revocation</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <AccessRevocationList />
            </div>
        </div>
    );
}

export default function AccessRevocationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AccessRevocationPageContent />
        </Suspense>
    );
}
