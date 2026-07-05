import { Router } from 'express';
import * as contractorController from '../controllers/contractorController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, contractorController.list);

export default router;
