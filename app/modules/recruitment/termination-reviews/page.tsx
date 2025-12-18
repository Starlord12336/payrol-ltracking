'use client';

import { Suspense } from 'react';
import { Button } from '@/shared/components';
import TerminationReviewList from '../components/TerminationReviewList';
import styles from '../page.module.css';

function TerminationReviewsPageContent() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Termination Reviews</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Offboarding</span> / <span>Termination Reviews</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <TerminationReviewList />
            </div>
        </div>
    );
}

export default function TerminationReviewsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TerminationReviewsPageContent />
        </Suspense>
    );
}
