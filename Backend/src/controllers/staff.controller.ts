import { Request, Response } from 'express';
import Staff from '../models/Staff';
import Business from '../models/Business';
import { logMessage } from '../utils/messageLogger';

export const getStaff = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const staffMembers = await Staff.find({ businessId }).sort({ name: 1 });
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching staff' });
  }
};

export const addStaff = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { name, role, department, phone, email, shift, status } = req.body;

    const newStaff = new Staff({
      businessId,
      name,
      role,
      department,
      phone,
      email,
      shift,
      status: status || 'Active',
      joinDate: new Date()
    });

    const savedStaff = await newStaff.save();
    await logMessage(businessId, 'Staff Member Added', `Added new staff member: ${savedStaff.name}`, 'success');
    res.status(201).json(savedStaff);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding staff' });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;

    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: id, businessId },
      req.body,
      { new: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await logMessage(businessId, 'Staff Member Updated', `Updated staff member: ${updatedStaff.name}`, 'info');
    res.json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating staff' });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;

    const deletedStaff = await Staff.findOneAndDelete({ _id: id, businessId });

    if (!deletedStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await logMessage(businessId, 'Staff Member Removed', `Removed staff member: ${deletedStaff.name}`, 'warning');
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting staff' });
  }
};

export const getStaffCategories = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const business = await Business.findById(businessId);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // Default categories if none exist
    const categories = business.staffCategories && business.staffCategories.length > 0 
      ? business.staffCategories 
      : ['Waiter', 'Kitchen', 'Manager', 'Cashier', 'Delivery'];
      
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching staff categories' });
  }
};

export const updateStaffCategories = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { categories } = req.body;
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Categories must be an array of strings' });
    }
    
    const business = await Business.findByIdAndUpdate(
      businessId,
      { staffCategories: categories },
      { new: true }
    );
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.json(business.staffCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating staff categories' });
  }
};
