import type { APIRoute } from 'astro';
import { resolveMediaUrl, extractR2Key, deleteR2Object } from '../../../lib/r2';

export const prerender = false;

// GET: Fetch a single card by ID
export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params;

  const { data, error } = await locals.supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Card not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (Array.isArray(data.media_urls)) {
    data.media_urls = data.media_urls.map(resolveMediaUrl);
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// PATCH: Update a card
export const PATCH: APIRoute = async ({ params, locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid or malformed JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Allow only permitted mutable fields (protect id, user_id, slug, created_at, category)
  const allowedKeys = [
    'is_published',
    'recipient_name',
    'sender_name',
    'message',
    'event_date',
    'theme_config',
    'media_urls',
  ];

  const updatePayload: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (key in body) {
      updatePayload[key] = body[key];
    }
  }

  // Validate recipient_name if provided
  if (updatePayload.recipient_name !== undefined && !updatePayload.recipient_name.trim()) {
    return new Response(JSON.stringify({ error: 'Recipient name cannot be empty' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate and sanitize media_urls if provided
  if (updatePayload.media_urls !== undefined) {
    if (!Array.isArray(updatePayload.media_urls)) {
      return new Response(JSON.stringify({ error: 'media_urls must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: existingCardInfo } = await locals.supabase
      .from('cards')
      .select('category')
      .eq('id', id)
      .eq('user_id', locals.user.id)
      .single();

    const maxPhotos = existingCardInfo?.category === 'wedding' ? 11 : 4;
    if (updatePayload.media_urls.length > maxPhotos) {
      return new Response(JSON.stringify({ error: `Maximum ${maxPhotos} photos allowed` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    updatePayload.media_urls = updatePayload.media_urls.map(resolveMediaUrl);
  }

  // ── R2 Diff Cleanup: delete orphaned media assets & custom audio ──
  const needMediaCheck = updatePayload.media_urls && Array.isArray(updatePayload.media_urls);
  const needAudioCheck = updatePayload.theme_config && 'customAudioUrl' in updatePayload.theme_config;

  if (needMediaCheck || needAudioCheck) {
    const { data: existingCard } = await locals.supabase
      .from('cards')
      .select('media_urls, theme_config')
      .eq('id', id)
      .eq('user_id', locals.user.id)
      .single();

    if (existingCard) {
      const keysToDelete: string[] = [];

      // Check media_urls diff
      if (needMediaCheck && Array.isArray(existingCard.media_urls)) {
        const oldUrls: string[] = existingCard.media_urls;
        const newUrls: string[] = updatePayload.media_urls;
        const removedUrls = oldUrls.filter((url: string) => !newUrls.includes(url));
        for (const url of removedUrls) {
          const k = extractR2Key(url);
          if (k) keysToDelete.push(k);
        }
      }

      // Check customAudioUrl diff
      if (needAudioCheck) {
        const oldAudio = existingCard.theme_config?.customAudioUrl;
        const newAudio = updatePayload.theme_config?.customAudioUrl;
        if (oldAudio && oldAudio !== newAudio) {
          const k = extractR2Key(oldAudio);
          if (k) keysToDelete.push(k);
        }
      }

      if (keysToDelete.length > 0) {
        await Promise.allSettled(
          keysToDelete.map((key) =>
            deleteR2Object(key).catch((err) =>
              console.error(`[PATCH] Failed to delete orphaned R2 asset "${key}":`, err)
            )
          )
        );
      }
    }
  }

  const { data, error } = await locals.supabase
    .from('cards')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', locals.user.id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!data) {
    return new Response(JSON.stringify({ error: 'Card not found or not authorized' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (Array.isArray(data.media_urls)) {
    data.media_urls = data.media_urls.map(resolveMediaUrl);
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// DELETE: Delete a card and its physical assets from Cloudflare R2
export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;

  // 1. Fetch card first to retrieve media_urls and theme_config for asset cleanup
  const { data: card, error: fetchError } = await locals.supabase
    .from('cards')
    .select('id, user_id, media_urls, theme_config')
    .eq('id', id)
    .eq('user_id', locals.user.id)
    .single();

  if (fetchError || !card) {
    return new Response(JSON.stringify({ error: 'Card not found or not authorized' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Permanently delete all physical image assets and custom audio from R2 bucket
  const keysToDelete: string[] = [];
  if (Array.isArray(card.media_urls) && card.media_urls.length > 0) {
    for (const url of card.media_urls) {
      const k = extractR2Key(url);
      if (k) keysToDelete.push(k);
    }
  }

  if (card.theme_config?.customAudioUrl) {
    const k = extractR2Key(card.theme_config.customAudioUrl);
    if (k) keysToDelete.push(k);
  }

  if (keysToDelete.length > 0) {
    await Promise.allSettled(
      keysToDelete.map((key) =>
        deleteR2Object(key).catch((err) =>
          console.error(`Failed to delete R2 asset "${key}":`, err)
        )
      )
    );
  }

  // 3. Delete card from Supabase (cascades to wishes table)
  const { error: deleteError } = await locals.supabase
    .from('cards')
    .delete()
    .eq('id', id)
    .eq('user_id', locals.user.id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
