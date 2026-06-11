import { Request, Response } from 'express';
import Order from '../models/Order';

// Get all orders for a business
export const getOrders = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    // Optional query parameters for filtering
    const { status, type } = req.query;
    
    let query: any = { businessId };
    if (status) query.status = status;
    if (type) query.type = type;

    const orders = await Order.find(query).sort({ createdAt: -1 });
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

    // Emit socket event for KDS
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', savedOrder);
    }

    res.status(201).json(savedOrder);
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
