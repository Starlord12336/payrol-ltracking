import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * Maps string role names to SystemRole enum (for backward compatibility)
 */
export function mapUserRoleToSystemRole(role: string | SystemRole): SystemRole {
  // If already a SystemRole, return as is
  if (Object.values(SystemRole).includes(role as SystemRole)) {
    return role as SystemRole;
  }

  // Map common role strings to SystemRole
  const roleMap: Record<string, SystemRole> = {
    EMPLOYEE: SystemRole.DEPARTMENT_EMPLOYEE,
    HR_MANAGER: SystemRole.HR_MANAGER,
    HR_ADMIN: SystemRole.HR_ADMIN,
    DEPARTMENT_MANAGER: SystemRole.DEPARTMENT_HEAD,
    PAYROLL_SPECIALIST: SystemRole.PAYROLL_SPECIALIST,
    PAYROLL_MANAGER: SystemRole.PAYROLL_MANAGER,
    FINANCE_STAFF: SystemRole.FINANCE_STAFF,
    SYSTEM_ADMIN: SystemRole.SYSTEM_ADMIN,
    LEGAL_ADMIN: SystemRole.LEGAL_POLICY_ADMIN,
  };

  return roleMap[role] || SystemRole.DEPARTMENT_EMPLOYEE;
}

/**
 * Maps array of roles to SystemRoles
 */
export function mapUserRolesToSystemRoles(
  roles: (string | SystemRole)[],
): SystemRole[] {
  return roles.map(mapUserRoleToSystemRole);
}
