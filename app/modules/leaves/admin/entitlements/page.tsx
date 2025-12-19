'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import styles from '../../leaves.module.css';

import { useLeaves } from '../../contexts/LeavesContext';

export default function EntitlementsPage() {
    const { entitlements, updateEntitlement } = useLeaves();
    // Local state to handle inputs before saving
    const [localEntitlements, setLocalEntitlements] = useState(entitlements);

    // Sync local state if context changes (e.g. first load)
    React.useEffect(() => {
        setLocalEntitlements(entitlements);
    }, [entitlements]);

    const handleLocalChange = (id: string, amount: number) => {
        setLocalEntitlements(prev => prev.map(e => e.id === id ? { ...e, amount } : e));
    };

    const handleSave = (id: string) => {
        const ent = localEntitlements.find(e => e.id === id);
        if (ent) {
            updateEntitlement(id, ent.amount);
            alert(`Updated ${ent.type} entitlement to ${ent.amount} days.`);
        }
    };

    return (
        <div>
            <h2 className={styles.sectionTitle}>Entitlements & Accruals</h2>
            <Card>
                <div style={{ padding: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Global Accrual Rules</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {localEntitlements.map(acc => (
                            <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                                <div style={{ flex: 1 }}>
                                    <strong>{acc.type}</strong>
                                    <div style={{ color: '#666', fontSize: '0.875rem' }}>Allocated per {acc.interval}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Input
                                        label=""
                                        type="number"
                                        value={acc.amount}
                                        onChange={(e) => handleLocalChange(acc.id, parseInt(e.target.value) || 0)}
                                        style={{ width: '80px' }}
                                    />
                                    <span>Days</span>
                                    <Button size="sm" onClick={() => handleSave(acc.id)}>Update</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}
