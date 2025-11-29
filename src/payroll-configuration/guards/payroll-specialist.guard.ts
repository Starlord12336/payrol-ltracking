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
 * - Creating configurations (DRAFT)
 * - Updating configurations (DRAFT only)
 * - Deleting configurations (DRAFT only, except Insurance Brackets)
 * - Submitting configurations for approval
 * 
 * @author John Wasfy
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
        if (user.role !== SystemRole.PAYROLL_SPECIALIST) {
            throw new ForbiddenException(
                'Access denied. Payroll Specialist role required.',
            );
        }

        return true;
    }
}
