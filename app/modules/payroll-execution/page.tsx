/**
 * Payroll Execution Module
 * This module handles payroll processing and execution
 */

'use client';

import { useState } from 'react';
import { ProtectedRoute, Button } from '@/shared/components';
import { SigningBonusesListPage, TerminationBenefitsListPage, PayrollDashboard, FinanceApprovalsPage, PayrollInitiationPage, PayrollManagingPage, FlagFixPage } from './components/payroll';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';

export default function PayrollExecutionPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'main' | 'initiation' | 'dashboard' | 'finance' | 'signingbonus' | 'terminationbenefits' | 'managing' | 'flagfix'>('main');
  
  // Check if user has Payroll Specialist, Payroll Manager or Finance Staff role
  const userRoles = user?.roles || [];
  const hasPayrollAccess =
    userRoles.includes(SystemRole.PAYROLL_SPECIALIST) ||
    userRoles.includes(SystemRole.PAYROLL_MANAGER) ||
    userRoles.includes(SystemRole.FINANCE_STAFF) || true ;
  const hasFinanceAccess = userRoles.includes(SystemRole.FINANCE_STAFF) || true;
  const hasPayrollManagerAccess = userRoles.includes(SystemRole.PAYROLL_MANAGER);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <ProtectedRoute>
        {view === 'main' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Payroll Execution
              </h1>
              <p style={{ color: '#475569', fontSize: 16 }}>
                Manage payroll processing, signing bonuses, and payroll execution workflows.
              </p>
            </div>
            
            {hasPayrollAccess ? (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setView('initiation')}
                >
                  Payroll Initiation
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setView('dashboard')}
                >
                  View Payroll Runs
                </Button>
                {hasFinanceAccess && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setView('finance')}
                  >
                    Finance Approvals
                  </Button>
                )}
                {hasPayrollManagerAccess && (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setView('managing')}
                    >
                      Payroll Management
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setView('flagfix')}
                    >
                      Fix Exceptions
                    </Button>
                  </>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setView('signingbonus')}
                >
                  View Signing Bonuses
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setView('terminationbenefits')}
                >
                  View Termination Benefits
                </Button>
              </div>
            ) : (
              <div style={{ 
                padding: 24, 
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                color: '#dc2626'
              }}>
                <p style={{ fontSize: 16, fontWeight: 600 }}>
                  Access Restricted: Only Payroll Specialists or Payroll Managers can access signing bonuses and termination benefits.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setView('main')}
              style={{ marginBottom: 16 }}
            >
              Back to Payroll Execution
            </Button>
            {view === 'initiation' && <PayrollInitiationPage />}
            {view === 'dashboard' && <PayrollDashboard />}
            {view === 'finance' && <FinanceApprovalsPage />}
            {view === 'managing' && <PayrollManagingPage />}
            {view === 'flagfix' && <FlagFixPage />}
            {view === 'signingbonus' && <SigningBonusesListPage />}
            {view === 'terminationbenefits' && <TerminationBenefitsListPage />}
          </div>
        )}
      </ProtectedRoute>
    </div>
  );
}

