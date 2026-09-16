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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid or malformed JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { filename, contentType, folder = 'cards' } = body || {};

  let key: string;

  if (folder === 'audio') {
    const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.ogg', '.opus'];
    const ALLOWED_AUDIO_MIMES = ['audio/mpeg', 'audio/ogg', 'audio/opus'];

    const hasValidExt = typeof filename === 'string' && ALLOWED_AUDIO_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      return new Response(JSON.stringify({ error: 'Only .mp3, .ogg, and .opus audio files are allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_AUDIO_MIMES.includes(contentType)) {
      return new Response(JSON.stringify({ error: 'Content type must be audio/mpeg, audio/ogg, or audio/opus' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const random = Math.random().toString(36).substring(2, 8);
    const ext = filename.split('.').pop()?.toLowerCase() || 'mp3';
    key = `audio/${locals.user.id}/${Date.now()}-${random}.${ext}`;
  } else {
    // Validate file extension — only .webp allowed for cards & avatars
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
    key = `${targetFolder}/${locals.user.id}/${Date.now()}-${filename}`;
  }

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
