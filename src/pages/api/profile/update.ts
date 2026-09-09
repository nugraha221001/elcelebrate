import type { APIRoute } from 'astro';
import { resolveMediaUrl } from '../../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { full_name, avatar_url } = await request.json();

    if (typeof full_name !== 'string' || !full_name.trim()) {
      return new Response(JSON.stringify({ error: 'Full name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trimmedName = full_name.trim();
    const updatePayload: Record<string, any> = {
      full_name: trimmedName,
    };

    if (avatar_url !== undefined) {
      updatePayload.avatar_url = avatar_url ? resolveMediaUrl(avatar_url) : avatar_url;
    }

    // 1. Update public.profiles table
    const { data, error: profileError } = await locals.supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', locals.user.id)
      .select()
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Sync to Supabase auth metadata so JWT/session immediately reflects changes
    const authUpdatePayload: Record<string, any> = {
      full_name: trimmedName,
    };
    if (avatar_url !== undefined) {
      authUpdatePayload.avatar_url = avatar_url ? resolveMediaUrl(avatar_url) : avatar_url;
    }

    await locals.supabase.auth.updateUser({
      data: authUpdatePayload,
    });

    if (data && data.avatar_url) {
      data.avatar_url = resolveMediaUrl(data.avatar_url);
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile: data,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to update profile' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
