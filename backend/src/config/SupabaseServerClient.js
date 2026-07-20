import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(process.env.Database_URL, process.env.Database_Anon_Key, {
  auth: { 
    persistSession: false, 
    autoRefreshToken: false 
  }
});
