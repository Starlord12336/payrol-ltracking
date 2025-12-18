'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import ResignationForm from '../components/ResignationForm';
import styles from '../page.module.css';

function ResignationPageContent() {
    const { user, isLoading } = useAuth();
    const [hasActiveResignation, setHasActiveResignation] = useState<boolean | null>(null);
    const [resignationData, setResignationData] = useState<any>(null);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        if (user) {
            checkResignationStatus();
        }
    }, [user]);

    const checkResignationStatus = async () => {
        if (!user) return;
        try {
            setCheckingStatus(true);
            const userId = user.userid;
            if (!userId) {
                setHasActiveResignation(false);
                return;
            }
            const data = await recruitmentApi.getEmployeeResignations(userId);
            if (data && data.totalResignations > 0 && data.pendingResignations > 0) {
                setHasActiveResignation(true);
                setResignationData(data); // In real app, we'd fetch the specific active one details
            } else {
                setHasActiveResignation(false);
            }
        } catch (err) {
            console.error('Failed to check resignation status', err);
            setHasActiveResignation(false);
        } finally {
            setCheckingStatus(false);
        }
    };

    if (isLoading || checkingStatus) return <div>Loading...</div>;
    if (!user) return <div>Please log in.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Self Service</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Resignation</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment Module
                    </Button>
                </div>

                {hasActiveResignation ? (
                    <Card padding="lg">
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <h2 style={{ color: '#f59e0b' }}>Resignation Request Pending</h2>
                            <p>You have an active resignation request that is currently under review.</p>
                            <p style={{ marginTop: '1rem', color: '#666' }}>
                                Please contact HR if you need to make changes or withdraw your request.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <ResignationForm
                        employeeId={user.userid || ''}
                        onSuccess={() => {
                            alert('Resignation submitted successfully.');
                            checkResignationStatus();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default function ResignationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResignationPageContent />
        </Suspense>
    );
}
