// D:\backend\src\auth\roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    const user = request.user;

    console.log('Required roles:', requiredRoles);
    console.log('User in request:', user);

    if (!user || typeof user.role !== 'string') return false;
    return requiredRoles.includes(user.role);
  }
}
