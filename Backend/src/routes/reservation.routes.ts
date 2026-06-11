import express from 'express';
import { getReservations, createReservation, updateReservationStatus } from '../controllers/reservation.controller';

const router = express.Router();

router.get('/', getReservations);
router.post('/', createReservation);
router.patch('/:id/status', updateReservationStatus);

export default router;
