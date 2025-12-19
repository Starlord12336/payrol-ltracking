'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import styles from '../../leaves.module.css';

interface Holiday {
    id: string;
    name: string;
    date: string;
}

export default function CalendarConfigPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([
        { id: '1', name: 'New Year', date: '2026-01-01' },
        { id: '2', name: 'Labor Day', date: '2026-05-01' },
    ]);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        setHolidays([...holidays, { id: Date.now().toString(), ...newHoliday }]);
        setNewHoliday({ name: '', date: '' });
    };

    const handleDelete = (id: string) => {
        setHolidays(holidays.filter(h => h.id !== id));
    };

    return (
        <div>
            <h2 className={styles.sectionTitle}>Calendar & Holidays</h2>
            <div className={styles.grid}>
                <Card>
                    <h3 style={{ marginBottom: '1rem' }}>Global Holidays</h3>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                        Configure public holidays. These days will not be counted as leave days.
                    </p>

                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
                        <Input
                            label="Holiday Name"
                            value={newHoliday.name}
                            onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Date"
                            type="date"
                            value={newHoliday.date}
                            onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            required
                        />
                        <Button type="submit" variant="primary">Add</Button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {holidays.map(h => (
                            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #eee', borderRadius: '6px' }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{h.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{h.date}</div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(h.id)}>Remove</Button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 style={{ marginBottom: '1rem' }}>Work Week Configuration</h3>
                    <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '0.5rem' }}><strong>Working Days:</strong> Monday - Friday</div>
                        <div style={{ marginBottom: '0.5rem' }}><strong>Weekend:</strong> Saturday, Sunday</div>
                        <div style={{ marginTop: '1rem' }}>
                            <Button variant="outline" size="sm" disabled>Edit Schedule (Coming Soon)</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
