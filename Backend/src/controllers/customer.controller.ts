import { Request, Response } from 'express';
import Customer from '../models/Customer';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const customers = await Customer.find({ businessId }).sort({ lastVisit: -1 });
    res.json(customers);
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
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding customer' });
  }
};
