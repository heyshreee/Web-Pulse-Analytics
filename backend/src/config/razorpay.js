import Razorpay from 'razorpay';
import env from './env.js';

const keyId = env.razorpayKeyId?.trim();
const keySecret = env.razorpayKeySecret?.trim();

export const razorpay =
  keyId && keySecret
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    : null;

export default razorpay;
