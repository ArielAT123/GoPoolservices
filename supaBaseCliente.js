import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY, SUPABASEADMIN_KEY } from "./constants.js";


// Versión simplificada sin TypeScript
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASEADMIN_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;