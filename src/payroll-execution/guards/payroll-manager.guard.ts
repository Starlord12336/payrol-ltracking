import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * PayrollManagerGuard
 *
 * Protects endpoints that require Payroll Manager role.
 * Used for:
 * - Phase 3: Manager approval/rejection (REQ-PY-20, REQ-PY-22)
 * - Phase 3: Lock/unlock payroll (REQ-PY-7, REQ-PY-19)
 */
@Injectable()
export class PayrollManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has Payroll Manager role
    const userRoles = user.roles || [];
    if (!userRoles.includes(SystemRole.PAYROLL_MANAGER)) {
      throw new ForbiddenException(
        'Access denied. Payroll Manager role required.',
      );
    }

    return true;
  }
}
