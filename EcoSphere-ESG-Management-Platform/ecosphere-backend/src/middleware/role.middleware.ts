import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.map(r => r.toUpperCase()).includes(req.user.role.toUpperCase())) {
      throw new ApiError(403, 'Forbidden: Insufficient permissions');
    }
    next();
  };
};
