import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid or malformed JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Support multiple provider payload keys
  const orderId =
    (body.order_id as string) ||
    (body.merchant_ref as string) ||
    (body.orderId as string) ||
    '';

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Order ID tidak ditemukan dalam payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Use service role client for privileged payment settlement
  const adminClient = createSupabaseAdminClient();

  // Find transaction
  const { data: tx, error: txError } = await adminClient
    .from('transactions')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (txError || !tx) {
    return new Response(JSON.stringify({ error: `Transaksi dengan Order ID ${orderId} tidak ditemukan` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Idempotency: if already settled, return 200 immediately
  if (tx.status === 'settled') {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Transaksi sudah berstatus settled sebelumnya',
        orderId,
        alreadySettled: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();

  // Mark transaction as settled
  const { error: updateTxErr } = await adminClient
    .from('transactions')
    .update({
      status: 'settled',
      settled_at: nowIso,
    })
    .eq('id', tx.id);

  if (updateTxErr) {
    return new Response(JSON.stringify({ error: updateTxErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let newExpiresAtIso: string | null = null;
  let graceUntilIso: string | null = null;

  // Settle and extend card active period
  if (tx.card_id) {
    const { data: card, error: cardFetchErr } = await adminClient
      .from('cards')
      .select('id, payment_status, expires_at, duration_days')
      .eq('id', tx.card_id)
      .single();

    if (!cardFetchErr && card) {
      const durationDays = Number(tx.duration_days) || 7;
      const durationMs = durationDays * 24 * 60 * 60 * 1000;

      // If card already has an active future expires_at, extend from that date
      let baseDate = now;
      if (card.expires_at) {
        const currentExpires = new Date(card.expires_at);
        if (currentExpires.getTime() > now.getTime()) {
          baseDate = currentExpires;
        }
      }

      const calculatedExpires = new Date(baseDate.getTime() + durationMs);
      const calculatedGrace = new Date(calculatedExpires.getTime() + 48 * 60 * 60 * 1000); // +48h grace

      newExpiresAtIso = calculatedExpires.toISOString();
      graceUntilIso = calculatedGrace.toISOString();

      await adminClient
        .from('cards')
        .update({
          payment_status: 'paid',
          is_published: true,
          paid_at: nowIso,
          duration_days: durationDays,
          expires_at: newExpiresAtIso,
          grace_until: graceUntilIso,
        })
        .eq('id', card.id);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      orderId,
      status: 'settled',
      cardId: tx.card_id,
      expiresAt: newExpiresAtIso,
      graceUntil: graceUntilIso,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
