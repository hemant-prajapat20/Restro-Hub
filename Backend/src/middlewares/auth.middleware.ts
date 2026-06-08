import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { Role } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    // Find user and exclude password
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ status: 'error', message: 'Account is deactivated' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        status: 'error', 
        message: 'User role not authorized to access this route' 
      });
      return;
    }
    next();
  };
};
