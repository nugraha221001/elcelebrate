import type { AudioTrack, CardCategory } from './types';

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
    category: ['birthday', 'anniversary'],
  },
  {
    id: 'gentle-strings',
    name: 'Gentle Strings',
    filename: 'gentle-strings.opus',
    duration: 50,
    mood: 'Elegant & emotional',
    category: ['anniversary', 'graduation'],
  },
  {
    id: 'upbeat-celebration',
    name: 'Upbeat Celebration',
    filename: 'upbeat-celebration.opus',
    duration: 40,
    mood: 'Joyful & energetic',
    category: ['birthday', 'graduation', 'invitation'],
  },
  {
    id: 'soft-acoustic',
    name: 'Soft Acoustic',
    filename: 'soft-acoustic.opus',
    duration: 55,
    mood: 'Warm & intimate',
    category: ['birthday', 'anniversary'],
  },
  {
    id: 'dreamy-bells',
    name: 'Dreamy Bells',
    filename: 'dreamy-bells.opus',
    duration: 42,
    mood: 'Magical & whimsical',
    category: ['birthday', 'invitation'],
  },
  {
    id: 'jazzy-lounge',
    name: 'Jazzy Lounge',
    filename: 'jazzy-lounge.opus',
    duration: 48,
    mood: 'Sophisticated & smooth',
    category: ['anniversary', 'invitation'],
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
 * Get audio tracks filtered by card category.
 */
export function getTracksForCategory(category: CardCategory): AudioTrack[] {
  return AUDIO_TRACKS.filter((track) => track.category.includes(category));
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
