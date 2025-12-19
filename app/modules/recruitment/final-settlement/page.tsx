'use client';

import { Suspense } from 'react';
import { Button } from '@/shared/components';
import FinalSettlement from '../components/FinalSettlement';
import styles from '../page.module.css';

function FinalSettlementPageContent() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Final Settlement</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Offboarding</span> / <span>Final Settlement</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <FinalSettlement />
            </div>
        </div>
    );
}

export default function FinalSettlementPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FinalSettlementPageContent />
        </Suspense>
    );
}
