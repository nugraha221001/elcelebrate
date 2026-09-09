import type { APIRoute } from 'astro';

export const prerender = false;

// GET: Fetch all wishes for a card
export const GET: APIRoute = async ({ params, locals }) => {
  const { cardId } = params;

  const { data, error } = await locals.supabase
    .from('wishes')
    .select('*')
    .eq('card_id', cardId)
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

// POST: Submit a new wish (public — no auth required)
export const POST: APIRoute = async ({ params, locals, request }) => {
  const { cardId } = params;
  const { sender_name, message } = await request.json();

  // Validation
  if (!sender_name || !message) {
    return new Response(JSON.stringify({ error: 'Name and message are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (sender_name.length > 100) {
    return new Response(JSON.stringify({ error: 'Name must be under 100 characters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (message.length > 500) {
    return new Response(JSON.stringify({ error: 'Message must be under 500 characters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify the card exists and is published
  const { data: card } = await locals.supabase
    .from('cards')
    .select('id')
    .eq('id', cardId)
    .eq('is_published', true)
    .single();

  if (!card) {
    return new Response(JSON.stringify({ error: 'Card not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await locals.supabase
    .from('wishes')
    .insert({
      card_id: cardId,
      sender_name,
      message,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
