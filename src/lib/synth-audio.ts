/**
 * ElCelebrate — Procedural Web Audio Synthesizer
 *
 * Lightweight, zero-dependency procedural music generator running natively
 * in client browsers via Web Audio API. Provides continuous celebratory loop
 * motifs mapped to the 8 curated audio tracks as a resilient fallback
 * when local .opus files are absent or network streams fail.
 */

export interface NoteEvent {
  note: number; // MIDI note number (e.g. 60 = C4)
  duration: number; // Duration in seconds
  gain?: number; // Relative velocity/gain (0 to 1)
  instrument?: 'piano' | 'bells' | 'strings' | 'pluck' | 'bass';
}

export interface StepEvent {
  notes: NoteEvent[];
}

export interface TrackPreset {
  tempo: number; // BPM
  stepsPerBeat: number; // usually 2 (8th notes) or 4 (16th notes)
  filterCutoff: number; // Hz
  delayTime: number; // seconds
  delayFeedback: number; // 0 to 1
  pattern: StepEvent[];
}

// Convert MIDI note number to frequency in Hertz
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ═════════════════════════════════════════════════════════════
// Curated Procedural Track Presets
// ═════════════════════════════════════════════════════════════

const PRESETS: Record<string, TrackPreset> = {
  // 1. Warm Piano: Warm arpeggio chords in C Major / A Minor with soft Rhodes timbre
  'warm-piano': {
    tempo: 104,
    stepsPerBeat: 2,
    filterCutoff: 1800,
    delayTime: 0.28,
    delayFeedback: 0.32,
    pattern: [
      // Bar 1: C Major (C - G - C - E - G - E - C - G)
      { notes: [{ note: 48, duration: 1.2, gain: 0.5, instrument: 'bass' }, { note: 60, duration: 0.6, gain: 0.6, instrument: 'piano' }] },
      { notes: [{ note: 67, duration: 0.5, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 72, duration: 0.6, gain: 0.55, instrument: 'piano' }] },
      { notes: [{ note: 76, duration: 0.7, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 79, duration: 0.8, gain: 0.6, instrument: 'piano' }] },
      { notes: [{ note: 76, duration: 0.5, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 72, duration: 0.5, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 67, duration: 0.5, gain: 0.4, instrument: 'piano' }] },

      // Bar 2: A Minor (A - E - A - C - E - C - A - E)
      { notes: [{ note: 45, duration: 1.2, gain: 0.5, instrument: 'bass' }, { note: 57, duration: 0.6, gain: 0.6, instrument: 'piano' }] },
      { notes: [{ note: 64, duration: 0.5, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 69, duration: 0.6, gain: 0.55, instrument: 'piano' }] },
      { notes: [{ note: 72, duration: 0.7, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 76, duration: 0.8, gain: 0.6, instrument: 'piano' }] },
      { notes: [{ note: 72, duration: 0.5, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 69, duration: 0.5, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 64, duration: 0.5, gain: 0.4, instrument: 'piano' }] },

      // Bar 3: F Major (F - C - F - A - C - A - F - C)
      { notes: [{ note: 41, duration: 1.2, gain: 0.5, instrument: 'bass' }, { note: 53, duration: 0.6, gain: 0.6, instrument: 'piano' }] },
      { notes: [{ note: 60, duration: 0.5, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 65, duration: 0.6, gain: 0.55, instrument: 'piano' }] },
      { notes: [{ note: 69, duration: 0.7, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 72, duration: 0.8, gain: 0.6, instrument: 'piano' }] },
      { notes: [{ note: 69, duration: 0.5, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 65, duration: 0.5, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 60, duration: 0.5, gain: 0.4, instrument: 'piano' }] },

      // Bar 4: G Major (G - D - G - B - D - B - G - D)
      { notes: [{ note: 43, duration: 1.2, gain: 0.5, instrument: 'bass' }, { note: 55, duration: 0.6, gain: 0.6, instrument: 'piano' }] },
      { notes: [{ note: 62, duration: 0.5, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 67, duration: 0.6, gain: 0.55, instrument: 'piano' }] },
      { notes: [{ note: 71, duration: 0.7, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 74, duration: 0.8, gain: 0.6, instrument: 'piano' }] },
      { notes: [{ note: 71, duration: 0.5, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 67, duration: 0.5, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 62, duration: 0.5, gain: 0.4, instrument: 'piano' }] },
    ],
  },

  // 2. Gentle Strings: Lush swelling orchestral pads with slow attack and emotional chords
  'gentle-strings': {
    tempo: 72,
    stepsPerBeat: 1,
    filterCutoff: 1400,
    delayTime: 0.4,
    delayFeedback: 0.35,
    pattern: [
      // Chord 1: D Major (D3, A3, F#4, A4)
      { notes: [
        { note: 50, duration: 2.8, gain: 0.4, instrument: 'bass' },
        { note: 57, duration: 2.8, gain: 0.35, instrument: 'strings' },
        { note: 66, duration: 2.8, gain: 0.45, instrument: 'strings' },
        { note: 69, duration: 2.8, gain: 0.4, instrument: 'strings' },
      ] },
      { notes: [] },
      { notes: [{ note: 74, duration: 1.6, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 73, duration: 1.2, gain: 0.4, instrument: 'piano' }] },

      // Chord 2: B Minor (B2, F#3, D4, F#4)
      { notes: [
        { note: 47, duration: 2.8, gain: 0.4, instrument: 'bass' },
        { note: 54, duration: 2.8, gain: 0.35, instrument: 'strings' },
        { note: 62, duration: 2.8, gain: 0.45, instrument: 'strings' },
        { note: 66, duration: 2.8, gain: 0.4, instrument: 'strings' },
      ] },
      { notes: [] },
      { notes: [{ note: 71, duration: 1.6, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 69, duration: 1.2, gain: 0.4, instrument: 'piano' }] },

      // Chord 3: G Major (G2, D3, B3, D4)
      { notes: [
        { note: 43, duration: 2.8, gain: 0.4, instrument: 'bass' },
        { note: 50, duration: 2.8, gain: 0.35, instrument: 'strings' },
        { note: 59, duration: 2.8, gain: 0.45, instrument: 'strings' },
        { note: 62, duration: 2.8, gain: 0.4, instrument: 'strings' },
      ] },
      { notes: [] },
      { notes: [{ note: 67, duration: 1.6, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 69, duration: 1.2, gain: 0.45, instrument: 'piano' }] },

      // Chord 4: A Major (A2, E3, C#4, E4)
      { notes: [
        { note: 45, duration: 2.8, gain: 0.4, instrument: 'bass' },
        { note: 52, duration: 2.8, gain: 0.35, instrument: 'strings' },
        { note: 61, duration: 2.8, gain: 0.45, instrument: 'strings' },
        { note: 64, duration: 2.8, gain: 0.4, instrument: 'strings' },
      ] },
      { notes: [] },
      { notes: [{ note: 71, duration: 1.4, gain: 0.5, instrument: 'piano' }] },
      { notes: [{ note: 73, duration: 1.4, gain: 0.5, instrument: 'piano' }] },
    ],
  },

  // 3. Upbeat Celebration: Cheerful, bouncing melody in G Major with rhythmic bass
  'upbeat-celebration': {
    tempo: 124,
    stepsPerBeat: 2,
    filterCutoff: 2400,
    delayTime: 0.24,
    delayFeedback: 0.28,
    pattern: [
      { notes: [{ note: 43, duration: 0.4, gain: 0.6, instrument: 'bass' }, { note: 71, duration: 0.4, gain: 0.6, instrument: 'bells' }] },
      { notes: [{ note: 74, duration: 0.35, gain: 0.5, instrument: 'bells' }] },
      { notes: [{ note: 50, duration: 0.4, gain: 0.45, instrument: 'bass' }, { note: 79, duration: 0.45, gain: 0.65, instrument: 'bells' }] },
      { notes: [{ note: 74, duration: 0.35, gain: 0.5, instrument: 'bells' }] },
      { notes: [{ note: 47, duration: 0.4, gain: 0.5, instrument: 'bass' }, { note: 76, duration: 0.4, gain: 0.6, instrument: 'bells' }] },
      { notes: [{ note: 74, duration: 0.35, gain: 0.5, instrument: 'bells' }] },
      { notes: [{ note: 50, duration: 0.4, gain: 0.45, instrument: 'bass' }, { note: 71, duration: 0.5, gain: 0.6, instrument: 'bells' }] },
      { notes: [{ note: 69, duration: 0.35, gain: 0.5, instrument: 'bells' }] },

      { notes: [{ note: 40, duration: 0.4, gain: 0.6, instrument: 'bass' }, { note: 67, duration: 0.4, gain: 0.6, instrument: 'bells' }] },
      { notes: [{ note: 69, duration: 0.35, gain: 0.5, instrument: 'bells' }] },
      { notes: [{ note: 47, duration: 0.4, gain: 0.45, instrument: 'bass' }, { note: 71, duration: 0.45, gain: 0.65, instrument: 'bells' }] },
      { notes: [{ note: 74, duration: 0.35, gain: 0.5, instrument: 'bells' }] },
      { notes: [{ note: 48, duration: 0.4, gain: 0.55, instrument: 'bass' }, { note: 76, duration: 0.4, gain: 0.6, instrument: 'bells' }] },
      { notes: [{ note: 79, duration: 0.4, gain: 0.65, instrument: 'bells' }] },
      { notes: [{ note: 50, duration: 0.4, gain: 0.5, instrument: 'bass' }, { note: 81, duration: 0.5, gain: 0.7, instrument: 'bells' }] },
      { notes: [{ note: 79, duration: 0.4, gain: 0.6, instrument: 'bells' }] },
    ],
  },

  // 4. Soft Acoustic: Warm fingerpicked acoustic / harp arpeggio
  'soft-acoustic': {
    tempo: 96,
    stepsPerBeat: 2,
    filterCutoff: 1700,
    delayTime: 0.31,
    delayFeedback: 0.3,
    pattern: [
      // E major picking
      { notes: [{ note: 40, duration: 1.0, gain: 0.55, instrument: 'bass' }, { note: 64, duration: 0.5, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 71, duration: 0.5, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 76, duration: 0.6, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 80, duration: 0.6, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 76, duration: 0.5, gain: 0.45, instrument: 'pluck' }] },
      { notes: [{ note: 71, duration: 0.5, gain: 0.45, instrument: 'pluck' }] },

      // C# minor picking
      { notes: [{ note: 49, duration: 1.0, gain: 0.55, instrument: 'bass' }, { note: 64, duration: 0.5, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 68, duration: 0.5, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 73, duration: 0.6, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 76, duration: 0.6, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 73, duration: 0.5, gain: 0.45, instrument: 'pluck' }] },
      { notes: [{ note: 68, duration: 0.5, gain: 0.45, instrument: 'pluck' }] },

      // A major picking
      { notes: [{ note: 45, duration: 1.0, gain: 0.55, instrument: 'bass' }, { note: 61, duration: 0.5, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 64, duration: 0.5, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 69, duration: 0.6, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 73, duration: 0.6, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 69, duration: 0.5, gain: 0.45, instrument: 'pluck' }] },
      { notes: [{ note: 64, duration: 0.5, gain: 0.45, instrument: 'pluck' }] },

      // B major picking
      { notes: [{ note: 47, duration: 1.0, gain: 0.55, instrument: 'bass' }, { note: 63, duration: 0.5, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 66, duration: 0.5, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 71, duration: 0.6, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 75, duration: 0.6, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 71, duration: 0.5, gain: 0.45, instrument: 'pluck' }] },
      { notes: [{ note: 66, duration: 0.5, gain: 0.45, instrument: 'pluck' }] },
    ],
  },

  // 5. Dreamy Bells: Whimsical music box / kalimba with sparkling high pentatonic chimes
  'dreamy-bells': {
    tempo: 108,
    stepsPerBeat: 2,
    filterCutoff: 2600,
    delayTime: 0.35,
    delayFeedback: 0.38,
    pattern: [
      // Eb Major Pentatonic music box chime
      { notes: [{ note: 75, duration: 0.8, gain: 0.6, instrument: 'bells' }, { note: 51, duration: 1.2, gain: 0.4, instrument: 'bass' }] },
      { notes: [{ note: 79, duration: 0.6, gain: 0.5, instrument: 'bells' }] },
      { notes: [{ note: 82, duration: 0.7, gain: 0.55, instrument: 'bells' }] },
      { notes: [{ note: 87, duration: 0.9, gain: 0.65, instrument: 'bells' }] },
      { notes: [{ note: 82, duration: 0.5, gain: 0.45, instrument: 'bells' }] },
      { notes: [{ note: 79, duration: 0.5, gain: 0.45, instrument: 'bells' }] },
      { notes: [{ note: 84, duration: 0.7, gain: 0.55, instrument: 'bells' }] },
      { notes: [{ note: 82, duration: 0.6, gain: 0.5, instrument: 'bells' }] },

      { notes: [{ note: 70, duration: 0.8, gain: 0.6, instrument: 'bells' }, { note: 46, duration: 1.2, gain: 0.4, instrument: 'bass' }] },
      { notes: [{ note: 75, duration: 0.6, gain: 0.5, instrument: 'bells' }] },
      { notes: [{ note: 79, duration: 0.7, gain: 0.55, instrument: 'bells' }] },
      { notes: [{ note: 82, duration: 0.9, gain: 0.65, instrument: 'bells' }] },
      { notes: [{ note: 87, duration: 0.8, gain: 0.6, instrument: 'bells' }] },
      { notes: [{ note: 86, duration: 0.7, gain: 0.55, instrument: 'bells' }] },
      { notes: [{ note: 82, duration: 0.6, gain: 0.5, instrument: 'bells' }] },
      { notes: [{ note: 79, duration: 0.5, gain: 0.45, instrument: 'bells' }] },
    ],
  },

  // 6. Jazzy Lounge: Mellow Rhodes 7th chords with warm smooth progression
  'jazzy-lounge': {
    tempo: 92,
    stepsPerBeat: 2,
    filterCutoff: 1500,
    delayTime: 0.33,
    delayFeedback: 0.32,
    pattern: [
      // Fmaj9 chord
      { notes: [
        { note: 41, duration: 1.6, gain: 0.5, instrument: 'bass' },
        { note: 65, duration: 1.2, gain: 0.5, instrument: 'piano' },
        { note: 69, duration: 1.2, gain: 0.45, instrument: 'piano' },
        { note: 72, duration: 1.2, gain: 0.45, instrument: 'piano' },
        { note: 76, duration: 1.2, gain: 0.5, instrument: 'piano' },
      ] },
      { notes: [] },
      { notes: [{ note: 79, duration: 0.6, gain: 0.4, instrument: 'piano' }] },
      { notes: [{ note: 76, duration: 0.6, gain: 0.4, instrument: 'piano' }] },

      // Dm9 chord
      { notes: [
        { note: 38, duration: 1.6, gain: 0.5, instrument: 'bass' },
        { note: 62, duration: 1.2, gain: 0.5, instrument: 'piano' },
        { note: 65, duration: 1.2, gain: 0.45, instrument: 'piano' },
        { note: 69, duration: 1.2, gain: 0.45, instrument: 'piano' },
        { note: 72, duration: 1.2, gain: 0.5, instrument: 'piano' },
      ] },
      { notes: [] },
      { notes: [{ note: 74, duration: 0.6, gain: 0.4, instrument: 'piano' }] },
      { notes: [{ note: 72, duration: 0.6, gain: 0.4, instrument: 'piano' }] },

      // Gm9 chord
      { notes: [
        { note: 43, duration: 1.6, gain: 0.5, instrument: 'bass' },
        { note: 67, duration: 1.2, gain: 0.5, instrument: 'piano' },
        { note: 70, duration: 1.2, gain: 0.45, instrument: 'piano' },
        { note: 74, duration: 1.2, gain: 0.45, instrument: 'piano' },
        { note: 77, duration: 1.2, gain: 0.5, instrument: 'piano' },
      ] },
      { notes: [] },
      { notes: [{ note: 79, duration: 0.6, gain: 0.4, instrument: 'piano' }] },
      { notes: [{ note: 77, duration: 0.6, gain: 0.4, instrument: 'piano' }] },

      // C13 / C7alt chord
      { notes: [
        { note: 36, duration: 1.6, gain: 0.5, instrument: 'bass' },
        { note: 64, duration: 1.2, gain: 0.5, instrument: 'piano' },
        { note: 70, duration: 1.2, gain: 0.45, instrument: 'piano' },
        { note: 74, duration: 1.2, gain: 0.45, instrument: 'piano' },
        { note: 81, duration: 1.2, gain: 0.5, instrument: 'piano' },
      ] },
      { notes: [] },
      { notes: [{ note: 79, duration: 0.6, gain: 0.45, instrument: 'piano' }] },
      { notes: [{ note: 76, duration: 0.6, gain: 0.45, instrument: 'piano' }] },
    ],
  },

  // 7. Cinematic Warmth: Grand, inspiring progression with deep bass and ambient pads
  'cinematic-warmth': {
    tempo: 78,
    stepsPerBeat: 1,
    filterCutoff: 1600,
    delayTime: 0.38,
    delayFeedback: 0.36,
    pattern: [
      { notes: [
        { note: 46, duration: 3.2, gain: 0.45, instrument: 'bass' },
        { note: 58, duration: 3.0, gain: 0.35, instrument: 'strings' },
        { note: 65, duration: 3.0, gain: 0.4, instrument: 'strings' },
        { note: 70, duration: 1.8, gain: 0.5, instrument: 'bells' },
      ] },
      { notes: [{ note: 74, duration: 1.2, gain: 0.45, instrument: 'bells' }] },
      { notes: [{ note: 77, duration: 1.6, gain: 0.55, instrument: 'bells' }] },
      { notes: [{ note: 74, duration: 1.2, gain: 0.45, instrument: 'bells' }] },

      { notes: [
        { note: 43, duration: 3.2, gain: 0.45, instrument: 'bass' },
        { note: 55, duration: 3.0, gain: 0.35, instrument: 'strings' },
        { note: 62, duration: 3.0, gain: 0.4, instrument: 'strings' },
        { note: 67, duration: 1.8, gain: 0.5, instrument: 'bells' },
      ] },
      { notes: [{ note: 70, duration: 1.2, gain: 0.45, instrument: 'bells' }] },
      { notes: [{ note: 74, duration: 1.6, gain: 0.55, instrument: 'bells' }] },
      { notes: [{ note: 72, duration: 1.2, gain: 0.45, instrument: 'bells' }] },

      { notes: [
        { note: 39, duration: 3.2, gain: 0.45, instrument: 'bass' },
        { note: 51, duration: 3.0, gain: 0.35, instrument: 'strings' },
        { note: 58, duration: 3.0, gain: 0.4, instrument: 'strings' },
        { note: 63, duration: 1.8, gain: 0.5, instrument: 'bells' },
      ] },
      { notes: [{ note: 67, duration: 1.2, gain: 0.45, instrument: 'bells' }] },
      { notes: [{ note: 70, duration: 1.6, gain: 0.55, instrument: 'bells' }] },
      { notes: [{ note: 72, duration: 1.2, gain: 0.45, instrument: 'bells' }] },

      { notes: [
        { note: 41, duration: 3.2, gain: 0.45, instrument: 'bass' },
        { note: 53, duration: 3.0, gain: 0.35, instrument: 'strings' },
        { note: 60, duration: 3.0, gain: 0.4, instrument: 'strings' },
        { note: 65, duration: 1.8, gain: 0.5, instrument: 'bells' },
      ] },
      { notes: [{ note: 69, duration: 1.2, gain: 0.45, instrument: 'bells' }] },
      { notes: [{ note: 72, duration: 1.6, gain: 0.55, instrument: 'bells' }] },
      { notes: [{ note: 70, duration: 1.2, gain: 0.45, instrument: 'bells' }] },
    ],
  },

  // 8. Tropical Vibes: Fun & breezy syncopated marimba / island pentatonic motif
  'tropical-vibes': {
    tempo: 116,
    stepsPerBeat: 2,
    filterCutoff: 2500,
    delayTime: 0.26,
    delayFeedback: 0.3,
    pattern: [
      { notes: [{ note: 48, duration: 0.35, gain: 0.6, instrument: 'bass' }, { note: 72, duration: 0.35, gain: 0.6, instrument: 'pluck' }] },
      { notes: [{ note: 76, duration: 0.3, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 79, duration: 0.35, gain: 0.6, instrument: 'pluck' }] },
      { notes: [{ note: 81, duration: 0.3, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 55, duration: 0.35, gain: 0.5, instrument: 'bass' }, { note: 79, duration: 0.35, gain: 0.6, instrument: 'pluck' }] },
      { notes: [{ note: 76, duration: 0.3, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 72, duration: 0.35, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 74, duration: 0.3, gain: 0.5, instrument: 'pluck' }] },

      { notes: [{ note: 45, duration: 0.35, gain: 0.6, instrument: 'bass' }, { note: 76, duration: 0.35, gain: 0.6, instrument: 'pluck' }] },
      { notes: [{ note: 79, duration: 0.3, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 81, duration: 0.35, gain: 0.65, instrument: 'pluck' }] },
      { notes: [{ note: 84, duration: 0.3, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 52, duration: 0.35, gain: 0.5, instrument: 'bass' }, { note: 81, duration: 0.35, gain: 0.6, instrument: 'pluck' }] },
      { notes: [{ note: 79, duration: 0.3, gain: 0.5, instrument: 'pluck' }] },
      { notes: [{ note: 76, duration: 0.35, gain: 0.55, instrument: 'pluck' }] },
      { notes: [{ note: 74, duration: 0.3, gain: 0.5, instrument: 'pluck' }] },
    ],
  },
};

// Aliases for 7 category-curated Opus tracks
PRESETS['wedding'] = PRESETS['gentle-strings'] || PRESETS['warm-piano'];
PRESETS['birthday'] = PRESETS['upbeat-celebration'];
PRESETS['anniversary'] = PRESETS['warm-piano'];
PRESETS['graduation'] = PRESETS['cinematic-warmth'];
PRESETS['invitation'] = PRESETS['tropical-vibes'];
PRESETS['love'] = PRESETS['soft-acoustic'];
PRESETS['greetings'] = PRESETS['dreamy-bells'];

// ═════════════════════════════════════════════════════════════
// Synth Engine Singleton State
// ═════════════════════════════════════════════════════════════

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let delayNode: DelayNode | null = null;
let feedbackGain: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;

let isPlaying = false;
let currentTrackId: string | null = null;
let currentVolume = 0.35;

let schedulerTimer: number | null = null;
let nextNoteTime = 0;
let currentStepIndex = 0;
let activePreset: TrackPreset | null = null;

/**
 * Check if the browser supports Web Audio API.
 */
export function isAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

/**
 * Returns true if synth is currently actively playing.
 */
export function isPlayingSynth(): boolean {
  return isPlaying;
}

/**
 * Returns the currently playing track ID.
 */
export function getActiveTrackId(): string | null {
  return currentTrackId;
}

/**
 * Lazily initialize the Web Audio context and ambient spatial effect nodes.
 */
function initAudioGraph(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }

  if (!masterGain && audioCtx) {
    // Master volume
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);

    // Warm master filter
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2000, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(0.7, audioCtx.currentTime);

    // Spatial delay bus
    delayNode = audioCtx.createDelay();
    delayNode.delayTime.setValueAtTime(0.3, audioCtx.currentTime);

    feedbackGain = audioCtx.createGain();
    feedbackGain.gain.setValueAtTime(0.3, audioCtx.currentTime);

    const delayFilter = audioCtx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1400, audioCtx.currentTime);

    // Graph routing:
    // Filter -> MasterGain -> Destination
    filterNode.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Filter -> Delay -> DelayFilter -> Feedback -> Delay
    filterNode.connect(delayNode);
    delayNode.connect(delayFilter);
    delayFilter.connect(feedbackGain);
    feedbackGain.connect(delayNode);

    // Delay -> MasterGain
    delayNode.connect(masterGain);
  }

  return audioCtx;
}

/**
 * Synthesize an individual instrument note at specified Web Audio time.
 */
function playNoteVoice(ctx: AudioContext, note: NoteEvent, time: number) {
  if (!filterNode) return;

  const freq = midiToFreq(note.note);
  const duration = Math.max(note.duration, 0.1);
  const velocity = note.gain ?? 0.5;
  const instrument = note.instrument ?? 'piano';

  const voiceGain = ctx.createGain();
  voiceGain.connect(filterNode);

  if (instrument === 'strings') {
    // Lush string pad: dual detuned sawtooths through lowpass filter
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.004, time); // +7 cents detune

    const oscFilter = ctx.createBiquadFilter();
    oscFilter.type = 'lowpass';
    oscFilter.frequency.setValueAtTime(800, time);
    oscFilter.frequency.linearRampToValueAtTime(1200, time + duration * 0.5);

    osc1.connect(oscFilter);
    osc2.connect(oscFilter);
    oscFilter.connect(voiceGain);

    // Slow swell ADSR envelope
    const attack = 0.35;
    const release = 0.8;
    voiceGain.gain.setValueAtTime(0.0001, time);
    voiceGain.gain.linearRampToValueAtTime(velocity * 0.28, time + attack);
    voiceGain.gain.setValueAtTime(velocity * 0.25, time + duration - release);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.05);
    osc2.stop(time + duration + 0.05);
  } else if (instrument === 'bells') {
    // Music box / kalimba: sine wave with sparkling harmonic overtone
    const fundamental = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    fundamental.type = 'sine';
    harmonic.type = 'sine';
    fundamental.frequency.setValueAtTime(freq, time);
    harmonic.frequency.setValueAtTime(freq * 3.01, time);

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.18, time);

    fundamental.connect(voiceGain);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(voiceGain);

    // Percussive bell decay
    const attack = 0.006;
    voiceGain.gain.setValueAtTime(0.0001, time);
    voiceGain.gain.linearRampToValueAtTime(velocity * 0.38, time + attack);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    fundamental.start(time);
    harmonic.start(time);
    fundamental.stop(time + duration + 0.02);
    harmonic.stop(time + duration + 0.02);
  } else if (instrument === 'bass') {
    // Warm low foundation note
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.connect(voiceGain);

    voiceGain.gain.setValueAtTime(0.0001, time);
    voiceGain.gain.linearRampToValueAtTime(velocity * 0.45, time + 0.03);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  } else if (instrument === 'pluck') {
    // Crisp acoustic pluck
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.connect(voiceGain);

    voiceGain.gain.setValueAtTime(0.0001, time);
    voiceGain.gain.linearRampToValueAtTime(velocity * 0.4, time + 0.01);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  } else {
    // Default Warm Piano: triangle + gentle sub-sine
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    osc.type = 'triangle';
    sub.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    sub.frequency.setValueAtTime(freq * 0.5, time);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.2, time);

    osc.connect(voiceGain);
    sub.connect(subGain);
    subGain.connect(voiceGain);

    voiceGain.gain.setValueAtTime(0.0001, time);
    voiceGain.gain.linearRampToValueAtTime(velocity * 0.36, time + 0.02);
    voiceGain.gain.exponentialRampToValueAtTime(velocity * 0.12, time + 0.3);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.start(time);
    sub.start(time);
    osc.stop(time + duration + 0.02);
    sub.stop(time + duration + 0.02);
  }
}

/**
 * Clock scheduler: schedules upcoming notes with precise Web Audio lookahead.
 */
function scheduleNotes() {
  if (!audioCtx || !isPlaying || !activePreset) return;

  const lookaheadSeconds = 0.12;
  const secondsPerBeat = 60.0 / activePreset.tempo;
  const stepDuration = secondsPerBeat / activePreset.stepsPerBeat;

  while (nextNoteTime < audioCtx.currentTime + lookaheadSeconds) {
    const step = activePreset.pattern[currentStepIndex];
    if (step && step.notes.length > 0) {
      for (const note of step.notes) {
        playNoteVoice(audioCtx, note, nextNoteTime);
      }
    }

    nextNoteTime += stepDuration;
    currentStepIndex = (currentStepIndex + 1) % activePreset.pattern.length;
  }
}

/**
 * Start procedural synthesis for a given track ID and volume.
 * Safe to call after user gesture (e.g. unbox tap or audio toggle).
 */
export async function startSynth(trackId?: string, volume?: number): Promise<boolean> {
  if (!isAvailable()) return false;

  const ctx = initAudioGraph();
  if (!ctx || !masterGain) return false;

  // Respect browser autoplay policy: resume AudioContext on user gesture
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }

  // Pick preset by track ID or fallback to wedding / warm-piano
  const selectedKey = trackId && PRESETS[trackId] ? trackId : (PRESETS['wedding'] ? 'wedding' : 'warm-piano');
  activePreset = PRESETS[selectedKey];
  currentTrackId = selectedKey;

  if (typeof volume === 'number') {
    currentVolume = Math.max(0, Math.min(1, volume));
  }

  // Adjust parameters for this preset
  if (filterNode && delayNode && feedbackGain) {
    filterNode.frequency.setTargetAtTime(activePreset.filterCutoff, ctx.currentTime, 0.05);
    delayNode.delayTime.setTargetAtTime(activePreset.delayTime, ctx.currentTime, 0.05);
    feedbackGain.gain.setTargetAtTime(activePreset.delayFeedback, ctx.currentTime, 0.05);
  }

  // Smooth fade-in
  masterGain.gain.cancelScheduledValues(ctx.currentTime);
  masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(currentVolume, ctx.currentTime + 0.2);

  isPlaying = true;
  currentStepIndex = 0;
  nextNoteTime = ctx.currentTime + 0.05;

  if (schedulerTimer !== null) {
    window.clearInterval(schedulerTimer);
  }

  // 25ms timer for lookahead scheduling
  schedulerTimer = window.setInterval(scheduleNotes, 25);
  return true;
}

/**
 * Stop procedural synth playback with a smooth fade-out.
 */
export function stopSynth(): void {
  if (schedulerTimer !== null) {
    window.clearInterval(schedulerTimer);
    schedulerTimer = null;
  }

  isPlaying = false;

  if (audioCtx && masterGain) {
    // Smooth ramp-down to eliminate pops
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
  }
}

/**
 * Set synth master volume (0.0 to 1.0).
 */
export function setVolume(volume: number): void {
  currentVolume = Math.max(0, Math.min(1, volume));
  if (audioCtx && masterGain && isPlaying) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(currentVolume, audioCtx.currentTime + 0.05);
  }
}
