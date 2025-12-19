/**
 * ========================== EMAD ==========================
 * Payroll Configuration Module - Main Page
 * This module handles payroll configuration and policy setup
 *
 * Tabs implemented by Emad:
 * - Dashboard (Approval Dashboard)
 * - Pay Grades
 * - Allowances
 * - Tax Rules
 * - Payroll Periods (NEW - Approval Workflow)
 *
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute';
import PayGradeList from './components/PayGradeList';
import AllowanceList from './components/AllowanceList';
import TaxRuleList from './components/TaxRuleList';
import ApprovalDashboard from './components/ApprovalDashboard';
import InsuranceBracketList from './components/InsuranceBracketList';
import PayrollPolicyList from './components/PayrollPolicyList';
import SigningBonusList from './components/SigningBonusList';
import PayTypeList from './components/PayTypeList';
import TerminationBenefitList from './components/TerminationBenefitList';
import CompanySettingsList from './components/CompanySettingsList';
import PayrollPeriodList from './components/PayrollPeriodList';
import styles from './page.module.css';

// ========================== EMAD - Tab Configuration ==========================
type TabId =
  | 'dashboard'
  | 'payGrades'
  | 'allowances'
  | 'taxRules'
  | 'insuranceBrackets'
  | 'payrollPolicies'
  | 'signingBonuses'
  | 'payTypes'
  | 'terminationBenefits'
  | 'companySettings'
  | 'payrollPeriods';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const EMAD_TABS: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'payrollPeriods', label: 'Payroll Periods', icon: '📅' },
  { id: 'payGrades', label: 'Pay Grades', icon: '💰' },
  { id: 'allowances', label: 'Allowances', icon: '🎁' },
  { id: 'taxRules', label: 'Tax Rules', icon: '📋' },
];

// ========================== JOHN - Tab Configuration ==========================
const JOHN_TABS: Tab[] = [
  { id: 'insuranceBrackets', label: 'Insurance Brackets', icon: '🏥' },
  { id: 'payrollPolicies', label: 'Payroll Policies', icon: '📜' },
  { id: 'signingBonuses', label: 'Signing Bonuses', icon: '✍️' },
];
// ========================== JOHN - End Tab Configuration ==========================

// ========================== ESLAM - Tab Configuration ==========================
const ESLAM_TABS: Tab[] = [
  { id: 'payTypes', label: 'Pay Types', icon: '⏰' },
  { id: 'terminationBenefits', label: 'Termination Benefits', icon: '🎯' },
  { id: 'companySettings', label: 'Company Settings', icon: '⚙️' },
];
// ========================== ESLAM - End Tab Configuration ==========================

function PayrollConfigurationContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Get first role or undefined for ApprovalDashboard
  const userRole = user?.roles?.[0];

  const renderTabContent = () => {
    switch (activeTab) {
      // ========================== EMAD - Tab Content ==========================
      case 'dashboard':
        return <ApprovalDashboard userRole={userRole} />;
      case 'payrollPeriods':
        return <PayrollPeriodList userRole={userRole} />;
      case 'payGrades':
        return <PayGradeList />;
      case 'allowances':
        return <AllowanceList />;
      case 'taxRules':
        return <TaxRuleList />;
      // ========================== EMAD - End Tab Content ==========================
      
      // ========================== JOHN - Tab Content ==========================
      case 'insuranceBrackets':
        return <InsuranceBracketList />;
      case 'payrollPolicies':
        return <PayrollPolicyList />;
      case 'signingBonuses':
        return <SigningBonusList />;
      // ========================== JOHN - End Tab Content ==========================
      
      // ========================== ESLAM - Tab Content ==========================
      case 'payTypes':
        return <PayTypeList />;
      case 'terminationBenefits':
        return <TerminationBenefitList />;
      case 'companySettings':
        return <CompanySettingsList />;
      // ========================== ESLAM - End Tab Content ==========================
      
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Payroll Configuration</h1>
        <p className={styles.pageSubtitle}>
          Manage payroll periods, pay grades, allowances, tax rules, insurance brackets, payroll
          policies, signing bonuses, pay types, termination benefits, and company settings
        </p>
      </div>

      {/* Main Content */}
      <Card padding="lg" shadow="md">
        {/* Tab Navigation */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            {/* ========================== EMAD - Tabs ========================== */}
            {EMAD_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            {/* ========================== EMAD - End Tabs ========================== */}
            
            {/* ========================== JOHN - Tabs ========================== */}
            {JOHN_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            {/* ========================== JOHN - End Tabs ========================== */}
            
            {/* ========================== ESLAM - Tabs ========================== */}
            {ESLAM_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            {/* ========================== ESLAM - End Tabs ========================== */}
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
}

export default function PayrollConfigurationPage() {
  return (
    <ProtectedRoute>
      <PayrollConfigurationContent />
    </ProtectedRoute>
  );
}

