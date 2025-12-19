'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { PanelMember, PanelAvailability } from '../types';
import styles from './RecruitmentForms.module.css';

interface PanelAvailabilityFormProps {
    member: PanelMember;
}

export default function PanelAvailabilityForm({ member }: PanelAvailabilityFormProps) {
    const [availability, setAvailability] = useState<PanelAvailability>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Generate next 7 days
    const [dates, setDates] = useState<string[]>([]);

    useEffect(() => {
        const d = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            d.push(date.toISOString().split('T')[0]);
        }
        setDates(d);
    }, []);

    const fetchAvailability = useCallback(async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.getPanelAvailability(member._id);
            setAvailability(data || {});
            setMessage(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to load availability' });
        } finally {
            setLoading(false);
        }
    }, [member._id]);

    useEffect(() => {
        fetchAvailability();
    }, [member._id, fetchAvailability]);

    const handleToggleSlot = (date: string, time: string) => {
        const currentSlots = availability[date] || [];
        let newSlots;
        if (currentSlots.includes(time)) {
            newSlots = currentSlots.filter(t => t !== time);
        } else {
            newSlots = [...currentSlots, time];
        }

        setAvailability(prev => ({
            ...prev,
            [date]: newSlots
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await recruitmentApi.setPanelAvailability(member._id, availability);
            setMessage({ type: 'success', text: 'Availability saved successfully.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to save availability' });
        } finally {
            setSaving(false);
        }
    };

    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    if (loading) return <div>Loading availability...</div>;

    return (
        <div style={{ padding: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Availability for {member.name}</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>Click to toggle available slots for the next 7 days.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {dates.map(date => (
                    <div key={date} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
                            {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {timeSlots.map(time => {
                                const isSelected = availability[date]?.includes(time);
                                return (
                                    <button
                                        key={time}
                                        onClick={() => handleToggleSlot(date, time)}
                                        style={{
                                            padding: '0.25rem',
                                            borderRadius: '4px',
                                            border: '1px solid',
                                            borderColor: isSelected ? '#0ea5e9' : '#e5e7eb',
                                            background: isSelected ? '#e0f2fe' : '#fff',
                                            color: isSelected ? '#0284c7' : '#374151',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {message && (
                <div className={message.type === 'error' ? styles.error : styles.success} style={{ marginBottom: '1rem' }}>
                    {message.text}
                </div>
            )}

            <div style={{ textAlign: 'right' }}>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Availability'}
                </Button>
            </div>
        </div>
    );
}
