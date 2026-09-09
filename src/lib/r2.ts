import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { PresignedUrlResponse } from './types';

/**
 * S3-compatible client configured for Cloudflare R2.
 * Initialized lazily to avoid import-time env access issues.
 */
export function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${import.meta.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Generates a single-use presigned PUT URL for direct browser-to-R2 uploads.
 *
 * @param key - The object key (path) in the bucket (e.g., "cards/abc123/photo-1.webp")
 * @param contentType - MIME type (must be "image/webp")
 * @param expiresIn - URL validity in seconds (default: 300 = 5 minutes)
 * @returns Presigned upload URL and resulting public URL via internal proxy
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string = 'image/webp',
  expiresIn: number = 300
): Promise<PresignedUrlResponse> {
  const client = getR2Client();
  const bucketName = import.meta.env.R2_BUCKET_NAME;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = `/api/media/${key}`;

  return { uploadUrl, publicUrl, key };
}

/**
 * Fetches an object directly from R2 using GetObjectCommand.
 *
 * @param key - The object key (path) in the bucket
 */
export async function getR2Object(key: string) {
  const client = getR2Client();
  const bucketName = import.meta.env.R2_BUCKET_NAME;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await client.send(command);
}

/**
 * Permanently deletes an object from the Cloudflare R2 bucket.
 *
 * @param key - The object key (path) in the bucket (e.g., "cards/userId/123-photo.webp")
 */
export async function deleteR2Object(key: string): Promise<void> {
  const client = getR2Client();
  const bucketName = import.meta.env.R2_BUCKET_NAME;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await client.send(command);
}

/**
 * Extracts the storage key from a media URL.
 * Supports /api/media/<key>, https://*.r2.dev/<key>, or raw keys.
 */
export function extractR2Key(url: string | null | undefined): string | null {
  if (!url) return null;
  // If already relative proxy path: /api/media/cards/...
  if (url.startsWith('/api/media/')) {
    return url.replace(/^\/api\/media\//, '').replace(/^\/+/, '');
  }

  // If public *.r2.dev URL: https://pub-xxxx.r2.dev/cards/...
  const r2Match = url.match(/^https?:\/\/[^/]+\.r2\.dev\/(.+)$/);
  if (r2Match && r2Match[1]) {
    return r2Match[1].replace(/^\/+/, '');
  }

  // If matches configured R2_PUBLIC_DOMAIN
  const publicDomain = typeof import.meta !== 'undefined' && import.meta.env?.R2_PUBLIC_DOMAIN
    ? import.meta.env.R2_PUBLIC_DOMAIN
    : undefined;
  if (publicDomain && url.startsWith(publicDomain)) {
    return url.slice(publicDomain.length).replace(/^\/+/, '');
  }

  // If already a raw storage key
  if (url.startsWith('cards/') || url.startsWith('avatars/')) {
    return url;
  }

  return null;
}

/**
 * Resolves an asset URL into an internal proxy path (/api/media/...)
 * to bypass ISP DNS/SSL blocks on public *.r2.dev domains in Indonesia.
 * Leaves relative paths, data URLs, blob URLs, and non-R2 external URLs intact.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  // Already internal proxy path
  if (url.startsWith('/api/media/')) return url;

  // Backward compatibility: match any https://*.r2.dev/<key> (e.g. pub-*.r2.dev)
  const r2Match = url.match(/^https?:\/\/[^/]+\.r2\.dev\/(.+)$/);
  if (r2Match && r2Match[1]) {
    return `/api/media/${r2Match[1]}`;
  }

  // Match configured R2_PUBLIC_DOMAIN if set
  const publicDomain = typeof import.meta !== 'undefined' && import.meta.env?.R2_PUBLIC_DOMAIN
    ? import.meta.env.R2_PUBLIC_DOMAIN
    : undefined;
  if (publicDomain && url.startsWith(publicDomain)) {
    const key = url.slice(publicDomain.length).replace(/^\/+/, '');
    return `/api/media/${key}`;
  }

  return url;
}
