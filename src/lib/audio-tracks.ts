import type { AudioTrack, CardCategory, AmbientEffectType } from './types';

/**
 * Curated collection of royalty-free instrumental loops.
 * All files are pre-bundled in public/audio/ as Opus format (<250KB each).
 */
export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'warm-piano',
    name: 'Warm Piano',
    filename: 'warm-piano.opus',
    duration: 45,
    mood: 'Gentle & heartfelt',
    category: ['birthday', 'anniversary', 'wedding', 'love', 'greetings'],
  },
  {
    id: 'gentle-strings',
    name: 'Gentle Strings',
    filename: 'gentle-strings.opus',
    duration: 50,
    mood: 'Elegant & emotional',
    category: ['anniversary', 'graduation', 'wedding', 'love'],
  },
  {
    id: 'upbeat-celebration',
    name: 'Upbeat Celebration',
    filename: 'upbeat-celebration.opus',
    duration: 40,
    mood: 'Joyful & energetic',
    category: ['birthday', 'graduation', 'invitation', 'greetings'],
  },
  {
    id: 'soft-acoustic',
    name: 'Soft Acoustic',
    filename: 'soft-acoustic.opus',
    duration: 55,
    mood: 'Warm & intimate',
    category: ['birthday', 'anniversary', 'wedding', 'love', 'greetings'],
  },
  {
    id: 'dreamy-bells',
    name: 'Dreamy Bells',
    filename: 'dreamy-bells.opus',
    duration: 42,
    mood: 'Magical & whimsical',
    category: ['birthday', 'invitation', 'greetings'],
  },
  {
    id: 'jazzy-lounge',
    name: 'Jazzy Lounge',
    filename: 'jazzy-lounge.opus',
    duration: 48,
    mood: 'Sophisticated & smooth',
    category: ['anniversary', 'invitation', 'love'],
  },
  {
    id: 'cinematic-warmth',
    name: 'Cinematic Warmth',
    filename: 'cinematic-warmth.opus',
    duration: 60,
    mood: 'Grand & inspiring',
    category: ['graduation', 'anniversary'],
  },
  {
    id: 'tropical-vibes',
    name: 'Tropical Vibes',
    filename: 'tropical-vibes.opus',
    duration: 38,
    mood: 'Fun & breezy',
    category: ['birthday', 'invitation'],
  },
];

/**
 * Recommended track IDs per category, sorted by relevance.
 * These tracks appear first in the audio selector with a "Recommended" badge.
 */
export const RECOMMENDED_TRACKS: Record<CardCategory, string[]> = {
  wedding: ['warm-piano', 'gentle-strings', 'soft-acoustic', 'jazzy-lounge'],
  anniversary: ['warm-piano', 'soft-acoustic', 'jazzy-lounge', 'gentle-strings'],
  birthday: ['upbeat-celebration', 'dreamy-bells', 'tropical-vibes'],
  graduation: ['cinematic-warmth', 'gentle-strings', 'upbeat-celebration'],
  invitation: ['upbeat-celebration', 'dreamy-bells', 'tropical-vibes'],
  love: ['soft-acoustic', 'warm-piano', 'gentle-strings', 'jazzy-lounge'],
  greetings: ['warm-piano', 'dreamy-bells', 'soft-acoustic', 'upbeat-celebration'],
};

/**
 * Smart defaults applied when a category is selected.
 * Provides ambient effect and recommended audio track for each category.
 */
export const CATEGORY_DEFAULTS: Record<CardCategory, { ambientEffect: AmbientEffectType; audioTrackId: string }> = {
  wedding:     { ambientEffect: 'petals',         audioTrackId: 'warm-piano' },
  anniversary: { ambientEffect: 'hearts',         audioTrackId: 'soft-acoustic' },
  birthday:    { ambientEffect: 'confetti-float',  audioTrackId: 'upbeat-celebration' },
  graduation:  { ambientEffect: 'starlight',       audioTrackId: 'cinematic-warmth' },
  invitation:  { ambientEffect: 'golden-sparkles', audioTrackId: 'upbeat-celebration' },
  love:        { ambientEffect: 'hearts-petals',  audioTrackId: 'soft-acoustic' },
  greetings:   { ambientEffect: 'lanterns',       audioTrackId: 'warm-piano' },
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
 * Get a track by its ID.
 */
export function getTrackById(id: string): AudioTrack | undefined {
  return AUDIO_TRACKS.find((track) => track.id === id);
}

/**
 * Get the public URL for an audio track file.
 */
export function getTrackUrl(filename: string): string {
  return `/audio/${filename}`;
}
