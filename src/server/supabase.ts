import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey);

export const supabase = createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseServiceKey || 'missing-service-role-key'
);
