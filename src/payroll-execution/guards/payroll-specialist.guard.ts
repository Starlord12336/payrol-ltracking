import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * PayrollSpecialistGuard
 *
 * Protects endpoints that require Payroll Specialist role.
 * Used for:
 * - Phase 2: Reviewing payroll runs (REQ-PY-6)
 * - Phase 2: Publishing payroll for approval (REQ-PY-12)
 */
@Injectable()
export class PayrollSpecialistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has Payroll Specialist role
    const userRoles = user.roles || [];
    if (!userRoles.includes(SystemRole.PAYROLL_SPECIALIST)) {
      throw new ForbiddenException(
        'Access denied. Payroll Specialist role required.',
      );
    }

    return true;
  }
}
