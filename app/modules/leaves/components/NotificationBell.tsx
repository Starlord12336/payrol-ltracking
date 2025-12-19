'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/Card';

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', title: 'Request Approved', message: 'Your annual leave was approved.', read: false, createdAt: '2025-12-17T10:00:00' },
        { id: '2', title: 'New Request', message: 'John Doe submitted a new request.', read: true, createdAt: '2025-12-16T14:30:00' },
    ]);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Simulate polling
    useEffect(() => {
        const interval = setInterval(() => {
            // In a real app, fetch from /notifications/u1
            console.log('Polling notifications...');
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        // api.patch(`/notifications/${id}/read`)
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0.5rem'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: '0.75rem',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    width: '300px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: '0.5rem',
                }}>
                    <Card padding="none">
                        <div style={{ padding: '1rem', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                            Notifications
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>No notifications</div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid #eee',
                                            background: n.read ? 'white' : '#f0f9ff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{n.title}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#666' }}>{n.message}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
