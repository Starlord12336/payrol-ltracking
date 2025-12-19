'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './leaves.module.css';
import { LeavesProvider } from './contexts/LeavesContext';
import { NotificationBell } from './components/NotificationBell';

export default function LeavesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <LeavesProvider>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Leaves Management</h1>
                </header>

                <nav className={styles.nav}>
                    <div style={{ flex: 1, display: 'flex', gap: '2rem' }}>
                        <Link
                            href="/modules/leaves"
                            className={`${styles.navLink} ${isActive('/modules/leaves') && !isActive('/modules/leaves/') ? styles.activeNavLink : ''}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/modules/leaves/request"
                            className={`${styles.navLink} ${isActive('/modules/leaves/request') ? styles.activeNavLink : ''}`}
                        >
                            New Request
                        </Link>
                        <Link
                            href="/modules/leaves/history"
                            className={`${styles.navLink} ${isActive('/modules/leaves/history') ? styles.activeNavLink : ''}`}
                        >
                            History
                        </Link>
                        <Link
                            href="/modules/leaves/approval"
                            className={`${styles.navLink} ${isActive('/modules/leaves/approval') ? styles.activeNavLink : ''}`}
                        >
                            Approvals
                        </Link>
                        <Link
                            href="/modules/leaves/team"
                            className={`${styles.navLink} ${isActive('/modules/leaves/team') ? styles.activeNavLink : ''}`}
                        >
                            Team Balances
                        </Link>
                        <Link
                            href="/modules/leaves/calendar"
                            className={`${styles.navLink} ${isActive('/modules/leaves/calendar') ? styles.activeNavLink : ''}`}
                        >
                            Team Calendar
                        </Link>
                        <Link
                            href="/modules/leaves/admin"
                            className={`${styles.navLink} ${isActive('/modules/leaves/admin') ? styles.activeNavLink : ''}`}
                        >
                            Admin Portal
                        </Link>
                    </div>
                    {/* <NotificationBell /> User requested removal */}
                </nav>
                <main>{children}</main>
            </div>
        </LeavesProvider>
    );
}
