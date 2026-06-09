import { Request, Response } from 'express';
import SystemSettings from '../models/SystemSettings';
import ActivityLog from '../models/ActivityLog';

// @desc    Get global system settings
// @route   GET /api/settings
// @access  Private/SuperAdmin
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    res.json({
      status: 'success',
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update global system settings
// @route   PUT /api/settings
// @access  Private/SuperAdmin
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { platformName, maintenanceMode, jwtExpirationTime } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (platformName !== undefined) settings.platformName = platformName;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (jwtExpirationTime !== undefined) settings.jwtExpirationTime = jwtExpirationTime;

    const updatedSettings = await settings.save();

    // Log Activity
    await ActivityLog.create({
      action: 'SETTINGS_UPDATED',
      message: 'System configuration was updated',
      type: 'info'
    });

    res.json({
      status: 'success',
      data: updatedSettings
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
