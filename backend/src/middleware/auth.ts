import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const prisma = (await import('../utils/prisma')).default;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to access property management resources.',
        });
      }

      next();
    } catch (error) {
      console.error('requireRole error:', error);
      res.status(500).json({ success: false, message: 'Internal server error in role authorization' });
    }
  };
};
