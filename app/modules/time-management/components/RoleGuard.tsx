"use client";

import React from 'react';
import { useAuth } from '@/shared/hooks';
import { SystemRole } from '@/shared/types';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: SystemRole[];
    fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    fallback
}) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: '#6d65ff'
            }}>
                Loading permissions...
            </div>
        );
    }

    const hasAccess = user?.roles.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
        if (fallback) return <>{fallback}</>;

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                gap: '20px',
            }}>
                <h1 style={{ fontSize: '3rem' }}>🚫 Access Denied</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                    You do not have the required permissions to access this page.
                </p>
                <button
                    onClick={() => router.push('/modules/time-management')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#ff6565ff',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Return to Time Management
                </button>
            </div>
        );
    }

    return <>{children}</>;
};
