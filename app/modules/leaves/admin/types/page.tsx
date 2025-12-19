'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import styles from '../../leaves.module.css';

import { useLeaves } from '../../contexts/LeavesContext';

export default function LeaveTypesPage() {
    const { leaveTypes, addLeaveType, deleteLeaveType } = useLeaves();
    const [isCreating, setIsCreating] = useState(false);
    const [newType, setNewType] = useState({ name: '', code: '', paid: true });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = await addLeaveType({
            name: newType.name,
            code: newType.code,
            paid: newType.paid
        });

        if (!error) {
            setIsCreating(false);
            setNewType({ name: '', code: '', paid: true });
        } else {
            alert(`Failed to save: ${error}`);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>Leave Types Configuration</h2>
                <Button variant="primary" onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Cancel' : 'Create New Type'}
                </Button>
            </div>

            {isCreating && (
                <div style={{ marginBottom: '1rem' }}>
                    <Card className={styles.formCard}>
                        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Type Name"
                                    value={newType.name}
                                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Code"
                                    value={newType.code}
                                    onChange={(e) => setNewType({ ...newType, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Paid?</label>
                                <input
                                    type="checkbox"
                                    checked={newType.paid}
                                    onChange={(e) => setNewType({ ...newType, paid: e.target.checked })}
                                />
                            </div>
                            <Button type="submit" variant="primary">Save</Button>
                        </form>
                    </Card>
                </div>
            )}

            <Card padding="none">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Code</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveTypes.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No leave types configured.</td></tr>
                            ) : leaveTypes.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{t.name}</td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{t.code}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            background: t.paid ? 'var(--success-light)' : 'var(--bg-secondary)',
                                            color: t.paid ? 'var(--success-main)' : 'var(--text-secondary)',
                                            fontSize: '0.75rem', fontWeight: 600
                                        }}>
                                            {t.paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <Button variant="outline" size="sm" onClick={() => deleteLeaveType(t.id)}>Delete</Button>
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
