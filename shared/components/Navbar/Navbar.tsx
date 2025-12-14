/**
 * Navigation Bar Component
 * Provides main navigation for the application
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { ROUTES } from '@/shared/constants';
import { Button } from '../Button';
import { NotificationBell } from '../NotificationBell';
import styles from './Navbar.module.css';

interface NavItem {
  label: string;
  route: string;
  roles?: SystemRole[];
  userTypes?: ('employee' | 'candidate')[];
}

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading, refreshUser } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  // Refresh auth state when navigating from login/register to another page
  useEffect(() => {
    if (prevPathname && (prevPathname === ROUTES.LOGIN || prevPathname === ROUTES.REGISTER)) {
      if (pathname !== ROUTES.LOGIN && pathname !== ROUTES.REGISTER) {
        // User navigated away from login/register, refresh auth state
        refreshUser();
      }
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname, refreshUser]);

  // Don't show navbar on login/register pages
  if (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER) {
    return null;
  }

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    const userRoles = user.roles || [];
    const userType = user.userType;
    const items: NavItem[] = [];

    // Home - always available
    items.push({ label: 'Home', route: ROUTES.HOME });

    // Profile - based on user type
    if (userType === 'employee') {
      items.push({ label: 'My Profile', route: ROUTES.EMPLOYEE_PROFILE, userTypes: ['employee'] });
    } else if (userType === 'candidate') {
      items.push({ label: 'My Profile', route: ROUTES.EMPLOYEE_PROFILE, userTypes: ['candidate'] });
    }

    // HR Dashboard - only show for actual HR roles (not just employees with DEPARTMENT_EMPLOYEE role)
    const isHrUser =
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.HR_EMPLOYEE) ||
      userRoles.includes(SystemRole.HR_ADMIN) ||
      userRoles.includes(SystemRole.SYSTEM_ADMIN);

    // Only show HR Dashboard if user has an HR role AND is not just a regular employee
    // Check if user has ONLY DEPARTMENT_EMPLOYEE role (without any HR role)
    const isOnlyEmployee = 
      userRoles.includes(SystemRole.DEPARTMENT_EMPLOYEE) && 
      !userRoles.includes(SystemRole.HR_MANAGER) &&
      !userRoles.includes(SystemRole.HR_EMPLOYEE) &&
      !userRoles.includes(SystemRole.HR_ADMIN) &&
      !userRoles.includes(SystemRole.SYSTEM_ADMIN);

    if (isHrUser && !isOnlyEmployee) {
      items.push({
        label: 'HR Dashboard',
        route: ROUTES.HR_DASHBOARD,
        roles: [SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN],
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
      items.push({
        label: 'Organization',
        route: ROUTES.ORGANIZATION_STRUCTURE,
        roles: [SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN, SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_EMPLOYEE],
      });
    }

    // Recruitment
    if (
      userRoles.includes(SystemRole.HR_EMPLOYEE) ||
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.RECRUITER) ||
      userRoles.includes(SystemRole.HR_ADMIN) ||
      userRoles.includes(SystemRole.SYSTEM_ADMIN) ||
      userType === 'candidate'
    ) {
      items.push({
        label: 'Recruitment',
        route: ROUTES.RECRUITMENT,
        roles: [
          SystemRole.HR_EMPLOYEE,
          SystemRole.HR_MANAGER,
          SystemRole.RECRUITER,
          SystemRole.HR_ADMIN,
          SystemRole.SYSTEM_ADMIN,
        ],
        userTypes: ['candidate'],
      });
    }

    // Performance
    if (
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.HR_ADMIN) ||
      userRoles.includes(SystemRole.SYSTEM_ADMIN) ||
      userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
      userType === 'employee'
    ) {
      items.push({
        label: 'Performance',
        route: ROUTES.PERFORMANCE,
        roles: [
          SystemRole.HR_MANAGER,
          SystemRole.HR_ADMIN,
          SystemRole.SYSTEM_ADMIN,
          SystemRole.DEPARTMENT_HEAD,
        ],
        userTypes: ['employee'],
      });
    }

    // Leaves
    if (userType === 'employee' || isHrUser) {
      items.push({
        label: 'Leaves',
        route: ROUTES.LEAVES,
        userTypes: ['employee'],
        roles: [SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN],
      });
    }

    return items;
  };

  const navItems = getNavItems();

  const isActive = (route: string) => {
    if (route === ROUTES.HOME) {
      return pathname === route;
    }
    return pathname?.startsWith(route);
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    return user.email || 'User';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link href={ROUTES.HOME} className={styles.logo}>
            <span className={styles.logoIcon}>🏢</span>
            <span className={styles.logoText}>HR System</span>
          </Link>
        </div>

        {isAuthenticated && !isLoading && (
          <>
            {/* Desktop Navigation */}
            <div className={styles.desktopNav}>
              {navItems.map((item) => (
                <Link
                  key={item.route}
                  href={item.route}
                  className={`${styles.navLink} ${isActive(item.route) ? styles.active : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Section */}
            <div className={styles.rightSection}>
              <NotificationBell />
              <div className={styles.userInfo}>
                <span className={styles.userName}>{getUserDisplayName()}</span>
                {user?.userType && (
                  <span className={styles.userType}>
                    {user.userType === 'employee' ? '👤 Employee' : '📝 Candidate'}
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className={styles.mobileMenuButton} onClick={toggleMobileMenu} aria-label="Toggle menu">
              <span className={styles.hamburger}></span>
              <span className={styles.hamburger}></span>
              <span className={styles.hamburger}></span>
            </button>
          </>
        )}

        {!isAuthenticated && !isLoading && (
          <div className={styles.rightSection}>
            <Link href={ROUTES.LOGIN}>
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          {navItems.map((item) => (
            <Link
              key={item.route}
              href={item.route}
              className={`${styles.mobileNavLink} ${isActive(item.route) ? styles.active : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className={styles.mobileUserInfo}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{getUserDisplayName()}</span>
              {user?.userType && (
                <span className={styles.userType}>
                  {user.userType === 'employee' ? '👤 Employee' : '📝 Candidate'}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} fullWidth>
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

