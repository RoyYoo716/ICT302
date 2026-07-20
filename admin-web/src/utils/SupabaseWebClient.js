import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.Database_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.Database_Anon_Key;

export const supabaseWeb = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    persistSession: true, 
    autoRefreshToken: true 
  }
});
