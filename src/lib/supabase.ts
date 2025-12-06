import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Don't throw error in test environment, just use dummy values if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Missing Supabase environment variables');
  } else {
    // In test environment, provide dummy values to allow tests to run
    console.warn('Supabase environment variables are missing, using dummy values for testing');
  }
}

// Use dummy values in test environment if real ones are not provided
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-anon-key-for-testing',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
