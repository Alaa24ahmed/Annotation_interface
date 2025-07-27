
const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment variables - NO FALLBACKS for security
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Check credentials before creating client
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
  process.exit(1);
}

console.log("Connecting to Supabase...");

// Create and export Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;