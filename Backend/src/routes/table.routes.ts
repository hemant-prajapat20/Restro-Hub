import { Role } from '../models/User';
import { Router } from 'express';
import { getTables, addTable, updateTable, deleteTable, mergeTables } from '../controllers/table.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/')
  .get(getTables)
  .post(addTable);

router.post('/merge', mergeTables);

router.route('/:id')
  .put(updateTable)
  .delete(deleteTable);

export default router;
