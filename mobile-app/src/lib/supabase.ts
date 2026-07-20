import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.Database_URL!;
const SupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.Database_Anon_Key!;

export const supabaseMobile = createClient(SupabaseUrl, SupabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
