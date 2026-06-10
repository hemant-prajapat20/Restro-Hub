import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const items = await InventoryItem.find({ businessId }).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching inventory' });
  }
};

export const addInventoryItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { name, category, quantityInStock, unit, reorderThreshold, supplier } = req.body;

    const newItem = new InventoryItem({
      businessId,
      name,
      category,
      quantityInStock,
      unit,
      reorderThreshold,
      supplier,
      status: quantityInStock <= reorderThreshold ? 'Low Stock' : 'In Stock'
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding inventory item' });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    
    // Auto-update status if quantityInStock or reorderThreshold changes
    let updateData = { ...req.body };
    if (updateData.quantityInStock !== undefined || updateData.reorderThreshold !== undefined) {
      const currentItem = await InventoryItem.findOne({ _id: id, businessId });
      if (currentItem) {
        const qty = updateData.quantityInStock !== undefined ? updateData.quantityInStock : currentItem.quantityInStock;
        const threshold = updateData.reorderThreshold !== undefined ? updateData.reorderThreshold : currentItem.reorderThreshold;
        updateData.status = qty <= threshold ? 'Low Stock' : 'In Stock';
      }
    }

    const updatedItem = await InventoryItem.findOneAndUpdate(
      { _id: id, businessId },
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating inventory item' });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;

    const deletedItem = await InventoryItem.findOneAndDelete({ _id: id, businessId });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting inventory item' });
  }
};
