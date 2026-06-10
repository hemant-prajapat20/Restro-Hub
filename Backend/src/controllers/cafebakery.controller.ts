import { Request, Response } from 'express';
import CafeItem from '../models/CafeItem';

export const getCafeItems = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const items = await CafeItem.find({ businessId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching cafe items' });
  }
};

export const addCafeItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const newItem = new CafeItem({ ...req.body, businessId });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding cafe item' });
  }
};

export const updateCafeStock = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const { stockCount } = req.body;

    const updatedItem = await CafeItem.findOneAndUpdate(
      { _id: id, businessId },
      { stockCount },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Cafe item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating cafe stock' });
  }
};

export const checkoutCafe = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { cart } = req.body;
    
    // Update stock for each item in the cart
    for (const cartItem of cart) {
      await CafeItem.findOneAndUpdate(
        { _id: cartItem.item.id || cartItem.item._id, businessId },
        { $inc: { stockCount: -cartItem.quantity } }
      );
    }

    res.json({ message: 'Cafe checkout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error checking out cafe' });
  }
};
