import { UserRole } from '../../shared/schemas/user.schema';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * Maps UserRole enum to SystemRole enum
 * This allows controllers to use UserRole while the auth system uses SystemRole
 */
export function mapUserRoleToSystemRole(userRole: UserRole): SystemRole {
  const roleMap: Record<UserRole, SystemRole> = {
    [UserRole.EMPLOYEE]: SystemRole.DEPARTMENT_EMPLOYEE,
    [UserRole.HR_MANAGER]: SystemRole.HR_MANAGER,
    [UserRole.HR_ADMIN]: SystemRole.HR_ADMIN,
    [UserRole.DEPARTMENT_MANAGER]: SystemRole.DEPARTMENT_HEAD,
    [UserRole.PAYROLL_SPECIALIST]: SystemRole.PAYROLL_SPECIALIST,
    [UserRole.PAYROLL_MANAGER]: SystemRole.PAYROLL_MANAGER,
    [UserRole.FINANCE_STAFF]: SystemRole.FINANCE_STAFF,
    [UserRole.SYSTEM_ADMIN]: SystemRole.SYSTEM_ADMIN,
    [UserRole.LEGAL_ADMIN]: SystemRole.LEGAL_POLICY_ADMIN,
  };

  return roleMap[userRole] || SystemRole.DEPARTMENT_EMPLOYEE;
}

/**
 * Maps array of UserRoles to SystemRoles
 */
export function mapUserRolesToSystemRoles(userRoles: UserRole[]): SystemRole[] {
  return userRoles.map(mapUserRoleToSystemRole);
}

