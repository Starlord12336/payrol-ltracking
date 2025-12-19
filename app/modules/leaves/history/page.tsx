'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/shared/components/Card';
import styles from '../leaves.module.css';
import { useLeaves } from '../contexts/LeavesContext';
import { LeaveFilterBar } from '../components/LeaveFilterBar';

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'approved': return 'var(--success-main)';
        case 'rejected': return 'var(--error-main)';
        case 'pending': return 'var(--warning-main)';
        default: return 'var(--text-secondary)';
    }
};

function LeaveHistoryContent() {
    const { requests, updateRequestStatus } = useLeaves();
    const searchParams = useSearchParams();
    const targetId = searchParams.get('employeeId');

    // If targetId is provided, show that user's requests. Otherwise show current user (u1).
    const myRequests = requests.filter(r => r.employeeId === (targetId || 'u1'));
    const [filters, setFilters] = React.useState<any>({});

    const filteredRequests = myRequests.filter(req => {
        if (filters.status && req.status !== filters.status) return false;
        if (filters.fromDate && req.fromDate < filters.fromDate) return false;
        if (filters.toDate && req.toDate > filters.toDate) return false;
        return true;
    });

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                {targetId && (
                    <Link href="/modules/leaves/team" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>
                        ← Back to Team
                    </Link>
                )}
                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                    {targetId ? 'Employee Leave History' : 'My Leave History'}
                </h2>
            </div>

            <LeaveFilterBar onFilter={setFilters} />

            <Card padding="none">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Leave Type</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>From</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>To</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Days</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Actions</th> {/* Added Actions header */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No requests found.</td></tr>
                            ) : filteredRequests.map((req) => (
                                <tr key={req.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '1rem' }}>{req.leaveTypeName}</td>
                                    <td style={{ padding: '1rem' }}>{req.fromDate}</td>
                                    <td style={{ padding: '1rem' }}>{req.toDate}</td>
                                    <td style={{ padding: '1rem' }}>{req.days}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '1rem',
                                            backgroundColor: `${getStatusColor(req.status)}20`, // 20% opacity
                                            color: getStatusColor(req.status),
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {req.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link href={`/modules/leaves/request?editId=${req.id}`}>
                                                    <button
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid var(--primary-main)',
                                                            color: 'var(--primary-main)',
                                                            borderRadius: '4px',
                                                            padding: '0.25rem 0.5rem',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => updateRequestStatus(req.id, 'Cancelled')}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid var(--error-main)',
                                                        color: 'var(--error-main)',
                                                        borderRadius: '4px',
                                                        padding: '0.25rem 0.5rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
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

export default function LeaveHistoryPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
            <LeaveHistoryContent />
        </Suspense>
    );
}
