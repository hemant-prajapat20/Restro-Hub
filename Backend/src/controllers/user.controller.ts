import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get all users (SuperAdmin directory)
// @route   GET /api/users
// @access  Private/SuperAdmin
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({
      role: { $in: ['SUPER_ADMIN', 'BUSINESS_ADMIN'] }
    })
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

// @desc    Toggle user active status
// @route   PUT /api/users/:id/status
// @access  Private/SuperAdmin
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      status: 'success',
      message: `User login access ${user.isActive ? 'enabled' : 'disabled'}`,
      data: { isActive: user.isActive }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
