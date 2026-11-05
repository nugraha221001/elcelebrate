import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return new Response(JSON.stringify({ error: 'Alamat email wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const origin = new URL(request.url).origin;

    const { error } = await locals.supabase.auth.resetPasswordForEmail(sanitizedEmail, {
      redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
    });

    if (error) {
      let localizedError = error.message;
      if (error.message.includes('rate limit')) {
        localizedError = 'Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi.';
      } else if (error.message.includes('valid email')) {
        localizedError = 'Format alamat email tidak valid.';
      }
      return new Response(JSON.stringify({ error: localizedError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tautan atur ulang kata sandi telah dikirim ke email Anda.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Terjadi kesalahan saat memproses permintaan.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

