import type { APIRoute } from 'astro';
import { resolveMediaUrl } from '../../../lib/r2';

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
  const updates = await request.json();

  // Remove protected fields
  delete updates.id;
  delete updates.user_id;
  delete updates.slug;
  delete updates.created_at;

  const { data, error } = await locals.supabase
    .from('cards')
    .update(updates)
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

// DELETE: Delete a card
export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;

  const { error } = await locals.supabase
    .from('cards')
    .delete()
    .eq('id', id)
    .eq('user_id', locals.user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
