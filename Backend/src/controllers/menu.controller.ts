import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';

// Get all menu items for a business
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const items = await MenuItem.find({ businessId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching menu items' });
  }
};

// Add a new menu item
export const addMenuItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { name, description, price, category, image, isVeg, isAvailable, taxRate } = req.body;

    const newItem = new MenuItem({
      businessId,
      name,
      description,
      price,
      category,
      image,
      isVeg,
      isAvailable,
      taxRate
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding menu item' });
  }
};

// Update a menu item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;

    const updatedItem = await MenuItem.findOneAndUpdate(
      { _id: id, businessId },
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating menu item' });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;

    const deletedItem = await MenuItem.findOneAndDelete({ _id: id, businessId });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting menu item' });
  }
};
