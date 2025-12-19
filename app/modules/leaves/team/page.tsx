'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import styles from '../leaves.module.css';

// Mock team data
const mockTeamBalances = [
    {
        id: 'u2', name: 'John Doe', department: 'Unassigned', balances: [
            { type: 'Annual', remaining: 10, total: 21 },
            { type: 'Sick', remaining: 8, total: 10 }
        ]
    },
    {
        id: 'u3', name: 'Jane Smith', department: 'Unassigned', balances: [
            { type: 'Annual', remaining: 15, total: 21 },
            { type: 'Sick', remaining: 0, total: 10 }
        ]
    }
];

export default function TeamBalancesPage() {
    return (
        <div>
            <h2 className={styles.sectionTitle}>Team Balances</h2>
            <Card padding="none">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Employee</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Annual Leave</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Sick Leave</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockTeamBalances.map((member) => (
                                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{member.name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--primary-main)' }}>{member.balances[0].remaining}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}> / {member.balances[0].total}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontWeight: 600, color: member.balances[1].remaining < 3 ? 'var(--error-main)' : 'var(--text-primary)' }}>
                                            {member.balances[1].remaining}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}> / {member.balances[1].total}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/modules/leaves/history?employeeId=${member.id}`}>
                                            <Button variant="outline" size="sm">View History</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
