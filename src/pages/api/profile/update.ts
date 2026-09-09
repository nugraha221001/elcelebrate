import type { APIRoute } from 'astro';
import { resolveMediaUrl, extractR2Key, deleteR2Object } from '../../../lib/r2';

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

    // 1. Fetch user's current profile record to check existing avatar_url
    const { data: currentProfile } = await locals.supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', locals.user.id)
      .single();

    const oldAvatarUrl = currentProfile?.avatar_url || (locals.user.user_metadata?.avatar_url as string | null) || null;

    // 2. Determine target new avatar URL (empty string, null, or undefined)
    let newAvatarUrl: string | null = null;
    if (typeof avatar_url === 'string' && avatar_url.trim()) {
      newAvatarUrl = resolveMediaUrl(avatar_url.trim());
    } else if (avatar_url === null || avatar_url === '') {
      newAvatarUrl = null;
    } else {
      // If undefined, retain current
      newAvatarUrl = oldAvatarUrl ? resolveMediaUrl(oldAvatarUrl) : null;
    }

    // 3. Comparison Check: If old avatar exists and is different from incoming avatar_url, delete old physical file from R2
    if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
      const keyToDelete = extractR2Key(oldAvatarUrl);
      if (keyToDelete) {
        try {
          await deleteR2Object(keyToDelete);
        } catch (deleteErr) {
          console.error(`Failed to delete orphaned avatar asset "${keyToDelete}":`, deleteErr);
        }
      }
    }

    const updatePayload: Record<string, any> = {
      full_name: trimmedName,
    };
    if (avatar_url !== undefined) {
      updatePayload.avatar_url = newAvatarUrl;
    }

    // 4. Update public.profiles table
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

    // 5. Sync to Supabase auth metadata so JWT/session immediately reflects changes
    const authUpdatePayload: Record<string, any> = {
      full_name: trimmedName,
    };
    if (avatar_url !== undefined) {
      authUpdatePayload.avatar_url = newAvatarUrl;
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
