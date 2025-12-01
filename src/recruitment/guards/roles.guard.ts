import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RolesGuard
 * - Reads `@Roles()` metadata on handlers/classes and verifies the requesting user
 *   has at least one of the required roles.
 * - Expects `req.user` to exist (populated by auth middleware/guard) and to have
 *   either a `role` string or `roles` array.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
      || this.reflector.get<string[]>('roles', context.getClass())
      || [];

    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles required for this route
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles: string[] = Array.isArray(user.roles)
      ? user.roles
      : (user.role ? [user.role] : []);

    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Forbidden: insufficient role');
    }
    return true;
  }
}

export default RolesGuard;
