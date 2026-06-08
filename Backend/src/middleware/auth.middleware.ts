import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, Role } from '../models/User';

interface JwtPayload {
  id: string;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

      const user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!user) {
        res.status(401).json({ status: 'error', message: 'User not found' });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ status: 'error', message: 'User account is deactivated' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      res.status(403).json({ 
        status: 'error', 
        message: `User role '${req.user?.role}' is not authorized to access this route` 
      });
      return;
    }
    next();
  };
};
