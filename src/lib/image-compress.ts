/**
 * Client-side image compression utility.
 * Runs entirely in the browser — never sends raw images through the server.
 *
 * Pipeline: Input File → Downscale (1080px) → WebP transcode (80%) → Size check (≤200KB)
 */

import imageCompression from 'browser-image-compression';

/** Maximum allowed dimensions (width or height) to prevent mobile canvas OOM */
const MAX_DIMENSION = 1280;

/** Target WebP quality (0-1) */
const QUALITY = 0.8;

/** Hard size limit in KB (200KB) */
const MAX_SIZE_KB = 200;

/** Maximum photos per card */
export const MAX_PHOTOS_PER_CARD = 4;

export interface CompressedImage {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compresses and converts an image to WebP format, enforcing strictly <= 200KB.
 * Gracefully falls back from WebWorker to main thread if worker crashes.
 *
 * @param file - The raw File from an <input type="file"> or drag-and-drop
 * @returns A CompressedImage with the processed WebP file and metadata
 * @throws Error if the image cannot be compressed below 200KB or produces an empty file
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const originalSize = file.size;

  let compressed: File | Blob;

  // Stage 1: Attempt standard compression with WebWorker
  try {
    compressed = await imageCompression(file, {
      maxSizeMB: 0.19, // Strictly below 200KB (~194.5KB target)
      maxWidthOrHeight: MAX_DIMENSION, // 1280px prevents mobile canvas Out-Of-Memory crashes
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: QUALITY,
    });
  } catch (workerErr) {
    // Stage 2 (Catch block): If worker crashes, immediately retry compression on the main thread
    console.warn('WebWorker compression failed/crashed, falling back to main thread:', workerErr);
    compressed = await imageCompression(file, {
      maxSizeMB: 0.19,
      maxWidthOrHeight: 1080,
      useWebWorker: false,
      maxIteration: 10,
      fileType: 'image/webp',
      initialQuality: 0.75,
    });
  }

  // If still above 200KB limit, do a secondary aggressive pass on main thread
  if (compressed && compressed.size > MAX_SIZE_KB * 1024) {
    try {
      compressed = await imageCompression(compressed as File, {
        maxSizeMB: 0.19,
        maxWidthOrHeight: 1080,
        useWebWorker: false,
        maxIteration: 10,
        fileType: 'image/webp',
        initialQuality: 0.6,
      });
    } catch (passErr) {
      console.warn('Secondary compression pass failed:', passErr);
    }
  }

  // Output Validation
  if (!compressed || compressed.size === 0) {
    throw new Error('Image compression produced an empty file. Please try another image.');
  }

  // Final size guard: strictly <= 200KB
  if (compressed.size > MAX_SIZE_KB * 1024) {
    throw new Error(
      `Image could not be compressed below ${MAX_SIZE_KB}KB. ` +
      `Current size: ${Math.round(compressed.size / 1024)}KB. ` +
      `Try a smaller or simpler image.`
    );
  }

  // Ensure .webp extension in filename
  const webpName = file.name.replace(/\.[^.]+$/, '.webp');
  const webpFile = new File([compressed], webpName, { type: 'image/webp' });

  const previewUrl = URL.createObjectURL(webpFile);

  return {
    file: webpFile,
    previewUrl,
    originalSize,
    compressedSize: webpFile.size,
    compressionRatio: Math.round((1 - webpFile.size / originalSize) * 100),
  };
}

/**
 * Compresses an avatar image to WebP with max 100KB and 400px dimensions.
 *
 * @param file - The raw image File
 * @returns A CompressedImage with the processed WebP avatar
 */
export async function compressAvatar(file: File): Promise<CompressedImage> {
  const originalSize = file.size;
  const MAX_AVATAR_SIZE_KB = 100;
  const MAX_AVATAR_DIM = 400;

  let compressed: File | Blob;
  try {
    compressed = await imageCompression(file, {
      maxSizeMB: MAX_AVATAR_SIZE_KB / 1024,
      maxWidthOrHeight: MAX_AVATAR_DIM,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.85,
    });
  } catch (workerErr) {
    console.warn('Avatar WebWorker compression failed, falling back to main thread:', workerErr);
    compressed = await imageCompression(file, {
      maxSizeMB: MAX_AVATAR_SIZE_KB / 1024,
      maxWidthOrHeight: MAX_AVATAR_DIM,
      useWebWorker: false,
      maxIteration: 10,
      fileType: 'image/webp',
      initialQuality: 0.75,
    });
  }

  if (compressed && compressed.size > MAX_AVATAR_SIZE_KB * 1024) {
    try {
      compressed = await imageCompression(compressed as File, {
        maxSizeMB: MAX_AVATAR_SIZE_KB / 1024,
        maxWidthOrHeight: MAX_AVATAR_DIM,
        useWebWorker: false,
        maxIteration: 10,
        fileType: 'image/webp',
        initialQuality: 0.65,
      });
    } catch {
      // ignore
    }
  }

  if (!compressed || compressed.size === 0) {
    throw new Error('Avatar compression produced an empty file.');
  }

  if (compressed.size > MAX_AVATAR_SIZE_KB * 1024) {
    throw new Error(
      `Avatar could not be compressed below ${MAX_AVATAR_SIZE_KB}KB. Try a different image.`
    );
  }

  const webpName = `avatar-${Date.now()}.webp`;
  const webpFile = new File([compressed], webpName, { type: 'image/webp' });
  const previewUrl = URL.createObjectURL(webpFile);

  return {
    file: webpFile,
    previewUrl,
    originalSize,
    compressedSize: webpFile.size,
    compressionRatio: Math.round((1 - webpFile.size / originalSize) * 100),
  };
}

/**
 * Upload a compressed WebP file directly to R2 using a presigned URL.
 *
 * @param presignedUrl - The presigned PUT URL from /api/storage/presigned-url
 * @param file - The compressed WebP File object
 * @param onProgress - Optional progress callback (0-100)
 */
export async function uploadToR2(
  presignedUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
  contentType?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl, true);
    xhr.setRequestHeader('Content-Type', contentType || file.type || 'image/webp');

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed — network error'));
    xhr.send(file);
  });
}
