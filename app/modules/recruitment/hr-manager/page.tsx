'use client';

import { Suspense } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { Button, Card } from '@/shared/components';
import HRManagerDashboard from '../components/HRManagerDashboard';
import styles from '../page.module.css';

function HRManagerPageContent() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className={styles.container}>
                <Card padding="lg" shadow="warm">
                    <div className={styles.loading}>Loading...</div>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <Card padding="lg" shadow="warm">
                    <p>Please log in to access the HR Manager Dashboard.</p>
                </Card>
            </div>
        );
    }

    // Check if user has HR Manager permissions
    const isHRManager =
        user.roles?.includes(SystemRole.HR_MANAGER) ||
        user.roles?.includes(SystemRole.HR_ADMIN) ||
        user.roles?.includes(SystemRole.SYSTEM_ADMIN);

    if (!isHRManager) {
        return (
            <div className={styles.container}>
                <Card padding="lg" shadow="warm">
                    <h2>Access Denied</h2>
                    <p>You don&apos;t have permission to access the HR Manager Dashboard.</p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Required roles: HR Manager, HR Admin, or System Admin
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/modules/recruitment/recruitent'}
                        style={{ marginTop: '1rem' }}
                    >
                        ← Back to Recruitment
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Recruitment Module</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>HR Manager</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1rem' }}>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/modules/recruitment/recruitent'}
                    >
                        ← Back to Recruitment Navigation
                    </Button>
                </div>

                <HRManagerDashboard />
            </div>
        </div>
    );
}

export default function HRManagerPage() {
    return (
        <Suspense fallback={<div>Loading page...</div>}>
            <HRManagerPageContent />
        </Suspense>
    );
}
