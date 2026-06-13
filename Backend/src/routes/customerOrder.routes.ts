import express from 'express';
import { getPublicMenu, placeCustomerOrder } from '../controllers/customerOrder.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public route to view menu
router.get('/menu/:businessId', getPublicMenu);

// Protected route to place order (customer must be logged in)
router.post('/order/:businessId', protect, placeCustomerOrder);

export default router;
