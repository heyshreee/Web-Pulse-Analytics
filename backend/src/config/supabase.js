import { createClient } from '@supabase/supabase-js';
import env from './env.js';

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: { 'x-application-name': 'webpulse-backend' },
  },
});

export default supabase;
