import type { APIRoute } from 'astro';
import { getR2Object } from '../../../lib/r2';

export const prerender = false;

// Allowed asset prefix paths for security
const ALLOWED_PREFIXES = ['cards/', 'avatars/', 'audio/'];

export const GET: APIRoute = async ({ params }) => {
  const { path } = params;

  if (!path) {
    return new Response('Not Found', { status: 404 });
  }

  // Normalize key and strip leading slashes
  const rawKey = Array.isArray(path) ? path.join('/') : path;
  const key = rawKey.replace(/^\/+/, '').trim();

  // Prevent path traversal
  if (key.includes('..') || key.includes('\\')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Security: Restrict proxy requests to allow fetching only allowed asset prefixes
  const isAllowed = ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const object = await getR2Object(key);

    if (!object.Body) {
      return new Response('Not Found', { status: 404 });
    }

    // Convert stream to web-compatible stream or BodyInit
    let body: BodyInit;
    if (typeof (object.Body as any).transformToWebStream === 'function') {
      body = (object.Body as any).transformToWebStream();
    } else if (object.Body instanceof ReadableStream) {
      body = object.Body;
    } else if (typeof (object.Body as any).transformToByteArray === 'function') {
      body = await (object.Body as any).transformToByteArray();
    } else {
      body = object.Body as any;
    }

    const headers = new Headers();
    let defaultContentType = 'image/webp';
    if (key.endsWith('.mp3')) defaultContentType = 'audio/mpeg';
    else if (key.endsWith('.ogg')) defaultContentType = 'audio/ogg';
    else if (key.endsWith('.opus')) defaultContentType = 'audio/opus';
    else if (key.startsWith('audio/')) defaultContentType = 'audio/mpeg';

    const contentType = object.ContentType && object.ContentType !== 'binary/octet-stream'
      ? object.ContentType
      : defaultContentType;

    headers.set('Content-Type', contentType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    if (object.ContentLength) {
      headers.set('Content-Length', object.ContentLength.toString());
    }
    if (object.ETag) {
      headers.set('ETag', object.ETag);
    }

    return new Response(body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    if (
      err.name === 'NoSuchKey' ||
      err.name === 'NotFound' ||
      err.$metadata?.httpStatusCode === 404 ||
      err.Code === 'NoSuchKey'
    ) {
      return new Response('Not Found', { status: 404 });
    }

    console.error('Error streaming R2 media:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const HEAD: APIRoute = async (context) => {
  const res = await GET(context);
  return new Response(null, {
    status: res.status,
    headers: res.headers,
  });
};
