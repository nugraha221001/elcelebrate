/**
 * Generates clean, URL-safe custom slugs for greeting cards.
 * Format: {recipient}-{category}-{random} (e.g., "sarah-birthday-x7k9")
 */

/** Characters for the random suffix (URL-safe, no ambiguous chars) */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

/**
 * Generate a random alphanumeric suffix.
 */
function randomSuffix(length: number = 4): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return result;
}

/**
 * Sanitize a string into a URL-safe slug segment.
 * Removes accents, special chars, and normalizes whitespace to hyphens.
 */
function sanitize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special chars
    .trim()
    .replace(/[\s-]+/g, '-')        // Normalize whitespace/hyphens
    .replace(/^-+|-+$/g, '');       // Trim leading/trailing hyphens
}

/**
 * Generate a card slug from recipient name and category.
 *
 * @param recipientName - The recipient's name
 * @param category - The card category
 * @returns A clean slug like "sarah-birthday-x7k9"
 */
export function generateSlug(recipientName: string, category: string): string {
  const name = sanitize(recipientName).slice(0, 20);
  const cat = sanitize(category).slice(0, 12);
  const suffix = randomSuffix(4);

  return `${name}-${cat}-${suffix}`;
}

/**
 * Validate that a slug matches the expected format.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,60}$/.test(slug);
}
