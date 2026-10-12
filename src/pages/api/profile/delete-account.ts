import type { APIRoute } from 'astro';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getR2Client, extractR2Key, deleteR2Object } from '../../../lib/r2';
import { createSupabaseAdminClient } from '../../../lib/supabase';

export const prerender = false;

async function handleDeleteAccount({ locals, cookies }: Parameters<APIRoute>[0]): Promise<Response> {
  // 1. Verify authenticated user session
  if (!locals.user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const userId = locals.user.id;

  try {
    // 2. Fetch user's profile to obtain avatar_url
    const { data: profile } = await locals.supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .maybeSingle();

    const avatarUrl = profile?.avatar_url || (locals.user.user_metadata?.avatar_url as string | null);

    // Fetch all cards belonging to the user
    const { data: cards, error: cardsError } = await locals.supabase
      .from('cards')
      .select('id, media_urls, theme_config')
      .eq('user_id', userId);

    if (cardsError) {
      console.error('[delete-account] Error fetching user cards:', cardsError);
    }

    // 3. Collect all R2 keys from media_urls, theme_config.customAudioUrl, and avatar_url
    const r2KeysSet = new Set<string>();

    if (avatarUrl) {
      const key = extractR2Key(avatarUrl);
      if (key) r2KeysSet.add(key);
    }

    const cardList = cards || [];
    for (const card of cardList) {
      if (Array.isArray(card.media_urls)) {
        for (const url of card.media_urls) {
          const key = extractR2Key(url);
          if (key) r2KeysSet.add(key);
        }
      }

      if (card.theme_config && typeof card.theme_config === 'object') {
        const customAudio = (card.theme_config as any).customAudioUrl;
        if (customAudio) {
          const key = extractR2Key(customAudio);
          if (key) r2KeysSet.add(key);
        }
      }
    }

    // Batch delete R2 assets if any exist
    const keysToDelete = Array.from(r2KeysSet);
    if (keysToDelete.length > 0) {
      try {
        const s3Client = getR2Client();
        const bucketName = import.meta.env.R2_BUCKET_NAME;

        // S3 DeleteObjectsCommand allows max 1000 items per request
        for (let i = 0; i < keysToDelete.length; i += 1000) {
          const chunk = keysToDelete.slice(i, i + 1000);
          const command = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
              Objects: chunk.map((Key) => ({ Key })),
              Quiet: true,
            },
          });
          await s3Client.send(command);
        }
      } catch (r2BatchErr) {
        console.error('[delete-account] Batch R2 deletion failed, falling back to individual deletes:', r2BatchErr);
        await Promise.allSettled(
          keysToDelete.map((key) =>
            deleteR2Object(key).catch((singleErr) =>
              console.error(`[delete-account] Failed to delete R2 asset "${key}":`, singleErr)
            )
          )
        );
      }
    }

    // 4. Delete records from database: wishes -> cards -> profiles
    const cardIds = cardList.map((c) => c.id);

    // 4a. Delete wishes linked to user's cards
    if (cardIds.length > 0) {
      const { error: wishesErr } = await locals.supabase
        .from('wishes')
        .delete()
        .in('card_id', cardIds);

      if (wishesErr) {
        console.error('[delete-account] Error deleting wishes:', wishesErr);
      }
    }

    // 4b. Delete cards
    const { error: cardsDeleteErr } = await locals.supabase
      .from('cards')
      .delete()
      .eq('user_id', userId);

    if (cardsDeleteErr) {
      console.error('[delete-account] Error deleting cards:', cardsDeleteErr);
    }

    // 4c. Delete profile from public.profiles
    const hasServiceRoleKey = Boolean(import.meta.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasServiceRoleKey) {
      const adminClient = createSupabaseAdminClient();
      const { error: profileDeleteErr } = await adminClient
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteErr) {
        console.error('[delete-account] Admin error deleting profile:', profileDeleteErr);
      }
    } else {
      const { error: profileDeleteErr } = await locals.supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteErr) {
        console.error('[delete-account] Error deleting profile:', profileDeleteErr);
      }
    }

    // 5. Delete user from auth.users via Supabase Admin API if service role key is available
    if (hasServiceRoleKey) {
      try {
        const adminClient = createSupabaseAdminClient();
        const { error: adminAuthDeleteErr } = await adminClient.auth.admin.deleteUser(userId);
        if (adminAuthDeleteErr) {
          console.error('[delete-account] Admin error deleting auth user:', adminAuthDeleteErr);
        }
      } catch (authDeleteException) {
        console.error('[delete-account] Exception deleting user from auth:', authDeleteException);
      }
    }

    // 6. Terminate auth session and invalidate cookies
    try {
      await locals.supabase.auth.signOut();
    } catch (signOutErr) {
      console.error('[delete-account] Error during sign out:', signOutErr);
    }

    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Akun dan seluruh data Anda berhasil dihapus secara permanen',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[delete-account] Unhandled exception:', err);
    return new Response(
      JSON.stringify({
        error: err.message || 'Terjadi kesalahan internal saat menghapus akun',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export const POST: APIRoute = async (context) => handleDeleteAccount(context);
export const DELETE: APIRoute = async (context) => handleDeleteAccount(context);
