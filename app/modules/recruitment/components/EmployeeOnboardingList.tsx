'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card, Modal } from '@/shared/components';
import { recruitmentApi, createEmployeeOnboarding } from '../api/recruitment.api';
import { OnboardingTaskInput, CreateEmployeeOnboardingDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    department?: string;
    position?: string;
    contractId?: string;
}

export default function EmployeeOnboardingList() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [tasks, setTasks] = useState<OnboardingTaskInput[]>([{ name: '', department: '' }]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        setLoading(true);
        try {
            // Fetch employees and contracts
            const [empData, contractsData] = await Promise.all([
                recruitmentApi.listEmployees(),
                recruitmentApi.listContracts()
            ]);

            // Map contracts to employees
            const employeesWithContracts = (empData || []).map((emp: any) => {
                const contract = (contractsData || []).find((c: any) =>
                    c.employeeId === emp._id || c.candidateId === emp.candidateId
                );
                return {
                    ...emp,
                    contractId: contract?._id || emp.contractId
                };
            });

            setEmployees(employeesWithContracts);
        } catch (error) {
            console.error('Failed to load employees', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (employee: Employee) => {
        if (!employee.contractId) {
            alert('This employee does not have a contract associated. Cannot create onboarding.');
            return;
        }
        setSelectedEmployee(employee);
        setTasks([{ name: '', department: employee.department || '' }]);
        setMessage(null);
        setShowModal(true);
    };

    const addTask = () => {
        setTasks([...tasks, { name: '', department: selectedEmployee?.department || '' }]);
    };

    const removeTask = (index: number) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter((_, i) => i !== index));
        }
    };

    const updateTask = (index: number, field: keyof OnboardingTaskInput, value: string) => {
        const updated = [...tasks];
        updated[index] = { ...updated[index], [field]: value };
        setTasks(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee?.contractId) {
            setMessage({ type: 'error', text: 'No contract associated with this employee' });
            return;
        }

        // Validate at least one task with a name
        const validTasks = tasks.filter(t => t.name.trim());
        if (validTasks.length === 0) {
            setMessage({ type: 'error', text: 'Please add at least one task with a name' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            const dto: CreateEmployeeOnboardingDto = {
                employeeId: selectedEmployee._id,
                contractId: selectedEmployee.contractId,
                tasks: validTasks
            };

            await createEmployeeOnboarding(dto);
            setMessage({ type: 'success', text: 'Onboarding created successfully!' });
            setTimeout(() => {
                setShowModal(false);
                loadEmployees();
            }, 1500);
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error.message || 'Failed to create onboarding';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Card padding="lg">
                <h3 style={{ marginBottom: '1rem' }}>Employee Onboarding (ONB-001)</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Select an employee to create their onboarding checklist with tasks.
                </p>

                {loading ? (
                    <p>Loading employees...</p>
                ) : employees.length === 0 ? (
                    <p style={{ color: '#666' }}>No employees found. Create employee profiles first.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {employees.map((emp) => (
                            <div
                                key={emp._id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    backgroundColor: '#fafafa'
                                }}
                            >
                                <div>
                                    <p style={{ fontWeight: 600 }}>
                                        {emp.firstName} {emp.lastName}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#666' }}>
                                        {emp.position || 'No position'} | {emp.department || 'No department'}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#888' }}>
                                        Contract: {emp.contractId ? '✅ Available' : '❌ Not linked'}
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => openModal(emp)}
                                    disabled={!emp.contractId}
                                >
                                    Create Onboarding
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Create Onboarding Modal */}
            {showModal && selectedEmployee && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowModal(false)}
                    title={`Create Onboarding for ${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                >
                    {message && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: message.type === 'success' ? '#166534' : '#991b1b'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h4>Tasks</h4>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                                Add onboarding tasks for this employee.
                            </p>
                        </div>

                        {tasks.map((task, index) => (
                            <div key={index} style={{
                                padding: '1rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                marginBottom: '0.75rem',
                                backgroundColor: '#f9fafb'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <strong>Task {index + 1}</strong>
                                    {tasks.length > 1 && (
                                        <Button type="button" variant="outline" size="sm" onClick={() => removeTask(index)}>
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Task Name *</label>
                                    <Input
                                        value={task.name}
                                        onChange={(e) => updateTask(index, 'name', e.target.value)}
                                        placeholder="e.g. Complete HR paperwork"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Department</label>
                                    <Input
                                        value={task.department || ''}
                                        onChange={(e) => updateTask(index, 'department', e.target.value)}
                                        placeholder="e.g. HR, IT, Finance"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Notes</label>
                                    <Input
                                        value={task.notes || ''}
                                        onChange={(e) => updateTask(index, 'notes', e.target.value)}
                                        placeholder="Optional notes"
                                    />
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addTask} style={{ marginBottom: '1rem' }}>
                            + Add Another Task
                        </Button>

                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Onboarding'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
