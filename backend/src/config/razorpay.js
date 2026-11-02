import Razorpay from 'razorpay';
import env from './env.js';

export const razorpay = env.razorpayKeyId
  ? new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret || 'test_secret',
    })
  : null;

export default razorpay;
