import { Request, Response } from 'express';
import LiquorItem from '../models/LiquorItem';
import BarVipSuite from '../models/BarVipSuite';

export const getLiquorItems = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const items = await LiquorItem.find({ businessId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching liquor items' });
  }
};

export const addLiquorItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const newItem = new LiquorItem({ ...req.body, businessId });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding liquor item' });
  }
};

export const updateLiquorStock = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const { stockBottles } = req.body;

    const updatedItem = await LiquorItem.findOneAndUpdate(
      { _id: id, businessId },
      { stockBottles },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Liquor item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating liquor stock' });
  }
};

export const checkoutBarLounge = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { cart } = req.body;
    
    // Update stock for each item in the cart
    for (const cartItem of cart) {
      const reduction = cartItem.pourSize === 'Full Bottle' ? cartItem.quantity : Math.ceil(cartItem.quantity / 5);
      
      await LiquorItem.findOneAndUpdate(
        { _id: cartItem.item.id || cartItem.item._id, businessId },
        { $inc: { stockBottles: -reduction } }
      );
    }

    res.json({ message: 'Bar checkout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error checking out bar' });
  }
};

export const updateLiquorItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const updatedItem = await LiquorItem.findOneAndUpdate(
      { _id: id, businessId },
      req.body,
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'bar item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating bar item' });
  }
};

export const deleteLiquorItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const deletedItem = await LiquorItem.findOneAndDelete({ _id: id, businessId });
    if (!deletedItem) {
      return res.status(404).json({ message: 'bar item not found' });
    }
    res.json({ message: 'bar item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting bar item' });
  }
};


// --- VIP Suites ---

export const getVipSuites = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const suites = await BarVipSuite.find({ businessId }).sort({ name: 1 });
    res.json(suites);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching VIP suites' });
  }
};

export const addVipSuite = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const newSuite = new BarVipSuite({ ...req.body, businessId });
    const savedSuite = await newSuite.save();
    res.status(201).json(savedSuite);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding VIP suite' });
  }
};

export const updateVipSuite = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const updatedSuite = await BarVipSuite.findOneAndUpdate(
      { _id: id, businessId },
      req.body,
      { new: true }
    );
    if (!updatedSuite) return res.status(404).json({ message: 'Suite not found' });
    res.json(updatedSuite);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating VIP suite' });
  }
};

export const deleteVipSuite = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const deletedSuite = await BarVipSuite.findOneAndDelete({ _id: id, businessId });
    if (!deletedSuite) return res.status(404).json({ message: 'Suite not found' });
    res.json({ message: 'Suite deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting VIP suite' });
  }
};

export const checkoutVipSuite = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const { totalBill } = req.body;
    
    const suite = await BarVipSuite.findOne({ _id: id, businessId });
    if (!suite) {
      return res.status(404).json({ message: 'Suite not found' });
    }

    suite.activeBill += totalBill;
    suite.status = 'Occupied';
    await suite.save();

    res.json({ message: 'Suite billed successfully', suite });
  } catch (error) {
    res.status(500).json({ message: 'Server error checking out VIP suite' });
  }
};
