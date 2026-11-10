import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, cookies }) => {
  try {
    const body = await request.json();
    const newPassword = (body.password || body.new_password || '').trim();
    const confirmPassword = (body.confirm_password || body.confirmPassword || '').trim();
    const authHeader = request.headers.get('authorization') || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
    const accessToken = (body.access_token || tokenFromHeader || '').trim();

    if (!newPassword || !confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Kata sandi baru dan konfirmasi kata sandi wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Kata sandi minimal harus 6 karakter.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let updateError: any = null;

    // Case 1: Active server session exists
    if (locals.user) {
      const { error } = await locals.supabase.auth.updateUser({
        password: newPassword,
      });
      updateError = error;
    }
    // Case 2: Client passed accessToken from recovery hash
    else if (accessToken) {
      const { data: userData, error: getUserError } = await locals.supabase.auth.getUser(accessToken);
      if (getUserError || !userData?.user) {
        return new Response(
          JSON.stringify({ error: 'Sesi pemulihan tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      try {
        const supabaseAdmin = createSupabaseAdminClient();
        const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
          userData.user.id,
          { password: newPassword }
        );
        updateError = adminError;
      } catch {
        // Fallback: setSession and updateUser
        await locals.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: body.refresh_token || '',
        });
        const { error: fallbackError } = await locals.supabase.auth.updateUser({
          password: newPassword,
        });
        updateError = fallbackError;
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Sesi pemulihan tidak ditemukan. Silakan minta tautan pemulihan baru.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (updateError) {
      let localizedError = updateError.message;
      if (updateError.message?.includes('should be different')) {
        localizedError = 'Kata sandi baru harus berbeda dari kata sandi saat ini.';
      } else if (updateError.message?.includes('at least 6 characters')) {
        localizedError = 'Kata sandi minimal harus 6 karakter.';
      }
      return new Response(
        JSON.stringify({ error: localizedError }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sign out recovery session and clear cookies so user logs in cleanly
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    try {
      await locals.supabase.auth.signOut();
    } catch {
      // ignore
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Kata sandi berhasil diperbarui',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Terjadi kesalahan sistem saat memperbarui kata sandi.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

