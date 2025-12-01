import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * HRManagerGuard
 * 
 * Protects endpoints that require HR Manager role.
 * Used EXCLUSIVELY for:
 * - Deleting Insurance Brackets (DRAFT only)
 * - Approving Insurance Brackets
 * - Rejecting Insurance Brackets
 * 
 * Note: This is the ONLY module where HR Manager has approval authority
 * (all other modules use Payroll Manager)
 * 
 * @author John Wasfy
 */
@Injectable()
export class HRManagerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        // Check if user has HR Manager role
        if (user.role !== SystemRole.HR_MANAGER) {
            throw new ForbiddenException(
                'Access denied. HR Manager role required.',
            );
        }

        return true;
    }
}
