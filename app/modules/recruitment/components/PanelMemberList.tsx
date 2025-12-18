'use client';

import { useState } from 'react';
import { Button, Input, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { PanelMember } from '../types';
import styles from './RecruitmentForms.module.css';

interface PanelMemberListProps {
    members: PanelMember[];
    onRefresh: () => void;
    onSelect: (member: PanelMember) => void;
}

export default function PanelMemberList({ members, onRefresh, onSelect }: PanelMemberListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMember, setNewMember] = useState<Partial<PanelMember>>({ name: '', email: '', role: '', expertise: [] });
    const [expertiseInput, setExpertiseInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.email) {
            setError('Name and Email are required.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await recruitmentApi.registerPanelMember(newMember);
            setIsModalOpen(false);
            setNewMember({ name: '', email: '', role: '', expertise: [] });
            onRefresh();
        } catch (err: any) {
            setError(err.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const addExpertise = () => {
        if (expertiseInput.trim()) {
            setNewMember(prev => ({
                ...prev,
                expertise: [...(prev.expertise || []), expertiseInput.trim()]
            }));
            setExpertiseInput('');
        }
    };

    return (
        <div style={{ padding: '1rem', borderRight: '1px solid #eee', minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Panel Members</h3>
                <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>+ Add</Button>
            </div>

            {members.length === 0 ? (
                <p>No members found.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {members.map(member => (
                        <li
                            key={member._id}
                            onClick={() => onSelect(member)}
                            style={{
                                padding: '0.75rem',
                                borderBottom: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ fontWeight: 600 }}>{member.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{member.role || 'Interviewer'}</div>
                        </li>
                    ))}
                </ul>
            )}

            {isModalOpen && (
                <Modal isOpen={true} onClose={() => setIsModalOpen(false)} title="Add Panel Member">
                    <div className={styles.publishContainer}>
                        <div className={styles.formGroup}>
                            <Input label="Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} fullWidth required />
                        </div>
                        <div className={styles.formGroup}>
                            <Input label="Email" type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} fullWidth required />
                        </div>
                        <div className={styles.formGroup}>
                            <Input label="Role" value={newMember.role ?? ''} onChange={e => setNewMember({ ...newMember, role: e.target.value })} fullWidth />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Expertise</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Input value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)} placeholder="e.g. Java, System Design" />
                                <Button onClick={addExpertise} variant="outline" size="sm">Add</Button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {newMember.expertise?.map((req, i) => (
                                    <span key={i} className={styles.skillBadge}>{req}</span>
                                ))}
                            </div>
                        </div>
                        {error && <div className={styles.error}>{error}</div>}
                        <div className={styles.actions} style={{ marginTop: '1rem' }}>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleAddMember} disabled={loading}>{loading ? 'Adding...' : 'Add Member'}</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
