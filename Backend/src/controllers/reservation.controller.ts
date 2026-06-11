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

export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, guests, time, floor, seats, tableNumber } = req.body;
    const newReservation = await Reservation.create({
      name,
      phone,
      guests,
      time,
      floor,
      seats,
      tableNumber,
      status: 'Awaiting'
    });
    
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
