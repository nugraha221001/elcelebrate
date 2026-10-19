import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  const { email } = await request.json();

  if (!email) {
    return new Response(JSON.stringify({ error: 'Alamat email wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await locals.supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: new URL('/api/auth/callback', request.url).toString(),
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ message: 'Tautan masuk berhasil dikirim ke email Anda' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
