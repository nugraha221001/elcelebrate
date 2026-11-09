import type { APIRoute } from 'astro';
import { DURATION_TIERS, getTierByDays } from '../../../lib/pricing';
import {
  generateOrderId,
  generateSimulatedQrisString,
  generateQrisSvg,
  getPaymentGatewayConfig,
} from '../../../lib/qris';
import { createSupabaseAdminClient } from '../../../lib/supabase';
import { isAdminOrSuperAdmin } from '../../../lib/types';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { cardId?: string; durationDays?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid or malformed JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { cardId, durationDays } = body || {};

  if (!cardId || typeof cardId !== 'string') {
    return new Response(JSON.stringify({ error: 'ID Kartu (cardId) wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validDurations = DURATION_TIERS.map((t) => t.days);
  const daysNum = Number(durationDays);
  if (!durationDays || !validDurations.includes(daysNum)) {
    return new Response(
      JSON.stringify({
        error: `Durasi tidak valid. Pilih salah satu dari: ${validDurations.join(', ')} hari`,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const tier = getTierByDays(daysNum);
  const adminClient = createSupabaseAdminClient();

  // Verify card exists
  const { data: card, error: cardError } = await adminClient
    .from('cards')
    .select('id, user_id, slug, recipient_name')
    .eq('id', cardId)
    .single();

  if (cardError || !card) {
    return new Response(JSON.stringify({ error: 'Kartu tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check card ownership or admin access
  if (card.user_id !== locals.user.id) {
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', locals.user.id)
      .single();

    if (!isAdminOrSuperAdmin(callerProfile?.role, locals.user.email)) {
      return new Response(JSON.stringify({ error: 'Anda tidak memiliki akses ke kartu ini' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const orderId = generateOrderId();
  let gatewayConfig = { provider: 'simulation', isSimulation: true };
  try {
    gatewayConfig = getPaymentGatewayConfig();
  } catch {
    gatewayConfig = { provider: 'simulation', isSimulation: true };
  }

  // Generate QRIS payload
  const qrString = generateSimulatedQrisString(orderId, tier.price);
  const qrSvg = generateQrisSvg(qrString);

  // Insert pending transaction using admin client to prevent any RLS friction
  const { error: txError } = await adminClient.from('transactions').insert({
    order_id: orderId,
    card_id: card.id,
    user_id: locals.user.id,
    amount: tier.price,
    duration_days: daysNum,
    status: 'pending',
    payment_method: 'qris',
    qr_string: qrString,
    gateway_provider: gatewayConfig.provider,
  });

  if (txError) {
    return new Response(JSON.stringify({ error: `Gagal mencatat transaksi: ${txError.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      orderId,
      cardId: card.id,
      cardSlug: card.slug,
      recipientName: card.recipient_name,
      amount: tier.price,
      durationDays: daysNum,
      tierName: tier.name,
      qrString,
      qrSvg,
      isSimulation: gatewayConfig.isSimulation,
      gatewayProvider: gatewayConfig.provider,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
