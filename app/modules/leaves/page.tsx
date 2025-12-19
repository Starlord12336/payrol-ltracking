'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { leavesApi } from './api/leavesApi';
import styles from './leaves.module.css';
import { useLeaves } from './contexts/LeavesContext';

interface TeamMemberBalance {
  employeeId: string;
  employeeName: string;
  email: string;
  balances: Array<{
    leaveTypeId: string;
    leaveTypeName: string;
    yearlyEntitlement: number;
    taken: number;
    pending: number;
    remaining: number;
  }>;
}

export default function LeavesDashboard() {
  const { balances, requests } = useLeaves();
  const { user } = useAuth();
  const [teamBalances, setTeamBalances] = useState<TeamMemberBalance[]>([]);
  const [loadingTeamBalances, setLoadingTeamBalances] = useState(false);

  const currentUserId = user?.userid || 'me';
  const recentRequests = requests
    .filter(r => String(r.employeeId) === String(currentUserId) || r.employeeName === 'Me')
    .filter(r => r.days > 0)
    .slice(0, 3);

  // Check if user is a manager/department head
  const userRoles = user?.roles || [];
  const isManager =
    userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  // Fetch team balances if user is a manager
  useEffect(() => {
    if (isManager) {
      const fetchTeamBalances = async () => {
        try {
          setLoadingTeamBalances(true);
          const data = await leavesApi.getTeamBalances();
          // De-duplicate by employeeId
          const uniqueData = (data || []).reduce((acc: TeamMemberBalance[], current: TeamMemberBalance) => {
            // Filter out self and check for uniqueness
            if (String(current.employeeId) !== String(currentUserId) && !acc.find(item => item.employeeId === current.employeeId)) {
              acc.push(current);
            }
            return acc;
          }, []);
          setTeamBalances(uniqueData);
        } catch (error) {
          console.error('Error fetching team balances:', error);
          setTeamBalances([]);
        } finally {
          setLoadingTeamBalances(false);
        }
      };
      fetchTeamBalances();
    }
  }, [isManager, currentUserId]);

  return (
    <div>
      <div className={styles.actionRow}>
        <Link href="/modules/leaves/request">
          <Button variant="primary">Apply for Leave</Button>
        </Link>
      </div>

      <h2 className={styles.sectionTitle}>My Balances</h2>
      <div className={styles.grid}>
        {balances
          .filter(b => b.type && b.type !== 'Unknown' && b.type !== 'Unknown Type')
          .map((balance, index) => (
            <Card key={index} className={styles.balanceCard} hover>
              <span className={styles.balanceLabel}>{balance.type}</span>
              <span className={styles.balanceValue}>
                {balance.remaining} <span style={{ fontSize: '1rem', color: '#666' }}>/ {balance.total}</span>
              </span>
              <span style={{ fontSize: '0.875rem', color: '#888' }}>Days Available</span>
            </Card>
          ))}
      </div>

      {isManager && (
        <>
          <h2 className={styles.sectionTitle}>Team Balances</h2>
          {loadingTeamBalances ? (
            <Card>
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <p>Loading team balances...</p>
              </div>
            </Card>
          ) : teamBalances.length === 0 ? (
            <Card>
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <p style={{ color: '#666' }}>No team members found.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {teamBalances.map((member) => (
                <div key={member.employeeId} style={{ padding: '1rem', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                      {member.employeeName}
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                      {member.email}
                    </p>
                  </div>
                  <div className={styles.grid} style={{ marginTop: '0.75rem' }}>
                    {member.balances.map((balance, idx) => (
                      <Card key={idx} className={styles.balanceCard} hover>
                        <span className={styles.balanceLabel}>{balance.leaveTypeName}</span>
                        <span className={styles.balanceValue}>
                          {balance.remaining} <span style={{ fontSize: '1rem', color: '#666' }}>/ {balance.yearlyEntitlement}</span>
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                          Used: {balance.taken} | Pending: {balance.pending}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <h2 className={styles.sectionTitle}>Recent Requests</h2>
      <Card>
        <div style={{ padding: '1rem' }}>
          {recentRequests.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No recent requests found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentRequests.map(req => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  <span>{req.leaveTypeName}</span>
                  <span style={{ fontWeight: 600, color: req.status === 'Approved' ? 'green' : 'orange' }}>{req.status}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link href="/modules/leaves/history" style={{ color: 'var(--primary-main)', textDecoration: 'underline' }}>
              View Full History
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
