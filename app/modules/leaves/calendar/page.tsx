'use client';

import React from 'react';
import { Card } from '@/shared/components/Card';
import styles from '../leaves.module.css';

export default function LeaveCalendarPage() {
    return (
        <div>
            <h2 className={styles.sectionTitle}>Team Calendar</h2>
            <Card>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Calendar View Component to be implemented here.
                </div>
            </Card>
        </div>
    );
}
