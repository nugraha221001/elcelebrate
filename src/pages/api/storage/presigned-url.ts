import type { APIRoute } from 'astro';
import { getPresignedUploadUrl } from '../../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  // Auth check
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { filename, contentType, folder = 'cards' } = await request.json();

  // Validate file extension — only .webp allowed
  if (!filename || !filename.endsWith('.webp')) {
    return new Response(JSON.stringify({ error: 'Only .webp files are allowed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate content type
  if (contentType !== 'image/webp') {
    return new Response(JSON.stringify({ error: 'Content type must be image/webp' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Sanitize folder to either 'cards' or 'avatars'
  const targetFolder = folder === 'avatars' ? 'avatars' : 'cards';

  // Generate a unique key: {folder}/{userId}/{timestamp}-{filename}
  const key = `${targetFolder}/${locals.user.id}/${Date.now()}-${filename}`;

  try {
    const result = await getPresignedUploadUrl(key, contentType, 300); // 5 minute expiry

    return new Response(
      JSON.stringify({
        ...result,
        publicUrl: `/api/media/${key}`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to generate upload URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
