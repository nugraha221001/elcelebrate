import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, cookies }) => {
  const { email, password, full_name } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email dan kata sandi wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await locals.supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: full_name || '' },
    },
  });

  if (error) {
    let localizedError = error.message;
    if (error.message.includes('already registered')) {
      localizedError = 'Email ini sudah terdaftar. Silakan masuk.';
    } else if (error.message.includes('at least 6 characters')) {
      localizedError = 'Kata sandi minimal harus 6 karakter.';
    } else if (error.message.includes('valid email')) {
      localizedError = 'Format alamat email tidak valid.';
    }
    return new Response(JSON.stringify({ error: localizedError }), {
      status: 400,
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
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return new Response(JSON.stringify({ user, session }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
