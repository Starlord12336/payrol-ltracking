'use client';

import { Suspense, useState } from 'react';
import { Button, Input } from '@/shared/components';
import EquipmentManagement from '../components/EquipmentManagement';
import styles from '../page.module.css';

function EquipmentPageContent() {
    const [employeeId, setEmployeeId] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (employeeId.trim()) {
            setShowForm(true);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Equipment Provisioning</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Onboarding</span> / <span>Equipment</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <div style={{ maxWidth: '600px', margin: '0 0 2rem' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                        <Input
                            placeholder="Enter Employee ID"
                            value={employeeId}
                            onChange={(e) => { setEmployeeId(e.target.value); setShowForm(false); }}
                        />
                        <Button type="submit" variant="primary">
                            Load Employee
                        </Button>
                    </form>
                </div>

                {showForm && employeeId && (
                    <EquipmentManagement
                        employeeId={employeeId}
                        onSuccess={() => alert('Equipment request submitted!')}
                    />
                )}
            </div>
        </div>
    );
}

export default function EquipmentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EquipmentPageContent />
        </Suspense>
    );
}
