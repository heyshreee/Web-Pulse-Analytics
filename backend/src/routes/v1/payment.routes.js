import express from 'express';
const router = express.Router();
import paymentController from '../../controllers/payment.controller.js';
import authenticate from '../../middleware/auth.js';

router.get('/plans', paymentController.getPlans);
router.post('/order', authenticate, paymentController.createOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/receipt/:id', authenticate, paymentController.getReceipt);
router.post('/downgrade', authenticate, paymentController.downgradePlan);
router.post('/receipt/:id/email', authenticate, paymentController.emailReceipt);

export default router;
