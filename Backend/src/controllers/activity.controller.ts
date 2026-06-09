import { Request, Response } from 'express';
import ActivityLog from '../models/ActivityLog';

// @desc    Get all activity logs
// @route   GET /api/activity
// @access  Private/SuperAdmin
export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({
      status: 'success',
      data: logs
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Mark specific or all activities as read
// @route   PUT /api/activity/read
// @access  Private/SuperAdmin
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { logId } = req.body; // if logId provided, mark one. Else mark all.

    if (logId) {
      await ActivityLog.findByIdAndUpdate(logId, { isRead: true });
    } else {
      await ActivityLog.updateMany({ isRead: false }, { isRead: true });
    }

    res.json({
      status: 'success',
      message: 'Activities marked as read'
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
