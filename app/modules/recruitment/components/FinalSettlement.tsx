'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import styles from './RecruitmentForms.module.css';

export default function FinalSettlement() {
    const [terminationId, setTerminationId] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [loading, setLoading] = useState(false);
    const [finalPay, setFinalPay] = useState<any>(null);
    const [leaveBalance, setLeaveBalance] = useState<any>(null);
    const [benefits, setBenefits] = useState<any>(null);
    const [notificationHistory, setNotificationHistory] = useState<any[]>([]);

    const handleLoadData = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!terminationId && !employeeId) return;

        setLoading(true);
        try {
            if (terminationId) {
                const [pay, history] = await Promise.all([
                    recruitmentApi.calculateFinalPay(terminationId),
                    recruitmentApi.getOffboardingNotificationHistory(terminationId)
                ]);
                setFinalPay(pay);
                setNotificationHistory(Array.isArray(history) ? history : []);
            }
            if (employeeId) {
                const [leave, ben] = await Promise.all([
                    recruitmentApi.getLeaveBalance(employeeId),
                    recruitmentApi.getEmployeeBenefits(employeeId)
                ]);
                setLeaveBalance(leave);
                setBenefits(ben);
            }
        } catch (error: any) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (type: string) => {
        if (!terminationId) return;
        try {
            await recruitmentApi.sendOffboardingNotification(terminationId, type);
            alert(`${type} notification sent!`);
            // Refresh history
            const history = await recruitmentApi.getOffboardingNotificationHistory(terminationId);
            setNotificationHistory(Array.isArray(history) ? history : []);
        } catch (e) {
            alert('Failed to send notification');
        }
    };

    const handleTerminateBenefits = async () => {
        if (!terminationId) return;
        try {
            await recruitmentApi.triggerBenefitsTermination(terminationId, new Date().toISOString());
            alert('Benefits termination triggered!');
        } catch (e) {
            alert('Failed to terminate benefits');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card padding="lg">
                <h3>Final Settlement Calculator</h3>
                <form onSubmit={handleLoadData} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <Input
                        placeholder="Termination ID"
                        value={terminationId}
                        onChange={(e) => setTerminationId(e.target.value)}
                    />
                    <Input
                        placeholder="Employee ID"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    />
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Loading...' : 'Load Data'}
                    </Button>
                </form>
            </Card>

            {finalPay && (
                <Card padding="md">
                    <h4 style={{ marginBottom: '1rem' }}>Final Pay Calculation</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Total Amount</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>
                                ${(finalPay.totalAmount || finalPay.finalPay || 0).toLocaleString()}
                            </p>
                        </div>
                        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Prorated Salary</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                ${(finalPay.proratedSalary || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {leaveBalance && (
                <Card padding="md">
                    <h4 style={{ marginBottom: '1rem' }}>Leave Balance</h4>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Annual Leave</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{leaveBalance.annual || 0} days</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Sick Leave</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{leaveBalance.sick || 0} days</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Total Balance</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>{leaveBalance.total || 0} days</p>
                        </div>
                    </div>
                </Card>
            )}

            {benefits && (
                <Card padding="md">
                    <h4 style={{ marginBottom: '1rem' }}>Employee Benefits</h4>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {benefits.health && <span style={{ padding: '4px 12px', background: '#dcfce7', borderRadius: '20px', color: '#166534' }}>Health Insurance</span>}
                        {benefits.dental && <span style={{ padding: '4px 12px', background: '#dcfce7', borderRadius: '20px', color: '#166534' }}>Dental</span>}
                        {benefits.vision && <span style={{ padding: '4px 12px', background: '#dcfce7', borderRadius: '20px', color: '#166534' }}>Vision</span>}
                        {benefits.pension && <span style={{ padding: '4px 12px', background: '#eff6ff', borderRadius: '20px', color: '#2563eb' }}>Pension</span>}
                    </div>
                    <Button variant="error" onClick={handleTerminateBenefits} style={{ marginTop: '1rem' }}>
                        Trigger Benefits Termination
                    </Button>
                </Card>
            )}

            {terminationId && (
                <Card padding="md">
                    <h4 style={{ marginBottom: '1rem' }}>Send Notifications</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Button variant="outline" onClick={() => handleSendNotification('FINAL_PAY')}>Final Pay Notice</Button>
                        <Button variant="outline" onClick={() => handleSendNotification('BENEFITS_END')}>Benefits End Notice</Button>
                        <Button variant="outline" onClick={() => handleSendNotification('EXIT_REMINDER')}>Exit Reminder</Button>
                        <Button variant="outline" onClick={() => handleSendNotification('CLEARANCE')}>Clearance Notice</Button>
                    </div>
                </Card>
            )}

            {notificationHistory.length > 0 && (
                <Card padding="md">
                    <h4 style={{ marginBottom: '1rem' }}>Notification History</h4>
                    {notificationHistory.map((item: any, idx: number) => (
                        <div key={idx} style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                            <p style={{ fontWeight: 500 }}>{item.type || 'Notification'}</p>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                Sent: {item.sentAt ? new Date(item.sentAt).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                    ))}
                </Card>
            )}
        </div>
    );
}
