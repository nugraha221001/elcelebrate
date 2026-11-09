import type { APIRoute } from 'astro';
import { generateSlug } from '../../../lib/slug';
import { resolveMediaUrl } from '../../../lib/r2';
import { isAdminOrSuperAdmin } from '../../../lib/types';

export const prerender = false;

// GET: List authenticated user's cards
export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await locals.supabase
    .from('cards')
    .select('*')
    .eq('user_id', locals.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// POST: Create a new card
export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid or malformed JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    category,
    recipient_name,
    sender_name = '',
    message = '',
    event_date = null,
    theme_config = {},
    media_urls = [],
    duration_days = 7,
  } = body || {};

  // Validation
  if (!category || !recipient_name) {
    return new Response(JSON.stringify({ error: 'Category and recipient name are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!['birthday', 'anniversary', 'graduation', 'invitation', 'wedding', 'love', 'greetings'].includes(category)) {
    return new Response(JSON.stringify({ error: 'Invalid category' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const maxPhotos = category === 'wedding' ? 11 : 4;
  if (Array.isArray(media_urls) && media_urls.length > maxPhotos) {
    return new Response(JSON.stringify({ error: `Maximum ${maxPhotos} photos allowed` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Generate unique slug (retry on collision)
  let slug = generateSlug(recipient_name, category);
  let attempts = 0;

  while (attempts < 5) {
    const { data: existing } = await locals.supabase
      .from('cards')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existing) break;
    slug = generateSlug(recipient_name, category);
    attempts++;
  }

  const sanitizedMediaUrls = Array.isArray(media_urls)
    ? media_urls.map(resolveMediaUrl)
    : [];

  // Check user role for Admin VIP bypass
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('role')
    .eq('id', locals.user.id)
    .single();

  const isVip = isAdminOrSuperAdmin(profile?.role, locals.user.email);
  const durationNum = [3, 7, 14, 30, 45, 60].includes(Number(duration_days)) ? Number(duration_days) : 7;

  const paymentStatus = isVip ? 'admin_free' : 'unpaid';
  const isPublished = isVip; // Admin/SuperAdmin VIP cards are published immediately, user cards require QRIS activation
  const paidAt = isVip ? new Date().toISOString() : null;

  const { data, error } = await locals.supabase
    .from('cards')
    .insert({
      user_id: locals.user.id,
      slug,
      category,
      recipient_name,
      sender_name,
      message,
      event_date,
      theme_config,
      media_urls: sanitizedMediaUrls,
      is_published: isPublished,
      payment_status: paymentStatus,
      duration_days: durationNum,
      paid_at: paidAt,
      expires_at: null,
      grace_until: null,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (data && Array.isArray(data.media_urls)) {
    data.media_urls = data.media_urls.map(resolveMediaUrl);
  }

  return new Response(
    JSON.stringify({
      ...data,
      requiresPayment: !isVip,
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
