import express from 'express';
const router = express.Router();
import planController from '../controllers/plan.controller.js';

// Public route to get all plans
router.get('/', planController.getPlans);

export default router;
