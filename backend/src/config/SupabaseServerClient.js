const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.Database_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.Database_Anon_Key;

const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    persistSession: false, 
    autoRefreshToken: false 
  }
});

module.exports = { supabaseServer };
