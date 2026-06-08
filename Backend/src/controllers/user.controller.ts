import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get all users (SuperAdmin directory)
// @route   GET /api/users
// @access  Private/SuperAdmin
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: users
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
