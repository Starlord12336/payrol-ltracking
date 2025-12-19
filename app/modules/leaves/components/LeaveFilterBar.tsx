import React, { useState } from 'react';
import { Button } from '@/shared/components/Button';

interface LeaveFilterBarProps {
    onFilter: (filters: any) => void;
    showStatus?: boolean;
}

export function LeaveFilterBar({ onFilter, showStatus = true }: LeaveFilterBarProps) {
    const [status, setStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleApply = () => {
        const filters: any = {};
        if (status) filters.status = status;
        if (fromDate) filters.fromDate = fromDate;
        if (toDate) filters.toDate = toDate;
        onFilter(filters);
    };

    const handleClear = () => {
        setStatus('');
        setFromDate('');
        setToDate('');
        onFilter({});
    };

    return (
        <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'end',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            flexWrap: 'wrap'
        }}>
            {showStatus && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-medium)',
                            minWidth: '150px'
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>From Date</label>
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-medium)'
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>To Date</label>
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-medium)'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="primary" onClick={handleApply}>Filter</Button>
                <Button variant="outline" onClick={handleClear}>Clear</Button>
            </div>
        </div>
    );
}
