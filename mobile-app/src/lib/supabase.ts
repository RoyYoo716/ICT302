import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your mobile project
const SupabaseUrl = process.env.Database_URL!;
const SupabaseAnonKey = process.env.Database_Anon_Key!;

export const supabaseMobile = createClient(SupabaseUrl, SupabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
