import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, cookies }) => {
  try {
    const body = await request.json();
    const newPassword = (body.password || body.new_password || '').trim();
    const confirmPassword = (body.confirm_password || body.confirmPassword || '').trim();
    const token_hash = (body.token_hash || '').trim();
    const code = (body.code || '').trim();
    const authHeader = request.headers.get('authorization') || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
    const accessToken = (body.access_token || tokenFromHeader || '').trim();
    const refreshToken = (body.refresh_token || '').trim();

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

    const authClient = locals.supabase;
    let authError: string | null = null;
    let authenticatedUserId: string | null = null;

    // Execute recovery verification in strict priority order:
    // 1) If token_hash is provided: verifyOtp({ token_hash, type: 'recovery' })
    // Works across any browser or mobile WebView without requiring PKCE localStorage!
    if (token_hash) {
      const { data, error } = await authClient.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      });
      if (error || !data?.user) {
        authError = error?.message || 'Tautan pemulihan tidak valid atau telah kedaluwarsa.';
      } else {
        authenticatedUserId = data.user.id;
      }
    }
    // 2) Else if code is provided: exchangeCodeForSession(code)
    else if (code) {
      const { data, error } = await authClient.auth.exchangeCodeForSession(code);
      if (error || !data?.user) {
        authError = error?.message || 'Kode pemulihan tidak valid atau telah kedaluwarsa.';
      } else {
        authenticatedUserId = data.user.id;
      }
    }
    // 3) Else if access_token & refresh_token are provided (from URL hash)
    else if (accessToken) {
      const { data, error } = await authClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });
      if (error || !data?.user) {
        const { data: userData, error: userErr } = await authClient.auth.getUser(accessToken);
        if (userErr || !userData?.user) {
          authError = error?.message || userErr?.message || 'Sesi pemulihan tidak valid atau telah kedaluwarsa.';
        } else {
          authenticatedUserId = userData.user.id;
        }
      } else {
        authenticatedUserId = data.user.id;
      }
    }
    // 4) Else: fallback to existing sb-access-token / sb-refresh-token cookies
    else if (locals.user) {
      authenticatedUserId = locals.user.id;
    } else {
      return new Response(
        JSON.stringify({ error: 'Sesi pemulihan tidak ditemukan. Silakan minta tautan pemulihan baru.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (authError) {
      let localizedAuthError = authError;
      if (
        authError.includes('expired') ||
        authError.includes('invalid') ||
        authError.includes('Token has expired') ||
        authError.includes('otp_expired')
      ) {
        localizedAuthError = 'Tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.';
      }
      return new Response(
        JSON.stringify({ error: localizedAuthError }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Once the session is established from steps 1-4, immediately call updateUser({ password })
    let updateError: any = null;
    const { error: updErr } = await authClient.auth.updateUser({
      password: newPassword,
    });
    updateError = updErr;

    // Resilient fallback: If updateUser returned session missing but we have authenticatedUserId
    if (updateError && authenticatedUserId) {
      try {
        const supabaseAdmin = createSupabaseAdminClient();
        const { error: adminErr } = await supabaseAdmin.auth.admin.updateUserById(
          authenticatedUserId,
          { password: newPassword }
        );
        if (!adminErr) {
          updateError = null;
        }
      } catch {
        // preserve original updateError
      }
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

    // After successful password update:
    // Call signOut, clear sb-access-token and sb-refresh-token cookies, and return { success: true }
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    try {
      await authClient.auth.signOut();
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
