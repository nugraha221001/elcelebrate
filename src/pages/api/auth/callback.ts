import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url, cookies, redirect }) => {
  const code = url.searchParams.get('code');

  if (code) {
    const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      const isProd = import.meta.env.PROD;
      cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd ? true : false,
        maxAge: data.session.expires_in,
      });
      cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd ? true : false,
        maxAge: 60 * 60 * 24 * 7,
      });
      return redirect('/dashboard');
    }
  }

  return redirect('/login');
};
