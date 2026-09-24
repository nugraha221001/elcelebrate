import type { AudioTrack, CardCategory, AmbientEffectType } from './types';

/**
 * Curated collection of 7 category-matched royalty-free instrumental loops.
 * All files are pre-bundled in public/audio/ as Opus format (<2MB each).
 */
export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'wedding',
    name: 'Sacred Romance',
    filename: 'wedding.opus',
    duration: 58,
    mood: 'Sacred & Romantic',
    category: ['wedding', 'anniversary', 'love'],
  },
  {
    id: 'birthday',
    name: 'Birthday Joy',
    filename: 'birthday.opus',
    duration: 44,
    mood: 'Joyful & Festive',
    category: ['birthday', 'invitation', 'greetings'],
  },
  {
    id: 'anniversary',
    name: 'Sweet Milestone',
    filename: 'anniversary.opus',
    duration: 50,
    mood: 'Warm & Nostalgic',
    category: ['anniversary', 'love', 'wedding'],
  },
  {
    id: 'graduation',
    name: 'Triumphant Horizon',
    filename: 'graduation.opus',
    duration: 60,
    mood: 'Inspiring & Grand',
    category: ['graduation', 'invitation'],
  },
  {
    id: 'invitation',
    name: 'Celebration Vibe',
    filename: 'invitation.opus',
    duration: 48,
    mood: 'Upbeat & Welcoming',
    category: ['invitation', 'birthday', 'graduation'],
  },
  {
    id: 'love',
    name: 'Heartfelt Melody',
    filename: 'love.opus',
    duration: 54,
    mood: 'Intimate & Tender',
    category: ['love', 'wedding', 'anniversary'],
  },
  {
    id: 'greetings',
    name: 'Warm Wishes',
    filename: 'greetings.opus',
    duration: 46,
    mood: 'Peaceful & Cordial',
    category: ['greetings', 'birthday', 'invitation'],
  },
];

/**
 * Recommended track IDs per category, sorted by relevance.
 * The matching track for each category is prioritized first with a "★ Recommended" badge.
 */
export const RECOMMENDED_TRACKS: Record<CardCategory, string[]> = {
  wedding: ['wedding', 'love', 'anniversary'],
  birthday: ['birthday', 'invitation', 'greetings'],
  anniversary: ['anniversary', 'love', 'wedding'],
  graduation: ['graduation', 'invitation'],
  invitation: ['invitation', 'birthday', 'graduation'],
  love: ['love', 'wedding', 'anniversary'],
  greetings: ['greetings', 'birthday', 'invitation'],
};

/**
 * Smart defaults applied when a category is selected in Step 1.
 * Provides ambient effect and default background audio track for each category.
 */
export const CATEGORY_DEFAULTS: Record<CardCategory, { ambientEffect: AmbientEffectType; audioTrackId: string }> = {
  wedding:     { ambientEffect: 'petals',         audioTrackId: 'wedding' },
  birthday:    { ambientEffect: 'confetti-float',  audioTrackId: 'birthday' },
  anniversary: { ambientEffect: 'hearts',         audioTrackId: 'anniversary' },
  graduation:  { ambientEffect: 'starlight',       audioTrackId: 'graduation' },
  invitation:  { ambientEffect: 'golden-sparkles', audioTrackId: 'invitation' },
  love:        { ambientEffect: 'hearts-petals',  audioTrackId: 'love' },
  greetings:   { ambientEffect: 'lanterns',       audioTrackId: 'greetings' },
};

/**
 * Legacy track ID fallback map to prevent 404 network warnings on existing saved cards.
 */
export const LEGACY_TRACK_MAP: Record<string, string> = {
  'warm-piano': 'wedding',
  'gentle-strings': 'anniversary',
  'upbeat-celebration': 'birthday',
  'soft-acoustic': 'love',
  'dreamy-bells': 'invitation',
  'jazzy-lounge': 'love',
  'cinematic-warmth': 'graduation',
  'tropical-vibes': 'invitation',
};

/**
 * Get audio tracks filtered by card category.
 */
export function getTracksForCategory(category: CardCategory): AudioTrack[] {
  return AUDIO_TRACKS.filter((track) => track.category.includes(category));
}

/**
 * Get audio tracks sorted with recommended ones first for a given category.
 * Returns all tracks, with recommended ones at the top.
 */
export function getRecommendedTracksForCategory(category: CardCategory): { track: AudioTrack; isRecommended: boolean }[] {
  const recommendedIds = RECOMMENDED_TRACKS[category] || [];
  const recommended = recommendedIds
    .map((id) => AUDIO_TRACKS.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => ({ track: t!, isRecommended: true }));

  const remainingIds = new Set(recommendedIds);
  const rest = AUDIO_TRACKS
    .filter((t) => !remainingIds.has(t.id))
    .map((t) => ({ track: t, isRecommended: false }));

  return [...recommended, ...rest];
}

/**
 * Get a track by its ID (transparently handles legacy presets).
 */
export function getTrackById(id: string): AudioTrack | undefined {
  const normalizedId = LEGACY_TRACK_MAP[id] || id;
  return AUDIO_TRACKS.find((track) => track.id === normalizedId);
}

/**
 * Get the public URL for an audio track file.
 */
export function getTrackUrl(filename: string): string {
  return `/audio/${filename}`;
}
