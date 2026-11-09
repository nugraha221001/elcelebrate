import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteR2Object, extractR2Key } from './r2';

/**
 * Automated Expired Card Garbage Collector.
 * Finds cards where:
 * 1. grace_until is not null AND grace_until < now()
 * OR
 * 2. payment_status = 'unpaid' AND created_at < now() - interval '24 hours'
 *
 * Excludes:
 * - slug = 'demo-wedding'
 * - payment_status = 'admin_free'
 *
 * Deletes all R2 media objects referenced in media_urls and theme_config.customAudioUrl (internal /api/media/ uploads),
 * and deletes the card row from public.cards (cascades to wishes and transactions).
 */
export async function cleanupExpiredCards(
  supabaseAdmin: SupabaseClient,
  _env?: unknown
): Promise<{ deletedCount: number }> {
  try {
    const nowIso = new Date().toISOString();
    const twentyFourHoursAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Query cards that meet expiration conditions
    const { data: expiredCards, error } = await supabaseAdmin
      .from('cards')
      .select('id, slug, payment_status, media_urls, theme_config, created_at, expires_at, grace_until')
      .neq('slug', 'demo-wedding')
      .neq('payment_status', 'admin_free')
      .or(`and(grace_until.not.is.null,grace_until.lt.${nowIso}),and(payment_status.eq.unpaid,created_at.lt.${twentyFourHoursAgoIso})`);

    if (error) {
      console.error('[cleanupExpiredCards] Query error:', error);
      return { deletedCount: 0 };
    }

    if (!expiredCards || expiredCards.length === 0) {
      return { deletedCount: 0 };
    }

    let deletedCount = 0;

    for (const card of expiredCards) {
      try {
        // Collect R2 keys
        const mediaUrls: string[] = Array.isArray(card.media_urls) ? card.media_urls : [];
        const themeConfig = card.theme_config && typeof card.theme_config === 'object'
          ? (card.theme_config as Record<string, unknown>)
          : null;
        const customAudioUrl = typeof themeConfig?.customAudioUrl === 'string'
          ? themeConfig.customAudioUrl
          : undefined;

        const allUrls = [...mediaUrls];
        if (customAudioUrl) {
          allUrls.push(customAudioUrl);
        }

        // Only delete internal R2 uploads (starting with /api/media/ or storage key)
        for (const url of allUrls) {
          if (typeof url === 'string' && (url.startsWith('/api/media/') || url.includes('.r2.dev') || url.startsWith('cards/'))) {
            const key = extractR2Key(url);
            if (key) {
              try {
                await deleteR2Object(key);
              } catch (r2Err) {
                console.warn(`[cleanupExpiredCards] Failed to delete R2 object ${key}:`, r2Err);
              }
            }
          }
        }

        // Delete card row from public.cards (cascades to wishes and transactions)
        const { error: delErr } = await supabaseAdmin
          .from('cards')
          .delete()
          .eq('id', card.id);

        if (delErr) {
          console.error(`[cleanupExpiredCards] Failed to delete card ${card.id}:`, delErr);
        } else {
          deletedCount++;
        }
      } catch (cardErr) {
        console.error(`[cleanupExpiredCards] Error processing card ${card.id}:`, cardErr);
      }
    }

    return { deletedCount };
  } catch (err) {
    console.error('[cleanupExpiredCards] Unexpected error:', err);
    return { deletedCount: 0 };
  }
}

