import { createClient } from '@supabase/supabase-js';

/**
 * Browser-side Supabase client for client-side operations.
 * Uses the public anon key — all operations are subject to RLS.
 */
export const supabaseBrowser = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
