import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import Order from '../models/Order';
import SystemSettings from '../models/SystemSettings';
import Business from '../models/Business';

export const getPublicMenu = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const items = await MenuItem.find({ businessId, isAvailable: true }).sort({ category: 1, name: 1 });
    res.json({
      business: { name: business.name },
      items
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching menu' });
  }
};

export const placeCustomerOrder = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { items, subtotal, tax, total, customerDetails } = req.body;

    // customer details might include name and phone.
    // If the user is logged in, we have req.user from the protect middleware
    const user = (req as any).user;
    
    // We can attach the user ID or just use their info
    const finalCustomerDetails = {
      name: user.firstName + ' ' + user.lastName,
      phone: user.phone,
      ...customerDetails
    };

    const newOrder = new Order({
      businessId,
      type: 'Delivery', // Since it's online, it defaults to delivery
      items,
      subtotal,
      tax,
      total,
      paymentMethod: 'Cash', // default to Cash on delivery for now
      source: 'Online',
      customerDetails: finalCustomerDetails,
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();

    // Emit socket event for KDS and Dashboard
    const settings = await SystemSettings.findOne();
    const io = req.app.get('io');
    if (io && settings?.kdsWebhook !== false) {
      io.emit('newOrder', savedOrder);
    }

    res.status(201).json({ status: 'success', data: savedOrder, message: 'Order placed successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error placing order' });
  }
};
