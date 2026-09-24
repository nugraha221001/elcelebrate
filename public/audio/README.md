# Audio Assets Directory

This directory hosts curated local background audio loops for ElCelebrate digital cards.

## Expected Audio Tracks

The application catalog in `src/lib/audio-tracks.ts` maps to the following 7 category-curated tracks:

| Filename | Track ID | Track Name | Mood | Default Category |
| :--- | :--- | :--- | :--- | :--- |
| `wedding.opus` | `wedding` | Sacred Romance | Sacred & Romantic | `wedding` |
| `birthday.opus` | `birthday` | Birthday Joy | Joyful & Festive | `birthday` |
| `anniversary.opus` | `anniversary` | Sweet Milestone | Warm & Nostalgic | `anniversary` |
| `graduation.opus` | `graduation` | Triumphant Horizon | Inspiring & Grand | `graduation` |
| `invitation.opus` | `invitation` | Celebration Vibe | Upbeat & Welcoming | `invitation` |
| `love.opus` | `love` | Heartfelt Melody | Intimate & Tender | `love` |
| `greetings.opus` | `greetings` | Warm Wishes | Peaceful & Cordial | `greetings` |

## File Specifications & Encoding Guidelines

- **Container & Codec:** Ogg container with Opus codec (`.opus`) or WebM (`.webm`).
- **Bitrate:** 64 kbps – 96 kbps VBR (Variable Bit Rate) stereo or mono.
- **Duration:** 35 – 60 seconds (seamlessly loopable instrumental).
- **Target File Size:** `< 250 KB` per file for instant zero-latency loading.

## Procedural Web Audio Fallback

If any `.opus` audio file is missing or returns HTTP 404, ElCelebrate's client-side procedural Web Audio synthesizer (`src/lib/synth-audio.ts`) automatically generates real-time harmonic loops for each mood preset using browser `AudioContext`. Cards will never suffer broken audio or playback crashes.
