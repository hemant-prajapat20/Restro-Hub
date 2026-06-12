import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { logMessage } from '../utils/messageLogger';
import Order from '../models/Order';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    
    // Fetch all completed orders as transactions
    const orders = await Order.find({ 
      businessId, 
      status: { $in: ['Completed', 'Served'] } 
    }).sort({ createdAt: -1 });

    const transactions = orders.map(order => ({
      _id: order._id,
      name: order.customerDetails?.name || 'Walk-in Customer',
      phone: order.customerDetails?.phone || 'N/A',
      type: order.type,
      total: order.total,
      date: order.createdAt
    }));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const customer = await Customer.findOne({ _id: id, businessId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching customer' });
  }
};

export const addCustomer = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { name, phone, email, totalVisits, lifetimeSpent, lastVisit } = req.body;

    const newCustomer = new Customer({
      businessId,
      name,
      phone,
      email,
      totalVisits: totalVisits || 0,
      lifetimeSpent: lifetimeSpent || 0,
      lastVisit: lastVisit ? new Date(lastVisit) : new Date()
    });

    const savedCustomer = await newCustomer.save();
    await logMessage(businessId, 'Customer Added', `Added new customer: ${savedCustomer.name}`, 'success');
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding customer' });
  }
};
