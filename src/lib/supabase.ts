import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid errors during build
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (typeof window === 'undefined') {
    return null; // Don't create client on server during build
  }

  if (!supabaseInstance && isSupabaseConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
};

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-project-url.supabase.co'
  );
};

// For backwards compatibility
export const supabase = {
  from: (table: string) => {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase not configured');
    }
    return client.from(table);
  },
};
