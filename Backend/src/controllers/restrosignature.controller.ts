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
