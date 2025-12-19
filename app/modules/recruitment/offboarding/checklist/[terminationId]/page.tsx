'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/shared/components';
import { recruitmentApi } from '../../../api/recruitment.api';
import styles from './ChecklistForm.module.css'; // Assuming we can reuse or create styles

export default function CreateChecklistPage({ params }: { params: { terminationId: string } }) {
    const router = useRouter();
    const { terminationId } = params;
    const [departments, setDepartments] = useState<string[]>(['IT', 'Finance', 'Facilities', 'HR', 'Admin']);
    const [newDepartment, setNewDepartment] = useState('');
    const [equipment, setEquipment] = useState<string[]>([
        'Laptop', 'Monitor', 'Keyboard & Mouse', 'Phone', 'ID Badge/Card', 'Access Cards'
    ]);
    const [newEquipment, setNewEquipment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddDepartment = () => {
        if (newDepartment.trim()) {
            setDepartments([...departments, newDepartment.trim()]);
            setNewDepartment('');
        }
    };

    const handleRemoveDepartment = (index: number) => {
        const newDepts = [...departments];
        newDepts.splice(index, 1);
        setDepartments(newDepts);
    };

    const handleAddEquipment = () => {
        if (newEquipment.trim()) {
            setEquipment([...equipment, newEquipment.trim()]);
            setNewEquipment('');
        }
    };

    const handleRemoveEquipment = (index: number) => {
        const newEq = [...equipment];
        newEq.splice(index, 1);
        setEquipment(newEq);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = {
                items: departments.map(d => ({ department: d })),
                equipmentList: equipment.map(e => ({ name: e }))
            };
            await recruitmentApi.createOffboardingChecklist(terminationId, data);
            alert('Checklist created successfully');
            router.push('/modules/recruitment/offboarding'); // Or back to where they came from
        } catch (error) {
            console.error('Failed to create checklist', error);
            alert('Failed to create checklist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Create Custom Offboarding Checklist</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Termination ID: {terminationId}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <Card padding="lg">
                    <h3>Departments Required for Clearance</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <Input
                            placeholder="Add Department (e.g. Security)"
                            value={newDepartment}
                            onChange={(e) => setNewDepartment(e.target.value)}
                        />
                        <Button onClick={handleAddDepartment}>Add</Button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {departments.map((dept, idx) => (
                            <div key={idx} style={{
                                background: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '20px',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                {dept}
                                <span
                                    style={{ cursor: 'pointer', color: '#991b1b', fontWeight: 'bold' }}
                                    onClick={() => handleRemoveDepartment(idx)}
                                >×</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card padding="lg">
                    <h3>Equipment to Return</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <Input
                            placeholder="Add Equipment (e.g. Car Keys)"
                            value={newEquipment}
                            onChange={(e) => setNewEquipment(e.target.value)}
                        />
                        <Button onClick={handleAddEquipment}>Add</Button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {equipment.map((item, idx) => (
                            <li key={idx} style={{
                                padding: '0.5rem', borderBottom: '1px solid #eee',
                                display: 'flex', justifyContent: 'space-between'
                            }}>
                                {item}
                                <span
                                    style={{ cursor: 'pointer', color: '#991b1b' }}
                                    onClick={() => handleRemoveEquipment(idx)}
                                >Remove</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Creating Checklist...' : 'Create Checklist'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
