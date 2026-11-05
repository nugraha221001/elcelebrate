import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Sesi telah berakhir. Silakan masuk kembali.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const newPassword = (body.password || body.new_password || '').trim();
    const confirmPassword = (body.confirm_password || body.confirmPassword || '').trim();

    if (!newPassword || !confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Kata sandi baru dan konfirmasi kata sandi wajib diisi' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Kata sandi minimal harus 6 karakter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Konfirmasi kata sandi tidak cocok' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { error } = await locals.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      let localizedError = error.message;
      if (error.message.includes('should be different')) {
        localizedError = 'Kata sandi baru harus berbeda dari kata sandi saat ini.';
      } else if (error.message.includes('at least 6 characters')) {
        localizedError = 'Kata sandi minimal harus 6 karakter.';
      } else if (error.message.includes('Auth session missing')) {
        localizedError = 'Sesi tidak ditemukan. Silakan masuk kembali.';
      }
      return new Response(JSON.stringify({ error: localizedError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Kata sandi berhasil diperbarui' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Terjadi kesalahan sistem saat memperbarui kata sandi' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

