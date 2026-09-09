# Audio Assets Directory

This directory hosts curated local background audio loops for ElCelebrate digital cards.

## Expected Audio Tracks

The application catalog in `src/lib/audio-tracks.ts` maps to the following 8 filenames:

| Filename | Track Name | Mood | Categories |
| :--- | :--- | :--- | :--- |
| `warm-piano.opus` | Warm Piano | Gentle & heartfelt | birthday, anniversary |
| `gentle-strings.opus` | Gentle Strings | Elegant & emotional | anniversary, graduation |
| `upbeat-celebration.opus` | Upbeat Celebration | Joyful & energetic | birthday, graduation, invitation |
| `soft-acoustic.opus` | Soft Acoustic | Warm & intimate | birthday, anniversary |
| `dreamy-bells.opus` | Dreamy Bells | Magical & whimsical | birthday, invitation |
| `jazzy-lounge.opus` | Jazzy Lounge | Sophisticated & smooth | anniversary, invitation |
| `cinematic-warmth.opus` | Cinematic Warmth | Grand & inspiring | graduation, anniversary |
| `tropical-vibes.opus` | Tropical Vibes | Fun & breezy | birthday, invitation |

## File Specifications & Encoding Guidelines

- **Container & Codec:** Ogg container with Opus codec (`.opus`) or WebM (`.webm`).
- **Bitrate:** 64 kbps – 96 kbps VBR (Variable Bit Rate) stereo or mono.
- **Duration:** 35 – 60 seconds (seamlessly loopable instrumental).
- **Target File Size:** `< 250 KB` per file for instant zero-latency loading.

## Procedural Web Audio Fallback

If any `.opus` audio file is missing or returns HTTP 404, ElCelebrate's client-side procedural Web Audio synthesizer (`src/lib/synth-audio.ts`) automatically generates real-time harmonic loops for each mood preset using browser `AudioContext`. Cards will never suffer broken audio or playback crashes.
