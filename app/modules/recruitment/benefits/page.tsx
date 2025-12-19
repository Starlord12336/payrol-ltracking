'use client';

import { Suspense, useState } from 'react';
import { Button, Input } from '@/shared/components';
import BenefitsEnrollment from '../components/BenefitsEnrollment';
import styles from '../page.module.css';

function BenefitsPageContent() {
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
                <h1>Benefits Enrollment</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Onboarding</span> / <span>Benefits</span>
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
                    <BenefitsEnrollment
                        employeeId={employeeId}
                        onSuccess={() => alert('Benefits enrollment submitted!')}
                    />
                )}
            </div>
        </div>
    );
}

export default function BenefitsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BenefitsPageContent />
        </Suspense>
    );
}
