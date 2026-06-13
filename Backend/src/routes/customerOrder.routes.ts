import express from 'express';
import { getPublicMenu, placeCustomerOrder, getPastOrders, getAddresses, saveAddress, deleteAddress, updateAddress } from '../controllers/customerOrder.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public route to view menu
router.get('/menu/:businessId', getPublicMenu);

// Protected routes
router.use(protect);

router.post('/order/:businessId', placeCustomerOrder);

// Customer Profile features
router.get('/my-orders', getPastOrders);
router.get('/addresses', getAddresses);
router.post('/addresses', saveAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;
