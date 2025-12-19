'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { SigningBonus } from '../types';
import styles from './RecruitmentForms.module.css';

interface SigningBonusListProps {
    onSelectPosition?: (positionName: string) => void;
}

export default function SigningBonusList({ onSelectPosition }: SigningBonusListProps) {
    const [bonuses, setBonuses] = useState<SigningBonus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchPosition, setSearchPosition] = useState('');
    const [selectedBonus, setSelectedBonus] = useState<SigningBonus | null>(null);

    useEffect(() => {
        fetchBonuses();
    }, []);

    const fetchBonuses = async () => {
        setLoading(true);
        try {
            const data = await recruitmentApi.listApprovedSigningBonuses();
            setBonuses(data);
        } catch (error: any) {
            console.error('Failed to fetch signing bonuses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchPosition.trim()) return;

        try {
            const data = await recruitmentApi.getSigningBonusByPosition(searchPosition);
            setSelectedBonus(data);
        } catch (e) {
            setSelectedBonus(null);
            alert('No signing bonus found for this position');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card padding="lg">
                <h3>Signing Bonuses by Position</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    View approved signing bonuses for onboarding new hires
                </p>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Input
                        placeholder="Search by Position Name"
                        value={searchPosition}
                        onChange={(e) => setSearchPosition(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                        Search
                    </Button>
                </form>

                {selectedBonus && (
                    <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', marginBottom: '1rem' }}>
                        <h4 style={{ color: '#2563eb' }}>{selectedBonus.positionName}</h4>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>
                            ${selectedBonus.amount.toLocaleString()}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>Status: {selectedBonus.status}</p>
                    </div>
                )}
            </Card>

            <Card padding="md">
                <h4 style={{ marginBottom: '1rem' }}>All Approved Signing Bonuses</h4>
                {loading ? (
                    <p>Loading...</p>
                ) : bonuses.length === 0 ? (
                    <p style={{ color: '#666' }}>No approved signing bonuses found</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {bonuses.map((bonus) => (
                            <div
                                key={bonus._id}
                                style={{
                                    padding: '1rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s'
                                }}
                                onClick={() => {
                                    setSelectedBonus(bonus);
                                    if (onSelectPosition) onSelectPosition(bonus.positionName);
                                }}
                            >
                                <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{bonus.positionName}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#22c55e' }}>
                                    ${bonus.amount.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                                    {bonus.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
