import { Request, Response, NextFunction } from 'express';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

export type UserRole = 'user' | 'creator' | 'premium' | 'admin' | 'owner';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  creator: 2,
  premium: 3,
  admin: 4,
  owner: 5,
};

/**
 * Restrict access to users whose role is in the allowed list (exact match).
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Restrict access to users whose role meets or exceeds a minimum level
 * in the hierarchy: user < creator < premium < admin < owner.
 */
export const requireMinRole = (minRole: UserRole) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role as UserRole;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `This action requires at least "${minRole}" access`,
      });
    }

    next();
  };
};

/**
 * Shortcut middlewares for common role checks.
 */
export const requireAdmin = requireMinRole('admin');
export const requireOwner = requireRole('owner');
export const requirePremium = requireMinRole('premium');

/**
 * Ensures the authenticated user is either the resource owner (by userId param)
 * or has at least admin privileges.
 */
export const requireSelfOrAdmin = (paramName = 'id') => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const targetUserId = req.params[paramName];
    const userLevel = ROLE_HIERARCHY[req.user.role as UserRole] || 0;

    if (req.user.userId !== targetUserId && userLevel < ROLE_HIERARCHY.admin) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own resources',
      });
    }

    next();
  };
};
