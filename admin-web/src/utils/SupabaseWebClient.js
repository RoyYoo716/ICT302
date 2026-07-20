import { createClient } from '@supabase/supabase-js';

export const supabaseWeb = createClient(process.env.Database_URL, process.env.Database_Anon_Key, {
  auth: { 
    persistSession: true, 
    autoRefreshToken: true 
  }
});
