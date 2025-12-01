import { SetMetadata } from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { UserRole } from '../../shared/schemas/user.schema';
import { mapUserRolesToSystemRoles } from '../utils/role-mapper';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator that accepts both SystemRole and UserRole
 * Automatically converts UserRole to SystemRole
 */
export const Roles = (...roles: (SystemRole | UserRole)[]) => {
  // Convert UserRole to SystemRole if needed
  const systemRoles: SystemRole[] = roles.map((role) => {
    // Check if it's a UserRole (uppercase enum values)
    if (Object.values(UserRole).includes(role as UserRole)) {
      return mapUserRolesToSystemRoles([role as UserRole])[0];
    }
    return role as SystemRole;
  });
  
  return SetMetadata(ROLES_KEY, systemRoles);
};

