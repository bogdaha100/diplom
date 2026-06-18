import { Router } from 'express';
import { getStats } from '../controllers/home.controller.js';
const router = Router();
router.get('/stats', getStats);
export default router;
