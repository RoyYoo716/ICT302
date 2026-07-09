// supabase.js — Single shared Supabase client for Storage uploads.
// Uses the SECRET/service key — server-side only, never exposed to clients.

require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;
