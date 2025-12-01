import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * FinanceStaffGuard
 *
 * Protects endpoints that require Finance Staff role.
 * Used for:
 * - Phase 3: Finance approval/rejection (REQ-PY-15)
 */
@Injectable()
export class FinanceStaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has Finance Staff role
    const userRoles = user.roles || [];
    if (!userRoles.includes(SystemRole.FINANCE_STAFF)) {
      throw new ForbiddenException(
        'Access denied. Finance Staff role required.',
      );
    }

    return true;
  }
}