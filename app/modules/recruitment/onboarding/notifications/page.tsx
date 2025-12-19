'use client';

import { Suspense } from 'react';
import { Card, Button } from '@/shared/components';

function NotificationsPageContent() {
    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1>Onboarding Notifications (ONB-005)</h1>
                <p style={{ color: '#666' }}>Track and manage automated onboarding notifications.</p>
            </div>

            <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/onboarding'} style={{ marginBottom: '1.5rem' }}>
                Back to Onboarding
            </Button>

            <Card padding="lg">
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <h3>🔔 Notifications Center</h3>
                    <p style={{ marginTop: '1rem', color: '#666' }}>
                        This feature is currently under development.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
                        Features will include: Email Logs, Reminder Configuration, and Manual Triggers.
                    </p>
                </div>
            </Card>
        </div>
    );
}

export default function NotificationsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NotificationsPageContent />
        </Suspense>
    );
}
