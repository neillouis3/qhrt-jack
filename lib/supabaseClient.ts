import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Client-side Supabase client (used in browser / client components)
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Server-side Supabase client (used in API routes / server components)
// Guarded so it doesn't throw when the module is evaluated in the browser
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
export const supabaseServer = supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : (null as any);
