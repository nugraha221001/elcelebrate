import type { APIRoute } from 'astro';
import { resolveMediaUrl } from '../../../../lib/r2';

export const prerender = false;

// GET: Fetch a published card by its slug (public endpoint)
export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;

  const { data, error } = await locals.supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
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
