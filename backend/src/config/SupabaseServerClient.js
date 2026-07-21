const { createClient } = require('@supabase/supabase-js');

// Match your Render environment variables exactly
const supabaseUrl = process.env.SUPABASE_URL; 
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Supabase Environment variables are missing!");
}

const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    persistSession: false, // Correct: Keeps the backend stateless
    autoRefreshToken: false 
  }
});

module.exports = { supabaseServer };

