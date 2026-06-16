import { Request, Response } from 'express';
import Order from '../models/Order';
import SystemSettings from '../models/SystemSettings';
import CustomerNotification from '../models/CustomerNotification';
import { logMessage } from '../utils/messageLogger';

// Get all orders for a business
export const getOrders = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    // Optional query parameters for filtering
    const { status, type } = req.query;
    
    let query: any = { businessId };
    if (status) query.status = status;
    if (type) query.type = type;

    const orders = await Order.find(query).populate('tableId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { type, tableId, items, subtotal, tax, total, paymentMethod, source, customerDetails } = req.body;

    const newOrder = new Order({
      businessId,
      type,
      tableId,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      source,
      customerDetails,
      status: type === 'POS' ? 'Completed' : 'Pending' // POS is usually completed immediately, but KDS might need it as pending. Let's default to Pending if not specified, or let frontend decide.
    });
    
    // For POS, we'll accept the status passed from frontend if any
    if (req.body.status) {
        newOrder.status = req.body.status;
    }

    const savedOrder = await newOrder.save();
    const populatedOrder = await Order.findById(savedOrder._id).populate('tableId');

    // Emit socket event for KDS if webhook is enabled
    const settings = await SystemSettings.findOne();
    const io = req.app.get('io');
    if (io && settings?.kdsWebhook !== false) {
      io.emit('newOrder', populatedOrder);
    }

    // Insert Message for the Message Center
    await logMessage(businessId, 'payment', 'New Transaction', `Transaction ${savedOrder._id.toString().substring(0, 8).toUpperCase()} for ₹${total} completed successfully via ${type}.`, 'success');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, businessId },
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit socket event for KDS
    const io = req.app.get('io');
    if (io) {
      io.emit('orderUpdated', updatedOrder);
    }

    if (status === 'Completed' || status === 'Served') {
        await logMessage(businessId, 'order', 'Order Completed', `Order ${updatedOrder._id.toString().substring(0, 8).toUpperCase()} status changed to ${status}.`, 'success');
    }

    if (updatedOrder.customerId) {
      let title = 'Order Update';
      let message = `Your order status has been updated to ${status}.`;
      let type = 'order';

      if (status === 'Cancelled') {
        title = 'Order Cancelled';
        message = 'Your order has been cancelled by the restaurant.';
      } else if (status === 'Completed' || status === 'Served') {
        title = 'Order Completed';
        message = 'Your order is completed. Enjoy your meal!';
      } else if (status === 'Out for Delivery') {
        title = 'Order Dispatched';
        message = 'Your order is out for delivery and will reach you soon!';
      }

      const notif = await CustomerNotification.create({
        customerId: updatedOrder.customerId,
        title,
        message,
        type
      });

      if (io) {
        io.emit('newCustomerNotification', notif);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating order' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    
    // We can update items, subtotal, tax, total, etc.
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, businessId },
      req.body,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit socket event for KDS
    const io = req.app.get('io');
    if (io) {
      io.emit('orderUpdated', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating order details' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const { otp } = req.body;

    const order = await Order.findOne({ _id: id, businessId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Completed') {
      return res.status(400).json({ message: 'Order is already completed. OTP has expired.' });
    }

    if (order.deliveryOtp && order.deliveryOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    order.status = 'Completed';
    order.deliveryOtp = ''; // Clear OTP so it can never be used again
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdated', { orderId: order._id, status: 'Completed' });
      
      const CustomerNotification = require('../models/CustomerNotification').default;
      const notif = await CustomerNotification.create({
        customerId: order.customerId,
        title: 'Order Delivered Successfully',
        message: `Your order #${order._id.toString().substring(order._id.toString().length - 8).toUpperCase()} has been delivered successfully. Enjoy your food!`,
        type: 'order'
      });
      io.emit('newCustomerNotification', notif);

      const Message = require('../models/Message').default;
      const businessNotif = new Message({
        businessId: order.businessId,
        action: 'Order Completed',
        message: `Order #${order._id.toString().substring(order._id.toString().length - 8).toUpperCase()} was delivered successfully via OTP.`,
        type: 'success'
      });
      await businessNotif.save();
      io.emit('newMessage', businessNotif);
    }

    res.json({ message: 'OTP Verified & Order Completed', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;

    const deletedOrder = await Order.findOneAndDelete({ _id: id, businessId });
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting order' });
  }
};
