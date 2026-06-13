import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import Order from '../models/Order';
import SystemSettings from '../models/SystemSettings';
import Business from '../models/Business';
import User from '../models/User';
import CustomerNotification from '../models/CustomerNotification';

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
        .populate('businessId', 'name logoUrl address contactPhone')
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

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const { label, street, city, state, zipCode, isDefault } = req.body;
    const user = await User.findById((req as any).user._id);
    
    if (!user || !user.savedAddresses) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    
    if (isDefault) {
        user.savedAddresses.forEach((addr: any) => addr.isDefault = false);
    }
    
    const addressIndex = user.savedAddresses.findIndex((addr: any) => addr._id?.toString() === addressId);
    if (addressIndex !== -1) {
       user.savedAddresses[addressIndex] = { ...user.savedAddresses[addressIndex], label, street, city, state, zipCode, isDefault } as any;
    }
    
    await user.save();
    
    res.json({ status: 'success', data: user.savedAddresses });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const notifications = await CustomerNotification.find({ customerId: user._id }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: notifications });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    await CustomerNotification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ status: 'success' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await CustomerNotification.updateMany(
      { customerId: user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ status: 'success' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const placeCustomerOrder = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { items, subtotal, tax, total, customerDetails, paymentMethod } = req.body;

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
      customerId: user._id,
      items,
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethod || 'Cash',
      source: 'Online',
      customerDetails: finalCustomerDetails,
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();

    // Create a Message for the Business Admin
    const Message = require('../models/Message').default;
    const newNotif = new Message({
      businessId,
      action: 'New Online Order',
      message: `New online order received from ${finalCustomerDetails.name} for ₹${total}.`,
      type: 'success'
    });
    const savedNotif = await newNotif.save();

    // Emit socket event for KDS and Dashboard
    const settings = await SystemSettings.findOne();
    const io = req.app.get('io');
    if (io) {
      if (settings?.kdsWebhook !== false) {
        io.emit('newOrder', savedOrder);
      }
      io.emit('newMessage', savedNotif);
    }

    // Create a Notification for the Customer
    const notif = await CustomerNotification.create({
      customerId: user._id,
      title: 'Order Placed Successfully',
      message: `Your order for ₹${Math.round(total)} has been received and is being prepared.`,
      type: 'order'
    });

    if (io) {
       io.emit('newCustomerNotification', notif);
    }

    res.status(201).json({ status: 'success', data: savedOrder, message: 'Order placed successfully!' });
  } catch (error: any) {
    console.error("Order placement error:", error);
    res.status(500).json({ status: 'error', message: error.message || 'Server error placing order' });
  }
};

export const logPaymentFailed = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { reason, amount } = req.body;
    
    const notif = await CustomerNotification.create({
      customerId: user._id,
      title: 'Payment Failed',
      message: `Your payment of ₹${amount} failed. Reason: ${reason || 'Unknown'}`,
      type: 'system'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('newCustomerNotification', notif);
    }

    res.json({ status: 'success' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
