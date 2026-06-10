import { Request, Response } from 'express';
import Staff from '../models/Staff';

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

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting staff' });
  }
};
