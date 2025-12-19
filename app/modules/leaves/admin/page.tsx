'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/shared/components/Card';
import styles from '../leaves.module.css';

const adminModules = [
    { title: 'Leave Types', description: 'Configure leave types like Annual, Sick, etc.', link: '/modules/leaves/admin/types' },
    { title: 'Entitlements', description: 'Set accrual rules and holiday calendars.', link: '/modules/leaves/admin/entitlements' },
    { title: 'Calendar & Holidays', description: 'Manage public holidays and work weeks.', link: '/modules/leaves/admin/calendar' },
    { title: 'Manual Adjustments', description: 'Manually adjust employee leave balances.', link: '/modules/leaves/admin/adjustments' },
];

export default function LeavesAdminPage() {
    return (
        <div>
            <h2 className={styles.sectionTitle}>Leaves Administration</h2>
            <div className={styles.grid}>
                {adminModules.map((mod, i) => (
                    <Card key={i} hover>
                        <Link href={mod.link} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-main)', marginBottom: '0.5rem' }}>{mod.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{mod.description}</p>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    );
}
