/**
 * Centralized, typed access to environment variables.
 * Fails fast (with a clear message) only for variables that are
 * required for the server to boot.
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const read = (key, required = false) => {
  const value = process.env[key];
  if (required && (value === undefined || value === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const splitOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 5000),
  frontendUrl: read('FRONTEND_URL') || 'http://localhost:5173',
  // Trusted browser origins for credentialed API and Socket.IO requests.
  // FRONTEND_URLS is the preferred comma-separated list; the single-URL
  // variables remain supported for existing deployments.
  frontendUrls: [
    ...splitOrigins(process.env.FRONTEND_URLS),
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.V1_FRONTEND_URL),
    ...splitOrigins(process.env.V2_FRONTEND_URL),
    ...splitOrigins(process.env.MARKETING_FRONTEND_URL),
  ],
  jwtSecret: read('JWT_SECRET', true),
  supabaseUrl: read('SUPABASE_URL', true),
  supabaseServiceKey: read('SUPABASE_SERVICE_KEY', true),
  razorpayKeyId: read('RAZORPAY_KEY_ID'),
  razorpayKeySecret: read('RAZORPAY_KEY_SECRET'),
  resendApiKey: read('RESEND_API_KEY'),
  resendFromEmail: read('RESEND_FROM_EMAIL'),
  supportEmail: read('SUPPORT_EMAIL'),
  privacyEmail: read('PRIVACY_EMAIL'),
  googleClientId: read('GOOGLE_CLIENT_ID'),
  googleClientSecret: read('GOOGLE_CLIENT_SECRET'),
  cloudinaryCloudName: read('CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: read('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: read('CLOUDINARY_API_SECRET'),
  telegramBotToken: read('TELEGRAM_BOT_TOKEN'),
};

export default env;
