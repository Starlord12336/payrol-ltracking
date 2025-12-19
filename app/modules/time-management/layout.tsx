"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { RoleGuard } from './components/RoleGuard';
import { SystemRole } from '@/shared/types';

export default function TimeManagementLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Public routes that anyone with a login can see
    const publicRoutes = [
        '/modules/time-management',
        '/modules/time-management/EmployeeDashboard'
    ];

    const isPublicRoute = publicRoutes.some(route => pathname === route);

    if (isPublicRoute) {
        return <>{children}</>;
    }

    // All other routes require Admin or HR roles
    return (
        <RoleGuard
            allowedRoles={[
                SystemRole.SYSTEM_ADMIN,
                SystemRole.HR_ADMIN,
                SystemRole.HR_MANAGER,
                SystemRole.DEPARTMENT_HEAD
            ]}
        >
            {children}
        </RoleGuard>
    );
}
