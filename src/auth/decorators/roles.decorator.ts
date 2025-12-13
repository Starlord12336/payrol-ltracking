import { SetMetadata } from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator that accepts SystemRole
 */
export const Roles = (...roles: SystemRole[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
