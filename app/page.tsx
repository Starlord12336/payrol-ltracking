/**
 * Homepage Dashboard
 * Role-based dashboard with live statistics and quick actions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button, Card } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { ROUTES } from '@/shared/constants';
import { useRouter } from 'next/navigation';
import { hrApi } from '@/app/modules/hr/api/hrApi';
import { profileApi } from '@/app/modules/employee-profile/api/profileApi';
import styles from './page.module.css';

interface StatCard {
  title: string;
  count: number;
  icon: string;
  route: string;
  color: 'primary' | 'accent' | 'success' | 'warning';
}

interface QuickAction {
  label: string;
  route: string;
  icon: string;
  roles?: SystemRole[];
  userTypes?: ('employee' | 'candidate')[];
}

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    if (!user) return;

    setLoadingStats(true);
    const userRoles = user.roles || [];
    const userType = user.userType;
    const newStats: StatCard[] = [];

    try {
      // HR Users: Pending change requests
      const isHrUser =
        userRoles.includes(SystemRole.HR_MANAGER) ||
        userRoles.includes(SystemRole.HR_EMPLOYEE) ||
        userRoles.includes(SystemRole.HR_ADMIN) ||
        userRoles.includes(SystemRole.SYSTEM_ADMIN);

      if (isHrUser) {
        try {
          const pendingRequests = await hrApi.getPendingChangeRequests();
          newStats.push({
            title: 'Pending Change Requests',
            count: pendingRequests.length,
            icon: '📝',
            route: ROUTES.HR_CHANGE_REQUESTS,
            color: 'warning',
          });
        } catch (error) {
          console.error('Error fetching pending change requests:', error);
        }
      }

      // Employees: Their change requests
      if (userType === 'employee') {
        try {
          const myRequests = await profileApi.getMyChangeRequests();
          const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;
          if (pendingCount > 0) {
            newStats.push({
              title: 'My Pending Requests',
              count: pendingCount,
              icon: '📋',
              route: `${ROUTES.EMPLOYEE_PROFILE}#change-requests`,
              color: 'primary',
            });
          }
        } catch (error) {
          console.error('Error fetching my change requests:', error);
        }
      }

      // Managers: Pending leave requests (placeholder - API may not exist yet)
      const isManager =
        userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
        userRoles.includes(SystemRole.HR_MANAGER) ||
        userRoles.includes(SystemRole.HR_ADMIN);

      if (isManager) {
        // TODO: Implement when leave API is available
        // try {
        //   const pendingLeaves = await leavesApi.getPendingLeaveRequests();
        //   newStats.push({
        //     title: 'Pending Leave Requests',
        //     count: pendingLeaves.length,
        //     icon: '📅',
        //     route: ROUTES.LEAVES,
        //     color: 'accent',
        //   });
        // } catch (error) {
        //   console.error('Error fetching pending leave requests:', error);
        // }
      }

      // Candidates: Application status (placeholder - API may not exist yet)
      if (userType === 'candidate') {
        // TODO: Implement when recruitment API is available
        // try {
        //   const applications = await recruitmentApi.getMyApplications();
        //   const activeCount = applications.filter(a => 
        //     a.status !== 'REJECTED' && a.status !== 'WITHDRAWN'
        //   ).length;
        //   if (activeCount > 0) {
        //     newStats.push({
        //       title: 'Active Applications',
        //       count: activeCount,
        //       icon: '💼',
        //       route: ROUTES.RECRUITMENT,
        //       color: 'success',
        //     });
        //   }
        // } catch (error) {
        //   console.error('Error fetching applications:', error);
        // }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
      setStats(newStats);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, user, fetchDashboardStats]);

  const getQuickActions = (): QuickAction[] => {
    if (!user) return [];

    const userRoles = user.roles || [];
    const userType = user.userType;
    const actions: QuickAction[] = [];

    // Home
    actions.push({ label: 'Home', route: ROUTES.HOME, icon: '🏠' });

    // Profile
    if (userType === 'employee') {
      actions.push({
        label: 'My Profile',
        route: ROUTES.EMPLOYEE_PROFILE,
        icon: '👤',
        userTypes: ['employee'],
      });
    } else if (userType === 'candidate') {
      actions.push({
        label: 'Candidate Profile',
        route: ROUTES.EMPLOYEE_PROFILE,
        icon: '👤',
        userTypes: ['candidate'],
      });
    }

    // HR Dashboard
    const isHrUser =
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.HR_EMPLOYEE) ||
      userRoles.includes(SystemRole.HR_ADMIN) ||
      userRoles.includes(SystemRole.SYSTEM_ADMIN);

    if (isHrUser) {
      actions.push({
        label: 'HR Dashboard',
        route: ROUTES.HR_DASHBOARD,
        icon: '📋',
        roles: [
          SystemRole.HR_MANAGER,
          SystemRole.HR_EMPLOYEE,
          SystemRole.HR_ADMIN,
          SystemRole.SYSTEM_ADMIN,
        ],
      });
    }

    // Organization Structure
    const canAccessOrgStructure =
      userRoles.includes(SystemRole.HR_ADMIN) ||
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.SYSTEM_ADMIN) ||
      userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
      userRoles.includes(SystemRole.DEPARTMENT_EMPLOYEE);

    if (canAccessOrgStructure) {
      actions.push({
        label: 'Organization',
        route: ROUTES.ORGANIZATION_STRUCTURE,
        icon: '🏢',
        roles: [
          SystemRole.HR_ADMIN,
          SystemRole.HR_MANAGER,
          SystemRole.SYSTEM_ADMIN,
          SystemRole.DEPARTMENT_HEAD,
          SystemRole.DEPARTMENT_EMPLOYEE,
        ],
      });
    }

    // Recruitment
    if (
      userRoles.includes(SystemRole.HR_EMPLOYEE) ||
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.RECRUITER)
    ) {
      actions.push({
        label: 'Recruitment',
        route: ROUTES.RECRUITMENT,
        icon: '💼',
        roles: [
          SystemRole.HR_EMPLOYEE,
          SystemRole.HR_MANAGER,
          SystemRole.RECRUITER,
        ],
      });
    }

    if (userType === 'candidate') {
      actions.push({
        label: 'My Applications',
        route: ROUTES.RECRUITMENT,
        icon: '📄',
        userTypes: ['candidate'],
      });
    }

    // Time Management
    if (
      userRoles.includes(SystemRole.HR_ADMIN) ||
      userRoles.includes(SystemRole.SYSTEM_ADMIN) ||
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.DEPARTMENT_HEAD)
    ) {
      actions.push({
        label: 'Time Management',
        route: ROUTES.TIME_MANAGEMENT,
        icon: '🕐',
        roles: [
          SystemRole.HR_ADMIN,
          SystemRole.SYSTEM_ADMIN,
          SystemRole.HR_MANAGER,
          SystemRole.DEPARTMENT_HEAD,
        ],
      });
    }

    // Payroll
    if (
      userRoles.includes(SystemRole.PAYROLL_SPECIALIST) ||
      userRoles.includes(SystemRole.PAYROLL_MANAGER)
    ) {
      actions.push({
        label: 'Payroll',
        route: ROUTES.PAYROLL_TRACKING,
        icon: '💵',
        roles: [SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER],
      });
    }

    // Leaves
    if (userType === 'employee') {
      actions.push({
        label: 'Leaves',
        route: ROUTES.LEAVES,
        icon: '📅',
        userTypes: ['employee'],
      });
    }

    // Performance
    if (userType === 'employee') {
      actions.push({
        label: 'Performance',
        route: ROUTES.PERFORMANCE,
        icon: '📈',
        userTypes: ['employee'],
      });
    }

    return actions;
  };

  const hasAccess = (action: QuickAction): boolean => {
    if (!user) return false;

    if (action.roles && action.roles.length > 0) {
      const userRoles = user.roles || [];
      if (!action.roles.some(role => userRoles.includes(role))) {
        return false;
      }
    }

    if (action.userTypes && action.userTypes.length > 0) {
      if (!action.userTypes.includes(user.userType as 'employee' | 'candidate')) {
        return false;
      }
    }

    return true;
  };

  const getDisplayName = (): string => {
    return user?.email || 'User';
  };

  const getRoleDisplay = (): string => {
    const roles = user?.roles || [];
    if (roles.length === 0) return user?.userType || 'User';

    const primaryRoles = [
      SystemRole.SYSTEM_ADMIN,
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.PAYROLL_MANAGER,
      SystemRole.DEPARTMENT_HEAD,
    ];

    for (const role of primaryRoles) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return roles[0];
  };

  const getWelcomeSubtitle = (): string => {
    if (!user) return 'Welcome back!';

    const userType = user.userType;
    const roles = user.roles || [];

    if (userType === 'employee') {
      if (roles.includes(SystemRole.HR_ADMIN) || roles.includes(SystemRole.HR_MANAGER)) {
        return 'Manage your HR operations and team';
      }
      if (roles.includes(SystemRole.DEPARTMENT_HEAD)) {
        return 'Manage your department and team members';
      }
      return 'Manage your profile and work-related tasks';
    }

    if (userType === 'candidate') {
      return 'Track your job applications and profile';
    }

    return 'Welcome to the HR Management System';
  };

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.container}>
        <div className={styles.landingContent}>
          {/* Hero Section */}
          <div className={styles.heroSection}>
            <h1 className={styles.heroTitle}>Find Your Next Career Opportunity</h1>
            <p className={styles.heroSubtitle}>
              Join our team and discover exciting career opportunities. Create your profile, browse open positions, and apply for jobs that match your skills and aspirations.
            </p>
            <div className={styles.heroActions}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/register')}
              >
                Create Account & Apply
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/login')}
              >
                Already Have an Account? Sign In
              </Button>
            </div>
          </div>

          {/* Why Join Us Section */}
          <div className={styles.benefitsSection}>
            <h2 className={styles.sectionTitle}>Why Join Our Team?</h2>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>💼</div>
                <h3>Career Growth</h3>
                <p>Access to diverse job opportunities and career advancement paths</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>🎯</div>
                <h3>Easy Application</h3>
                <p>Simple and streamlined application process with real-time status tracking</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>📱</div>
                <h3>Manage Your Profile</h3>
                <p>Keep your resume and profile updated in one place</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>🔔</div>
                <h3>Stay Updated</h3>
                <p>Get notified about new opportunities and application status updates</p>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className={styles.howItWorksSection}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3>Create Your Account</h3>
                <p>Register with your email and basic information to get started</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3>Complete Your Profile</h3>
                <p>Add your resume, skills, experience, and educational background</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3>Browse & Apply</h3>
                <p>Explore available positions and submit your applications</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>4</div>
                <h3>Track Your Applications</h3>
                <p>Monitor your application status and receive updates from recruiters</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className={styles.ctaSection}>
            <Card padding="lg" shadow="warm" className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Ready to Start Your Journey?</h2>
              <p className={styles.ctaText}>
                Join hundreds of candidates who have found their dream jobs through our platform
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/register')}
                className={styles.ctaButton}
              >
                Get Started Now
              </Button>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  const quickActions = getQuickActions().filter(hasAccess);

  return (
    <main className={styles.container}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Welcome, {getDisplayName()}!
          </h1>
          <p className={styles.welcomeSubtitle}>{getWelcomeSubtitle()}</p>
          <div className={styles.badges}>
            {(user?.employeeNumber || user?.candidateNumber) && (
              <span className={styles.badge}>
                {user?.employeeNumber ? `Employee #${user.employeeNumber}` : `Candidate #${user?.candidateNumber}`}
              </span>
            )}
            <span className={styles.badge}>{getRoleDisplay()}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats.length > 0 && (
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${styles.statCard} ${styles[`statCard${stat.color.charAt(0).toUpperCase() + stat.color.slice(1)}`]}`}
              onClick={() => router.push(stat.route)}
            >
              <Card padding="lg" shadow="warm">
                <div className={styles.statContent}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <div className={styles.statInfo}>
                    <div className={styles.statCount}>{stat.count}</div>
                    <div className={styles.statTitle}>{stat.title}</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => (
            <button
              key={action.route}
              className={styles.actionCard}
              onClick={() => router.push(action.route)}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className={styles.recentActivitySection}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <Card padding="lg" shadow="warm" className={styles.activityCard}>
          <p className={styles.placeholderText}>
            Recent activity and updates will appear here
          </p>
        </Card>
      </div>
    </main>
  );
}
