'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { PanelMember } from '../types';
import PanelMemberList from './PanelMemberList';
import PanelAvailabilityForm from './PanelAvailabilityForm';

export default function PanelManagement() {
    const [members, setMembers] = useState<PanelMember[]>([]);
    const [selectedMember, setSelectedMember] = useState<PanelMember | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listPanelMembers();
            setMembers(data);
            if (data.length > 0 && !selectedMember) {
                // setSelectedMember(data[0]); // Optional: auto-select first
            }
        } catch (err) {
            console.error('Failed to list panel members', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="lg">
            <h2 style={{ marginBottom: '1.5rem' }}>Interview Panel Management</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', minHeight: '500px' }}>
                <PanelMemberList
                    members={members}
                    onRefresh={fetchMembers}
                    onSelect={setSelectedMember}
                />

                <div style={{ padding: '1rem' }}>
                    {selectedMember ? (
                        <PanelAvailabilityForm key={selectedMember._id} member={selectedMember} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                            <p>Select a panel member to manage their availability.</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
