import type { APIRoute } from 'astro';
import { isAdminOrSuperAdmin } from '../../../../lib/types';

export const prerender = false;

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // Always wrap in quotes and escape internal double quotes as ""
  return `"${str.replace(/"/g, '""')}"`;
}

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) {
    return new Response('Authentication required', { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response('Card ID is required', { status: 400 });
  }

  // Fetch card to verify ownership or admin role
  const { data: card, error: cardError } = await locals.supabase
    .from('cards')
    .select('id, user_id, slug, recipient_name')
    .eq('id', id)
    .single();

  if (cardError || !card) {
    return new Response('Card not found', { status: 404 });
  }

  // Check ownership or admin
  if (card.user_id !== locals.user.id) {
    const { data: profile } = await locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', locals.user.id)
      .single();

    if (!isAdminOrSuperAdmin(profile?.role, locals.user.email)) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  // Fetch wishes for this card
  const { data: wishes, error: wishesError } = await locals.supabase
    .from('wishes')
    .select('id, sender_name, message, created_at')
    .eq('card_id', card.id)
    .order('created_at', { ascending: true });

  if (wishesError) {
    return new Response('Failed to fetch wishes', { status: 500 });
  }

  const rows: string[] = [];

  // Header row
  rows.push(
    [
      escapeCsvField('No'),
      escapeCsvField('Nama Pengirim'),
      escapeCsvField('Ucapan & Doa Restu'),
      escapeCsvField('Waktu Pengiriman (WIB)'),
    ].join(',')
  );

  const formatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  });

  const list = wishes || [];
  list.forEach((item, index) => {
    let formattedDate = item.created_at;
    try {
      formattedDate = formatter.format(new Date(item.created_at));
    } catch {
      formattedDate = item.created_at;
    }

    rows.push(
      [
        escapeCsvField(index + 1),
        escapeCsvField(item.sender_name),
        escapeCsvField(item.message),
        escapeCsvField(formattedDate),
      ].join(',')
    );
  });

  // Prepend UTF-8 BOM so Excel opens it with correct encoding for Indonesian text & emojis
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const filename = `ucapan-${card.slug}.csv`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
};

