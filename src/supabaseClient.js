import { createClient } from '@supabase/supabase-js';

// Retrieve Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid URL exists before initializing to prevent white-screen crashes
const isValidUrl = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

if (!isValidUrl) {
  console.error(
    '❌ Supabase Error: VITE_SUPABASE_URL is missing or invalid. Check your Vercel Environment Variables.'
  );
}

// Fallback to placeholder to prevent instant client instantiation crash
export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
