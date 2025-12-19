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
import { profileApi } from '@/app/modules/employee-profile/api/profileApi';
import type { ProfileData } from '@/app/modules/employee-profile/api/profileApi';
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
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

  // Fetch user profile for name and picture
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const profileData = await profileApi.getMyProfile();
          setProfile(profileData);
        } catch (err) {
          console.error('Error fetching profile:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
        setProfilePictureUrl(null);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  // Load profile picture using the same logic as ProfilePictureSection
  useEffect(() => {
    let currentBlobUrl: string | null = null;

    const loadProfilePicture = async () => {
      if (profile?.profilePictureUrl) {
        const pictureUrl = profileApi.getProfilePictureUrl(profile.profilePictureUrl);

        // Check if it's a GridFS URL (needs authentication)
        if (pictureUrl && pictureUrl.includes('/employee-profile/me/profile-picture')) {
          try {
            // Fetch image with credentials
            const response = await fetch(pictureUrl, {
              credentials: 'include',
            });

            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              currentBlobUrl = blobUrl;
              setProfilePictureUrl(blobUrl);
              setImageError(false);
            } else {
              setImageError(true);
              setProfilePictureUrl(null);
            }
          } catch (err) {
            console.error('Error loading profile picture:', err);
            setImageError(true);
            setProfilePictureUrl(null);
          }
        } else if (pictureUrl) {
          // External URL - use directly
          setProfilePictureUrl(pictureUrl);
          setImageError(false);
        }
      } else {
        setProfilePictureUrl(null);
        setImageError(false);
      }
    };

    loadProfilePicture();

    // Cleanup blob URL on unmount or when URL changes
    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [profile?.profilePictureUrl]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileMenuOpen && !target.closest(`.${styles.profileMenuContainer}`)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isProfileMenuOpen]);

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
    // HR_ADMIN should NOT have access to performance module (not in user stories)
    if (
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.SYSTEM_ADMIN) ||
      userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
      userRoles.includes(SystemRole.HR_EMPLOYEE) ||
      userType === 'employee'
    ) {
      items.push({
        label: 'Performance',
        route: ROUTES.PERFORMANCE,
        roles: [
          SystemRole.HR_MANAGER,
          SystemRole.SYSTEM_ADMIN,
          SystemRole.DEPARTMENT_HEAD,
          SystemRole.HR_EMPLOYEE,
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
    setIsProfileMenuOpen(false);
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };



  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    // Use profile name if available, otherwise fall back to email
    if (profile?.fullName) {
      return profile.fullName;
    }
    if (profile?.firstName || profile?.lastName) {
      return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || user.email || 'User';
    }
    return user.email || 'User';
  };

  const getUserRole = () => {
    if (!user) return '';
    // If candidate, show "Candidate"
    if (user.userType === 'candidate') {
      return 'Candidate';
    }
    // Otherwise show the first role, or "Employee" as fallback
    const roles = user.roles || [];
    if (roles.length > 0) {
      // Format role name (e.g., "HR Manager" instead of "HR_MANAGER")
      return roles[0].replace(/_/g, ' ');
    }
    return 'Employee';
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
              <div className={styles.profileMenuContainer}>
                <div className={styles.userInfo} onClick={toggleProfileMenu}>
                  {profilePictureUrl && !imageError ? (
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className={styles.profilePicture}
                      onError={() => setImageError(true)}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className={styles.profilePicturePlaceholder}>
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.userTextInfo}>
                    <span className={styles.userName}>{getUserDisplayName()}</span>
                    <span className={styles.userType}>{getUserRole()}</span>
                  </div>
                </div>

                {isProfileMenuOpen && (
                  <div className={styles.profileMenu}>
                    <div className={styles.profileMenuHeader}>
                      <div className={styles.profileMenuName}>{getUserDisplayName()}</div>
                      <div className={styles.profileMenuRole}>{getUserRole()}</div>
                    </div>
                    <div className={styles.profileMenuDivider}></div>
                    <div className={styles.profileMenuDetails}>
                      {user?.email && (
                        <div className={styles.profileMenuDetail}>
                          <span className={styles.profileMenuLabel}>Email:</span>
                          <span className={styles.profileMenuValue}>{user.email}</span>
                        </div>
                      )}
                      {profile?.employeeNumber && (
                        <div className={styles.profileMenuDetail}>
                          <span className={styles.profileMenuLabel}>Employee #:</span>
                          <span className={styles.profileMenuValue}>{profile.employeeNumber}</span>
                        </div>
                      )}
                      {profile?.candidateNumber && (
                        <div className={styles.profileMenuDetail}>
                          <span className={styles.profileMenuLabel}>Candidate #:</span>
                          <span className={styles.profileMenuValue}>{profile.candidateNumber}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.profileMenuDivider}></div>
                    <button
                      className={styles.profileMenuLogout}
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
            <div className={styles.profileMenuContainer}>
              <div className={styles.userInfo} onClick={toggleProfileMenu}>
                {profilePictureUrl && !imageError ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className={styles.profilePicture}
                    onError={() => setImageError(true)}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className={styles.profilePicturePlaceholder}>
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.userTextInfo}>
                  <span className={styles.userName}>{getUserDisplayName()}</span>
                  <span className={styles.userType}>{getUserRole()}</span>
                </div>
              </div>

              {isProfileMenuOpen && (
                <div className={styles.profileMenu}>
                  <div className={styles.profileMenuHeader}>
                    <div className={styles.profileMenuName}>{getUserDisplayName()}</div>
                    <div className={styles.profileMenuRole}>{getUserRole()}</div>
                  </div>
                  <div className={styles.profileMenuDivider}></div>
                  <div className={styles.profileMenuDetails}>
                    {user?.email && (
                      <div className={styles.profileMenuDetail}>
                        <span className={styles.profileMenuLabel}>Email:</span>
                        <span className={styles.profileMenuValue}>{user.email}</span>
                      </div>
                    )}
                    {profile?.employeeNumber && (
                      <div className={styles.profileMenuDetail}>
                        <span className={styles.profileMenuLabel}>Employee #:</span>
                        <span className={styles.profileMenuValue}>{profile.employeeNumber}</span>
                      </div>
                    )}
                    {profile?.candidateNumber && (
                      <div className={styles.profileMenuDetail}>
                        <span className={styles.profileMenuLabel}>Candidate #:</span>
                        <span className={styles.profileMenuValue}>{profile.candidateNumber}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.profileMenuDivider}></div>
                  <button
                    className={styles.profileMenuLogout}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

