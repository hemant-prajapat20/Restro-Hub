import { Request, Response } from 'express';
import PricingConfig from '../models/PricingConfig';

// @desc    Get the global pricing configuration
// @route   GET /api/subscriptions
// @access  Private/SuperAdmin
export const getPricingConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    let config = await PricingConfig.findOne();
    
    // If not exists, create the default one
    if (!config) {
      config = await PricingConfig.create({});
    }

    res.json({
      status: 'success',
      data: config
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update the global pricing configuration
// @route   PUT /api/subscriptions
// @access  Private/SuperAdmin
export const updatePricingConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { onePlatform, twoPlatforms, threePlatforms } = req.body;

    let config = await PricingConfig.findOne();
    if (!config) {
      config = new PricingConfig();
    }

    if (onePlatform) config.onePlatform = onePlatform;
    if (twoPlatforms) config.twoPlatforms = twoPlatforms;
    if (threePlatforms) config.threePlatforms = threePlatforms;

    const updatedConfig = await config.save();

    res.json({
      status: 'success',
      data: updatedConfig
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
