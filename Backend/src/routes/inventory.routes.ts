import { Role } from '../models/User';
import { Router } from 'express';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, getInventoryLogs } from '../controllers/inventory.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/')
  .get(getInventory)
  .post(addInventoryItem);

router.route('/:id')
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);


router.get('/logs', getInventoryLogs);

export default router;
