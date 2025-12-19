'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { Card } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth'; // Ensure this path is correct
import RecruitmentTemplates from '../components/RecruitmentTemplates';
import styles from '../page.module.css';

export default function TemplatesPage() {
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
                    <p>Please log in to manage templates.</p>
                </Card>
            </div>
        );
    }

    const isHRUser =
        user.roles?.includes(SystemRole.HR_EMPLOYEE) ||
        user.roles?.includes(SystemRole.HR_MANAGER) ||
        user.roles?.includes(SystemRole.RECRUITER) ||
        user.roles?.includes(SystemRole.HR_ADMIN) ||
        user.roles?.includes(SystemRole.SYSTEM_ADMIN);

    if (!isHRUser) {
        return (
            <div className={styles.container}>
                <Card padding="lg" shadow="warm">
                    <p>You don&apos;t have permission to manage templates.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card padding="lg" shadow="warm">
                <div style={{ marginBottom: '1rem' }}>
                    <h1>Recruitment Templates</h1>
                    <p>Manage job templates for your organization</p>
                </div>
                <RecruitmentTemplates />
            </Card>
        </div>
    );
}
