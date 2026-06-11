import { Request, Response } from 'express';
import SignatureItem from '../models/SignatureItem';
import PrivateDiningRoom from '../models/PrivateDiningRoom';

// --- Signatures ---
export const getSignatures = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const items = await SignatureItem.find({ businessId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching signatures' });
  }
};

export const addSignature = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const newItem = new SignatureItem({ ...req.body, businessId });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding signature' });
  }
};

// --- PDRs ---

export const addPdr = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const newRoom = new PrivateDiningRoom({ ...req.body, businessId });
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding PDR' });
  }
};

export const updatePdr = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const updatedRoom = await PrivateDiningRoom.findOneAndUpdate(
      { _id: id, businessId },
      req.body,
      { new: true }
    );
    if (!updatedRoom) return res.status(404).json({ message: 'PDR not found' });
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating PDR' });
  }
};

export const deletePdr = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const deletedRoom = await PrivateDiningRoom.findOneAndDelete({ _id: id, businessId });
    if (!deletedRoom) return res.status(404).json({ message: 'PDR not found' });
    res.json({ message: 'PDR deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting PDR' });
  }
};

export const getPdrs = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const rooms = await PrivateDiningRoom.find({ businessId }).sort({ name: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching PDRs' });
  }
};

export const updatePdrStatus = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const { status, activeBill } = req.body;

    const updateData: any = { status };
    if (activeBill !== undefined) {
      updateData.activeBill = activeBill;
    }

    const updatedRoom = await PrivateDiningRoom.findOneAndUpdate(
      { _id: id, businessId },
      updateData,
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'PDR not found' });
    }

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating PDR' });
  }
};

export const checkoutPdr = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    
    // We expect the checkout details in the body, but mainly we update PDR
    const { totalBill } = req.body;
    
    const room = await PrivateDiningRoom.findOne({ _id: id, businessId });
    if (!room) {
      return res.status(404).json({ message: 'PDR not found' });
    }

    room.activeBill += totalBill;
    room.status = 'Occupied';
    await room.save();

    res.json({ message: 'PDR billed successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Server error checking out PDR' });
  }
};

export const updateRestroItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const updatedItem = await SignatureItem.findOneAndUpdate(
      { _id: id, businessId },
      req.body,
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'restro item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating restro item' });
  }
};

export const deleteRestroItem = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;
    const deletedItem = await SignatureItem.findOneAndDelete({ _id: id, businessId });
    if (!deletedItem) {
      return res.status(404).json({ message: 'restro item not found' });
    }
    res.json({ message: 'restro item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting restro item' });
  }
};
