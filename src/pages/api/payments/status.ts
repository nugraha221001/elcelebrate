import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const orderId = url.searchParams.get('order_id');
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Parameter order_id diperlukan' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: tx, error } = await locals.supabase
    .from('transactions')
    .select('id, order_id, card_id, amount, duration_days, status, settled_at')
    .eq('order_id', orderId)
    .single();

  if (error || !tx) {
    return new Response(JSON.stringify({ error: 'Transaksi tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(tx), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

