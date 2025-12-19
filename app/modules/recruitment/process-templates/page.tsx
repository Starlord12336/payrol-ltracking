'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { Card } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import RecruitmentProcessTemplates from '../components/RecruitmentProcessTemplates';
import styles from '../page.module.css';

export default function ProcessTemplatesPage() {
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
                    <p>Please log in to manage process templates.</p>
                </Card>
            </div>
        );
    }

    // Allow HR Managers to manage process templates
    const isAuthorized =
        user.roles?.includes(SystemRole.HR_MANAGER) ||
        user.roles?.includes(SystemRole.HR_ADMIN) ||
        user.roles?.includes(SystemRole.SYSTEM_ADMIN);

    if (!isAuthorized) {
        return (
            <div className={styles.container}>
                <Card padding="lg" shadow="warm">
                    <p>You don&apos;t have permission to manage process templates.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card padding="lg" shadow="warm">
                <div style={{ marginBottom: '1rem' }}>
                    <h1>Hiring Process Templates</h1>
                    <p>Define custom recruitment workflows and stages</p>
                </div>
                <RecruitmentProcessTemplates />
            </Card>
        </div>
    );
}
