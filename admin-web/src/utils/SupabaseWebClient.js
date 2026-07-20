import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_Database_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_Database_Anon_Key;

export const supabaseWeb = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { 
    persistSession: true, 
    autoRefreshToken: true 
  }
});
