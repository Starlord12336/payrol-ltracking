'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { Card } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth'; // Ensure this path is correct
import ApplicationList from '../components/ApplicationList';
import styles from '../page.module.css';

export default function MyApplicationsPage() {
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
                    <p>Please log in to view your applications.</p>
                </Card>
            </div>
        );
    }

    // Only candidates should access this page
    // Note: SystemRole.JOB_CANDIDATE is likely 'JOB_CANDIDATE' or similar. 
    // We should also check userType if possible, but role check is standard.
    const isCandidate = user.roles?.includes(SystemRole.JOB_CANDIDATE);

    if (!isCandidate) {
        return (
            <div className={styles.container}>
                <Card padding="lg" shadow="warm">
                    <p>This page is for candidates only.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card padding="lg" shadow="warm">
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1>My Applications</h1>
                    <p>Track the status of your job applications</p>
                </div>
                <ApplicationList />
            </Card>
        </div>
    );
}
