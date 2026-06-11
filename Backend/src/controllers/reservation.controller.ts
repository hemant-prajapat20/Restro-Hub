import { Request, Response } from 'express';
import Reservation from '../models/Reservation';

export const getReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: reservations });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

import Table from '../models/Table';
import SystemSettings from '../models/SystemSettings';

export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, guests, time, floor, seats, tableNumber, tableId } = req.body;
    
    let finalTableId = tableId;
    let finalTableNumber = tableNumber;

    const settings = await SystemSettings.findOne();
    if (settings?.smartMapping && !finalTableId && !finalTableNumber) {
      const optimalTable = await Table.findOne({
        floor: floor,
        status: 'Available',
        capacity: { $gte: guests || seats || 1 }
      }).sort({ capacity: 1 });

      if (optimalTable) {
        finalTableId = optimalTable._id;
        finalTableNumber = optimalTable.number;
      }
    }

    const newReservation = await Reservation.create({
      name,
      phone,
      guests,
      time,
      floor,
      seats,
      tableNumber: finalTableNumber,
      status: 'Awaiting'
    });
    
    // Auto-lock the table to prevent double booking
    if (finalTableId) {
      await Table.findByIdAndUpdate(finalTableId, { status: 'Reserved' });
    } else if (finalTableNumber) {
      await Table.findOneAndUpdate(
        { number: finalTableNumber, floor: floor }, 
        { status: 'Reserved' }
      );
    }

    // Broadcast via socket.io if needed
    const io = req.app.get('io');
    if (io) {
      io.emit('newReservation', newReservation);
    }

    res.status(201).json({ status: 'success', data: newReservation });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateReservationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (reservation && status === 'Confirmed' && reservation.tableNumber) {
      await Table.findOneAndUpdate(
        { number: reservation.tableNumber, floor: reservation.floor },
        { status: 'Occupied' }
      );
    }

    if (!reservation) {
      res.status(404).json({ status: 'error', message: 'Reservation not found' });
      return;
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('reservationUpdated', reservation);
    }

    res.status(200).json({ status: 'success', data: reservation });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
