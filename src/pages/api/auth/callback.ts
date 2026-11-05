import type { APIRoute } from 'astro';
import type { EmailOtpType } from '@supabase/supabase-js';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const nextParam = url.searchParams.get('next');

  // Prevent open redirect: target path must start with a single '/'
  const safeNext =
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : (type === 'recovery' ? '/reset-password' : '/dashboard');

  let session = null;

  if (code) {
    const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      session = data.session;
    }
  } else if (token_hash && type) {
    const { data, error } = await locals.supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error && data?.session) {
      session = data.session;
    }
  }

  if (session) {
    const isProd = import.meta.env.PROD;
    cookies.set('sb-access-token', session.access_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd ? true : false,
      maxAge: session.expires_in,
    });
    cookies.set('sb-refresh-token', session.refresh_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd ? true : false,
      maxAge: 60 * 60 * 24 * 7,
    });
    return redirect(safeNext);
  }

  return redirect('/signin');
};
