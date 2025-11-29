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
 * - Approving Payroll Policies
 * - Rejecting Payroll Policies
 * - Approving Signing Bonuses
 * - Rejecting Signing Bonuses
 * 
 * Note: Insurance Brackets require HR Manager approval (different guard)
 * 
 * @author John Wasfy
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
        if (user.role !== SystemRole.PAYROLL_MANAGER) {
            throw new ForbiddenException(
                'Access denied. Payroll Manager role required.',
            );
        }

        return true;
    }
}
