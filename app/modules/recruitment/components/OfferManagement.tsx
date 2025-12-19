'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { Offer, CreateOfferDto, JobApplication } from '../types';
import styles from './RecruitmentForms.module.css';

/**
 * OfferManagement (REC-014)
 * Allows HR Manager to manage job offers and approvals
 */

type OfferStatus = 'all' | 'draft' | 'pending_approval' | 'approved' | 'sent_to_candidate' | 'accepted' | 'rejected_by_candidate';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
    draft: { label: 'Draft', bg: '#f3f4f6', color: '#6b7280' },
    pending_approval: { label: 'Pending Approval', bg: '#fef3c7', color: '#d97706' },
    approved: { label: 'Approved', bg: '#dbeafe', color: '#1d4ed8' },
    sent_to_candidate: { label: 'Sent to Candidate', bg: '#e0e7ff', color: '#4338ca' },
    accepted: { label: 'Accepted', bg: '#d1fae5', color: '#059669' },
    rejected_by_candidate: { label: 'Rejected by Candidate', bg: '#fef2f2', color: '#dc2626' },
};

export default function OfferManagement() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<OfferStatus>('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [showApproverForm, setShowApproverForm] = useState(false);

    // Create form state
    const [formData, setFormData] = useState<Partial<CreateOfferDto>>({
        applicationId: '',
        candidateId: '',
        grossSalary: 0,
        signingBonus: 0,
        role: '',
        deadline: '',
        content: 'We are pleased to offer you the position...',
        conditions: '',
        insurances: ''
    });
    const [benefits, setBenefits] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Approver form state
    const [approverData, setApproverData] = useState({
        employeeId: '',
        role: 'Manager',
        status: 'pending',
        comment: ''
    });

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listOffers();
            setOffers(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching offers:', err);
            setError(err.message || 'Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOffers = () => {
        if (filter === 'all') return offers;
        return offers.filter(o => o.status === filter);
    };

    const handleCreateOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const benefitsList = benefits.split(',').map(b => b.trim()).filter(b => b);

            await recruitmentApi.createOffer({
                ...formData as CreateOfferDto,
                benefits: benefitsList,
                grossSalary: Number(formData.grossSalary),
                signingBonus: Number(formData.signingBonus)
            });

            await fetchOffers();
            setShowCreateForm(false);
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to create offer');
        } finally {
            setFormLoading(false);
        }
    };

    const handleAddApprover = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOffer) return;

        setFormLoading(true);
        try {
            await recruitmentApi.addOfferApprover(selectedOffer._id, {
                employeeId: approverData.employeeId,
                role: approverData.role,
                status: approverData.status,
                comment: approverData.comment
            });
            await fetchOffers();
            setShowApproverForm(false);
            setApproverData({ employeeId: '', role: 'Manager', status: 'pending', comment: '' });
        } catch (err: any) {
            setError(err.message || 'Failed to add approver');
        } finally {
            setFormLoading(false);
        }
    };

    const handleFinalize = async (offerId: string) => {
        if (!confirm('Are you sure you want to finalize this offer? It will be sent to the candidate.')) return;

        try {
            await recruitmentApi.finalizeOffer(offerId);
            await fetchOffers();
        } catch (err: any) {
            alert('Failed to finalize offer: ' + err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            applicationId: '',
            candidateId: '',
            grossSalary: 0,
            signingBonus: 0,
            role: '',
            deadline: '',
            content: 'We are pleased to offer you the position...',
            conditions: '',
            insurances: ''
        });
        setBenefits('');
    };

    const handleChange = (field: keyof CreateOfferDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getStatusStyle = (status: string) => {
        return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    };

    if (loading) return <div>Loading offers...</div>;

    // Create Form View
    if (showCreateForm) {
        return (
            <div className={styles.formContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Create New Offer</h2>
                    <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                        ← Back to List
                    </Button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleCreateOffer}>
                    <div style={{ marginBottom: '1rem' }}><Card padding="md">
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#3b82f6' }}>📋 Application Details</h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <Input
                                    label="Application ID *"
                                    value={formData.applicationId || ''}
                                    onChange={(e) => handleChange('applicationId', e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="Enter application ID"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <Input
                                    label="Candidate ID *"
                                    value={formData.candidateId || ''}
                                    onChange={(e) => handleChange('candidateId', e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="Enter candidate ID"
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <Input
                                label="Job Role / Title *"
                                value={formData.role || ''}
                                onChange={(e) => handleChange('role', e.target.value)}
                                required
                                fullWidth
                                placeholder="e.g., Senior Software Engineer"
                            />
                        </div>
                    </Card></div>

                    <div style={{ marginBottom: '1rem' }}><Card padding="md">
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#10b981' }}>💰 Compensation</h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <Input
                                    label="Gross Salary *"
                                    type="number"
                                    value={formData.grossSalary || ''}
                                    onChange={(e) => handleChange('grossSalary', e.target.value)}
                                    required
                                    fullWidth
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <Input
                                    label="Signing Bonus"
                                    type="number"
                                    value={formData.signingBonus || ''}
                                    onChange={(e) => handleChange('signingBonus', e.target.value)}
                                    fullWidth
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <Input
                                label="Benefits (comma separated)"
                                value={benefits}
                                onChange={(e) => setBenefits(e.target.value)}
                                fullWidth
                                placeholder="Health Insurance, Gym Membership, etc."
                            />
                        </div>
                    </Card></div>

                    <div style={{ marginBottom: '1rem' }}><Card padding="md">
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#8b5cf6' }}>📄 Offer Details</h3>
                        <div className={styles.formGroup}>
                            <Input
                                label="Response Deadline *"
                                type="date"
                                value={formData.deadline ? formData.deadline.split('T')[0] : ''}
                                onChange={(e) => handleChange('deadline', e.target.value)}
                                required
                                fullWidth
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Insurances</label>
                            <textarea
                                className={styles.textarea}
                                value={formData.insurances || ''}
                                onChange={(e) => handleChange('insurances', e.target.value)}
                                rows={2}
                                placeholder="Insurance details..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Conditions</label>
                            <textarea
                                className={styles.textarea}
                                value={formData.conditions || ''}
                                onChange={(e) => handleChange('conditions', e.target.value)}
                                rows={2}
                                placeholder="Any conditions for the offer..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Offer Letter Content *</label>
                            <textarea
                                className={styles.textarea}
                                value={formData.content || ''}
                                onChange={(e) => handleChange('content', e.target.value)}
                                rows={5}
                                required
                            />
                        </div>
                    </Card></div>

                    <div className={styles.actions}>
                        <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }} type="button" disabled={formLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={formLoading}>
                            {formLoading ? 'Creating...' : 'Create Offer Draft'}
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    // Add Approver Form
    if (showApproverForm && selectedOffer) {
        return (
            <div className={styles.formContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Add Approver to Offer</h2>
                    <Button variant="outline" onClick={() => { setShowApproverForm(false); setSelectedOffer(null); }}>
                        ← Back
                    </Button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div style={{ marginBottom: '1rem' }}><Card padding="md">
                    <p style={{ margin: 0, color: '#666' }}>
                        Adding approver to offer for: <strong>{selectedOffer.candidateId}</strong>
                    </p>
                </Card></div>

                <form onSubmit={handleAddApprover}>
                    <div style={{ marginBottom: '1rem' }}><Card padding="md">
                        <div className={styles.formGroup}>
                            <Input
                                label="Approver Employee ID *"
                                value={approverData.employeeId}
                                onChange={(e) => setApproverData(prev => ({ ...prev, employeeId: e.target.value }))}
                                required
                                fullWidth
                                placeholder="Enter employee ID"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Approver Role</label>
                            <select
                                value={approverData.role}
                                onChange={(e) => setApproverData(prev => ({ ...prev, role: e.target.value }))}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="Manager">Manager</option>
                                <option value="HR Director">HR Director</option>
                                <option value="Department Head">Department Head</option>
                                <option value="CEO">CEO</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Comment (Optional)</label>
                            <textarea
                                className={styles.textarea}
                                value={approverData.comment}
                                onChange={(e) => setApproverData(prev => ({ ...prev, comment: e.target.value }))}
                                rows={2}
                            />
                        </div>
                    </Card></div>

                    <div className={styles.actions}>
                        <Button variant="outline" onClick={() => { setShowApproverForm(false); setSelectedOffer(null); }} type="button" disabled={formLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={formLoading}>
                            {formLoading ? 'Adding...' : 'Add Approver'}
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    // Offer Detail View
    if (selectedOffer) {
        const statusStyle = getStatusStyle(selectedOffer.status);
        return (
            <div className={styles.formContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Offer Details</h2>
                    <Button variant="outline" onClick={() => setSelectedOffer(null)}>
                        ← Back to List
                    </Button>
                </div>

                <div style={{ marginBottom: '1rem' }}><Card padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Offer #{selectedOffer._id.slice(-8)}</h3>
                        <span style={{
                            padding: '0.3rem 0.75rem',
                            borderRadius: '16px',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color
                        }}>
                            {statusStyle.label}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <strong>Candidate ID:</strong> {selectedOffer.candidateId}
                        </div>
                        <div>
                            <strong>Application ID:</strong> {selectedOffer.applicationId}
                        </div>
                        <div>
                            <strong>Gross Salary:</strong> ${selectedOffer.grossSalary?.toLocaleString()}
                        </div>
                        <div>
                            <strong>Deadline:</strong> {selectedOffer.deadline ? new Date(selectedOffer.deadline).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </Card></div>

                {/* Approvals */}
                <div style={{ marginBottom: '1rem' }}><Card padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>👥 Approvals</h3>
                        <Button variant="outline" size="sm" onClick={() => setShowApproverForm(true)}>
                            + Add Approver
                        </Button>
                    </div>

                    {selectedOffer.approvals && selectedOffer.approvals.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedOffer.approvals.map((approval, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '6px'
                                }}>
                                    <div>
                                        <strong>{approval.role}</strong>
                                        <span style={{ color: '#666', marginLeft: '0.5rem' }}>({approval.employeeId})</span>
                                    </div>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        backgroundColor: approval.status === 'approved' ? '#d1fae5' :
                                            approval.status === 'rejected' ? '#fef2f2' : '#fef3c7',
                                        color: approval.status === 'approved' ? '#059669' :
                                            approval.status === 'rejected' ? '#dc2626' : '#d97706'
                                    }}>
                                        {approval.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#666', textAlign: 'center' }}>No approvers added yet.</p>
                    )}
                </Card></div>

                {/* Actions */}
                <Card padding="md">
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>🔧 Actions</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {selectedOffer.status === 'draft' && (
                            <Button variant="primary" onClick={() => handleFinalize(selectedOffer._id)}>
                                Finalize & Send to Candidate
                            </Button>
                        )}
                        {selectedOffer.status === 'approved' && (
                            <Button variant="primary" onClick={() => handleFinalize(selectedOffer._id)}>
                                Send Offer to Candidate
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    // Main List View
    const filteredOffers = getFilteredOffers();

    return (
        <div className={styles.listContainer}>
            <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: 0 }}>
                <div>
                    <h2 style={{ margin: 0 }}>Job Offers Management</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                        Manage offers and approval workflows (REC-014)
                    </p>
                </div>
                <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                    + Create New Offer
                </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Filters */}
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}><Card padding="sm">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, marginRight: '0.5rem' }}>Status:</span>
                    {(['all', 'draft', 'pending_approval', 'approved', 'sent_to_candidate', 'accepted', 'rejected_by_candidate'] as OfferStatus[]).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                padding: '0.4rem 0.75rem',
                                borderRadius: '16px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                backgroundColor: filter === status ? '#3b82f6' : '#f3f4f6',
                                color: filter === status ? 'white' : '#666'
                            }}
                        >
                            {status === 'all' ? 'All' : STATUS_CONFIG[status]?.label || status}
                        </button>
                    ))}
                </div>
            </Card></div>

            {filteredOffers.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}><Card padding="lg">
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>No offers found.</p>
                    <p style={{ color: '#999' }}>Create a new offer to get started.</p>
                </Card></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    {filteredOffers.map((offer) => {
                        const statusStyle = getStatusStyle(offer.status);
                        return (
                            <div key={offer._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOffer(offer)}><Card padding="md">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <h4 style={{ margin: 0 }}>Offer #{offer._id.slice(-8)}</h4>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.color
                                            }}>
                                                {statusStyle.label}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                                            <span>👤 Candidate: {offer.candidateId.slice(-6)}</span>
                                            <span>💰 ${offer.grossSalary?.toLocaleString()}</span>
                                            {offer.deadline && <span>⏰ {new Date(offer.deadline).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedOffer(offer); }}>
                                        View Details →
                                    </Button>
                                </div>

                                {offer.approvals && offer.approvals.length > 0 && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {offer.approvals.map((a, i) => (
                                            <span key={i} style={{
                                                fontSize: '0.75rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                backgroundColor: a.status === 'approved' ? '#d1fae5' : '#fef3c7',
                                                color: a.status === 'approved' ? '#059669' : '#d97706'
                                            }}>
                                                {a.role}: {a.status}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Card></div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
