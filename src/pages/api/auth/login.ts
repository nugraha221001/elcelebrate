import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, cookies }) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email dan kata sandi wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await locals.supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let localizedError = error.message;
    if (error.message.includes('Invalid login credentials')) {
      localizedError = 'Email atau kata sandi yang Anda masukkan salah.';
    } else if (error.message.includes('Email not confirmed')) {
      localizedError = 'Alamat email belum dikonfirmasi. Silakan periksa kotak masuk email Anda.';
    }
    return new Response(JSON.stringify({ error: localizedError }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { session, user } = data;

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
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return new Response(JSON.stringify({ user, session }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
