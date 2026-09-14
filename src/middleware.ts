import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase';

/**
 * Global middleware: attaches Supabase client and user to every request.
 * Runs on all SSR routes; prerendered pages skip middleware.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.cookies, context.request);

  // 1. Verify user server-side via Supabase SSR client
  let user: import('@supabase/supabase-js').User | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    } else if (error && (error.message?.includes('Refresh Token') || (error as any).code === 'refresh_token_not_found')) {
      context.cookies.delete('sb-access-token', { path: '/' });
      context.cookies.delete('sb-refresh-token', { path: '/' });
    }
  } catch {
    user = null;
  }

  // 2. Fallback: check explicit sb-access-token / sb-refresh-token cookies
  const accessToken = context.cookies.get('sb-access-token')?.value;
  const refreshToken = context.cookies.get('sb-refresh-token')?.value;

  if (!user && accessToken) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
      if (!userError && userData?.user) {
        user = userData.user;
        if (refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      } else if (refreshToken) {
        // Access token might be expired; attempt session refresh
        const { data: sessionData, error: refreshError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!refreshError && sessionData?.user) {
          user = sessionData.user;
          if (sessionData.session) {
            const isProd = import.meta.env.PROD;
            context.cookies.set('sb-access-token', sessionData.session.access_token, {
              path: '/',
              httpOnly: true,
              sameSite: 'lax',
              secure: isProd ? true : false,
              maxAge: sessionData.session.expires_in,
            });
            context.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
              path: '/',
              httpOnly: true,
              sameSite: 'lax',
              secure: isProd ? true : false,
              maxAge: 60 * 60 * 24 * 7,
            });
          }
        } else if (refreshError) {
          context.cookies.delete('sb-access-token', { path: '/' });
          context.cookies.delete('sb-refresh-token', { path: '/' });
        }
      }
    } catch {
      // Fallback failed; user remains null
    }
  }

  let profile: import('./lib/types').Profile | null = null;
  if (user) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = profileData;
    } catch {
      profile = null;
    }
  }

  // Attach to locals for downstream access in pages/API routes
  context.locals.supabase = supabase;
  context.locals.user = user;
  context.locals.profile = profile;

  return next();
});
