'use client';

import AccessRevocationList from './AccessRevocationList';
import { Card } from '@/shared/components';

export default function AdminOffboardingView() {
    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>HR Admin Offboarding Console</h2>
                <p style={{ color: '#666' }}>Manage system access and critical offboarding tasks.</p>
            </div>

            <AccessRevocationList />
        </div>
    );
}
