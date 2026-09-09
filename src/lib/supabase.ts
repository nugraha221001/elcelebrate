import { createServerClient, parseCookieHeader, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

/**
 * Creates a server-side Supabase client that manages auth via HTTP-only cookies.
 * Use this in API routes, middleware, and .astro page frontmatter.
 */
export function createSupabaseServerClient(cookies: AstroCookies, request?: Request) {
  const cookieHeader = request?.headers.get('cookie') ?? '';

  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const parsed = parseCookieHeader(cookieHeader);
          const cookieMap = new Map<string, string>();
          for (const c of parsed) {
            if (c.name && c.value !== undefined && c.value !== null) {
              cookieMap.set(c.name, c.value);
            }
          }
          // Also include tokens from AstroCookies if present
          const sbAccess = cookies.get('sb-access-token')?.value;
          if (sbAccess && !cookieMap.has('sb-access-token')) {
            cookieMap.set('sb-access-token', sbAccess);
          }
          const sbRefresh = cookies.get('sb-refresh-token')?.value;
          if (sbRefresh && !cookieMap.has('sb-refresh-token')) {
            cookieMap.set('sb-refresh-token', sbRefresh);
          }
          return Array.from(cookieMap.entries()).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          const isProd = import.meta.env.PROD;
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              path: '/',
              httpOnly: true,
              sameSite: 'lax',
              secure: isProd ? true : false,
              ...(options as any),
              ...(isProd ? {} : { secure: false }),
            });
          });
        },
      },
    }
  );
}

/**
 * Creates a Supabase admin client using the service role key.
 * Only use server-side for administrative operations.
 */
export function createSupabaseAdminClient() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
