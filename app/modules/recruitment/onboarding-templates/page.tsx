'use client';

import { Suspense } from 'react';
import { Button } from '@/shared/components';
import ChecklistTemplateForm from '../components/ChecklistTemplateForm';
import styles from '../page.module.css';

function OnboardingTemplatesPageContent() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Onboarding Templates</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Onboarding</span> / <span>Templates</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <ChecklistTemplateForm />
                </div>
            </div>
        </div>
    );
}

export default function OnboardingTemplatesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingTemplatesPageContent />
        </Suspense>
    );
}
