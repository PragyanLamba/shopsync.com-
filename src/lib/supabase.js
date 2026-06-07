import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
  !supabaseAnonKey.startsWith('your_')

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

if (!supabase) {
  console.warn(
    'Supabase credentials not fully configured. Running in Guest/Mock mode. ' +
    'Provide VITE_SUPABASE_ANON_KEY in your .env file to enable cloud database features.'
  );
}
