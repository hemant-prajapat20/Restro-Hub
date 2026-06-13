import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import Order from '../models/Order';
import SystemSettings from '../models/SystemSettings';
import Business from '../models/Business';
import User from '../models/User';

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
      business: { name: business.name, address: business.address, district: business.district, state: business.state },
      items
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error placing order' });
  }
};

export const getPastOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const populatedOrders = await Order.find({ 'customerDetails.phone': user.phone })
        .populate('businessId', 'name logoUrl')
        .sort({ createdAt: -1 });
        
    res.json({ status: 'success', data: populatedOrders });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id);
    res.json({ status: 'success', data: user?.savedAddresses || [] });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const saveAddress = async (req: Request, res: Response) => {
  try {
    const { label, street, city, state, zipCode, isDefault } = req.body;
    const user = await User.findById((req as any).user._id);
    
    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return;
    }
    
    if (!user.savedAddresses) {
        user.savedAddresses = [];
    }
    
    if (isDefault) {
        user.savedAddresses.forEach((addr: any) => addr.isDefault = false);
    }
    
    user.savedAddresses.push({ label, street, city, state, zipCode, isDefault });
    await user.save();
    
    res.json({ status: 'success', data: user.savedAddresses });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById((req as any).user._id);
    
    if (!user || !user.savedAddresses) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    
    user.savedAddresses = user.savedAddresses.filter((addr: any) => addr._id?.toString() !== addressId);
    await user.save();
    
    res.json({ status: 'success', data: user.savedAddresses });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
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
