'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { PreboardingTask, TriggerPreboardingDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface PreboardingModalProps {
    offerId: string;
    candidateName: string;
    onClose: () => void;
}

export default function PreboardingModal({ offerId, candidateName, onClose }: PreboardingModalProps) {
    const [tasks, setTasks] = useState<PreboardingTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [triggerMode, setTriggerMode] = useState(false);

    // Form state for triggering
    const [startDate, setStartDate] = useState('');
    const [newTask, setNewTask] = useState<Partial<PreboardingTask>>({
        title: '',
        description: '',
        assignee: 'hr',
        dueDays: 0
    });
    const [tasksToTrigger, setTasksToTrigger] = useState<PreboardingTask[]>([
        { title: 'Welcome Email', description: 'Send welcome email to candidate', assignee: 'hr', dueDays: 0 },
        { title: 'IT Equipment Setup', description: 'Request laptop and accessories', assignee: 'hr', dueDays: -3 },
        { title: 'Upload Personal Documents', description: 'Passport, ID, Certificates', assignee: 'candidate', dueDays: 3 }
    ]);

    useEffect(() => {
        fetchTasks();
    }, [offerId]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listPreboardingTasks(offerId);
            setTasks(data || []);
            if (!data || data.length === 0) {
                setTriggerMode(true);
            } else {
                setTriggerMode(false);
            }
        } catch (error) {
            console.error('Failed to fetch preboarding tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrigger = async () => {
        try {
            const dto: TriggerPreboardingDto = {
                startDate: startDate || undefined,
                tasks: tasksToTrigger
            };
            await recruitmentApi.triggerPreboarding(offerId, dto);
            await fetchTasks();
        } catch (error) {
            alert('Failed to trigger preboarding');
        }
    };

    const handleComplete = async (taskId: string) => {
        try {
            await recruitmentApi.completePreboardingTask(offerId, taskId, 'HR Action');
            const updatedTasks = tasks.map(t =>
                t._id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
            );
            setTasks(updatedTasks);
        } catch (error) {
            alert('Failed to complete task');
        }
    };

    const addTaskToTrigger = () => {
        if (!newTask.title) return;
        setTasksToTrigger([...tasksToTrigger, newTask as PreboardingTask]);
        setNewTask({ title: '', description: '', assignee: 'hr', dueDays: 0 });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Pre-boarding: ${candidateName}`}>
            <div className={styles.publishContainer} style={{ minWidth: '600px' }}>
                {loading ? (
                    <div>Loading...</div>
                ) : triggerMode ? (
                    <div>
                        <h3 className={styles.sectionTitle}>Start Pre-boarding</h3>
                        <p>No active pre-boarding found. Configure and start the process below.</p>

                        <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                            <label>Start Date (Optional)</label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>

                        <h4 style={{ marginTop: '1rem' }}>Tasks Checklist</h4>
                        <div className={styles.list} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {tasksToTrigger.map((t, idx) => (
                                <div key={idx} className={styles.listItem}>
                                    <div>
                                        <strong>{t.title}</strong>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                            {t.assignee?.toUpperCase()} | Due: {t.dueDays} days from start
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => setTasksToTrigger(tasksToTrigger.filter((_, i) => i !== idx))}>
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div style={{ border: '1px solid #eee', padding: '1rem', marginTop: '1rem', borderRadius: '4px' }}>
                            <h5>Add Custom Task</h5>
                            <Input placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                            <Input placeholder="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} style={{ marginTop: '0.5rem' }} />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <select
                                    value={newTask.assignee}
                                    onChange={e => setNewTask({ ...newTask, assignee: e.target.value as any })}
                                    className={styles.input}
                                >
                                    <option value="hr">HR</option>
                                    <option value="candidate">Candidate</option>
                                </select>
                                <Input type="number" placeholder="Due Days" value={newTask.dueDays} onChange={e => setNewTask({ ...newTask, dueDays: Number(e.target.value) })} />
                                <Button size="sm" onClick={addTaskToTrigger}>Add</Button>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <Button variant="primary" onClick={handleTrigger}>Start Pre-boarding Process</Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className={styles.sectionTitle}>Checklist Progress</h3>
                        <div className={styles.list}>
                            {tasks.map((task) => (
                                <div key={task._id} className={styles.listItem} style={{
                                    backgroundColor: task.completed ? '#f0fdf4' : 'fff',
                                    opacity: task.completed ? 0.8 : 1
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <strong>{task.title}</strong>
                                            {task.completed && <span className={styles.badge} style={{ backgroundColor: '#22c55e', color: 'white' }}>Done</span>}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                            {task.description} ({task.assignee})
                                        </div>
                                    </div>
                                    {!task.completed && (
                                        <Button size="sm" onClick={() => handleComplete(task._id!)}>
                                            Mark Complete
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {tasks.length === 0 && <p>No tasks found.</p>}
                    </div>
                )}
            </div>
        </Modal>
    );
}
