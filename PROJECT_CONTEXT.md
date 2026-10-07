# ElCelebrate — Project Context & Single Source of Truth

This document serves as the authoritative, exhaustive technical reference for the ElCelebrate repository. It captures the architecture, database schema, active features, and API contracts.

## 1. System Architecture & Tech Stack Matrix

- **Framework**: Astro v5 SSR
- **Runtime**: Cloudflare Pages / Workers V8 Runtime Adapter (`@astrojs/cloudflare` v12.6.13)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` v4.0.0)
- **Database & Auth**: Supabase PostgreSQL with SSR integrations (`@supabase/ssr` v0.5.0, `@supabase/supabase-js` v2.49.0)
- **Storage Architecture**: Cloudflare R2 via AWS SDK (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` v3.700.0)
- **UI Components**: `lucide-astro` for iconography.
- **Client Utilities**: `browser-image-compression` (for client-side WebP transcoding), `canvas-confetti`.
- **Language**: TypeScript (`strict` mode enabled).

---

## 2. Database, RLS, & Storage Architecture

### Database Schema (PostgreSQL)

- **`profiles`**: 
  - `id` (uuid, PK, references `auth.users`), `email` (text), `full_name` (text), `created_at` (timestamptz). 
  - Auto-created via trigger on `auth.users` insert.
- **`cards`**: 
  - `id` (uuid, PK), `user_id` (uuid, FK), `slug` (text, unique), `category` (text, CHECK: 'birthday', 'anniversary', 'graduation', 'invitation', 'wedding', 'love', 'greetings'), `recipient_name` (text), `sender_name` (text), `message` (text), `event_date` (date), `theme_config` (jsonb), `media_urls` (text[]), `is_published` (boolean), `created_at` (timestamptz).
- **`wishes`**: 
  - `id` (uuid, PK), `card_id` (uuid, FK), `sender_name` (text), `message` (text), `created_at` (timestamptz).

### Row Level Security (RLS) Policies
- **Profiles**: Users can view and update their own profiles.
- **Cards**: Public can view `is_published = true`. Authenticated users have full CRUD on their own `user_id`.
- **Wishes**: Public can view and insert if the associated card is published. Only card owners can delete wishes on their cards.

### `theme_config` (JSONB) Structure
- **Visuals**: `primaryColor`, `secondaryColor`, `backgroundColor`, `fontFamily`, `backgroundPattern`, `cornerOrnament`, `ambientEffect`.
- **Audio**: `audioTrackId`, `externalAudioUrl`, `customAudioUrl`, `audioStartTime`.
- **Category Specific**: `unboxStyle`, `unboxingStyle` (e.g. 'gate-split'), `weddingData` (bride/groom details, timeline, dresscode, digital envelope), `passcode`, `interactiveConfession`, `occasion`, `signature`, `ageMilestone`, `anniversaryMilestone`, etc.

### R2 Storage Architecture
- **Presigned PUT Workflow**: Clients request a single-use presigned URL (`/api/storage/presigned-url`) to upload directly to R2, eliminating server bandwidth costs.
- **Client-Side WebP Compression**: Before upload, `browser-image-compression` runs via WebWorker to transcode images to WebP and scale them down (strictly `<=200KB`).
- **Streaming Proxy**: `/api/media/[...path]` acts as an internal reverse proxy fetching via `GetObjectCommand` to bypass ISP DNS/SSL blocks on public `*.r2.dev` domains in Indonesia.
- **Automated Garbage Collection**: Orphaned assets in R2 are automatically cleaned up when a card's media is overwritten or the card is deleted.

---

## 3. Complete Feature & Category Staging Matrix

### Core Design System
- **Colors**: "Midnight Velvet & Champagne Gold" luxury palette tokens. Includes 24 curated mobile color swatches with direct HEX input capability.
- **Patterns**: Cultural seamless SVG patterns (kawung, truntum, megamendung, songket, parang, etc.).
- **Ornaments**: Corner ornaments for localized flair (botanical, keraton, pucukrebung, gunungan, etc.).

### Studio Wizard & Live Preview (`src/pages/dashboard/create.astro`)
- **Mobile Anti-Clipping**: Form workflows ensure no UI clipping via specific padding (`pb-36`).
- **Media Management**: Touchscreen-optimized photo delete badges.
- **Preview Frame**: 1:1 WYSIWYG Live Preview frame with nested corner ornament isolation (`#preview-corner-frame`).
- **Navigation Logic**: Post-submission gracefully redirects the active window to `/dashboard` while opening the live published card in a `_blank` tab.

### Category Implementations (`src/pages/c/[slug].astro`)
- **`wedding`**: 11-slot photo schema, 3 luxury unboxing animations (`gate-split`, `curtain-lift`, `wax-seal`), Sacred Quote presets, Love Story Timeline, 1-tap Google Calendar integration, dynamic 1-5 dresscode chips, and Turut Mengundang block.
- **`birthday`**: Interactive candle blow widget, tilted Polaroid photo stack, age milestone badge.
- **`anniversary`**: Live relationship counter, vintage filmstrip photo gallery.
- **`graduation`**: Royal diploma framing, animated mortarboard toss.
- **`invitation`**: VIP ticket pass styling, calendar integration, symmetrical RSVP toggles.
- **`love`**: 4-digit PIN passcode gate, runaway dodging "Nggak" button, celebratory confetti.
- **`greetings`**: Indonesian holiday presets, thematic ambient particle bindings, family signature badge.

### Universal Share Engine
- **WhatsApp Integration**: Category-aware WhatsApp message templates generated dynamically on the dashboard (`src/pages/dashboard/index.astro`).
- **Localized Query Params**: URL supports `?to=` parameter to personalize the recipient's name gracefully.

### Dual-Engine Audio
- **Primary**: 7 category-curated Opus audio tracks in `public/audio/`, featuring `audioStartTime` offset looping capabilities.
- **Fallback**: Procedural Web Audio synthesizer fallback implemented in `src/lib/synth-audio.ts` for instant playback when the network fails.

---

## 4. API & Routing Contract

All API endpoints are located in `src/pages/api/` and utilize standard Astro endpoint configurations (`.ts`).

- `GET /api/auth/callback` - OAuth/Magic Link callback validation.
- `POST /api/auth/login` - Standard email/password login.
- `POST /api/auth/logout` - Terminates session.
- `POST /api/auth/magic-link` - Issues Supabase OTP magic link.
- `POST /api/auth/signup` - Registers a new user.
- `GET/POST /api/cards/index` - List authenticated user's cards or create a new card.
- `GET/PUT/DELETE /api/cards/[id]` - CRUD operations for a specific card (triggers R2 asset deletion on `DELETE`).
- `GET /api/cards/by-slug/[slug]` - Public endpoint for resolving slug to card configuration.
- `GET /api/media/[...path]` - R2 asset proxy stream.
- `PUT /api/profile/update` - Update profile data (e.g. `full_name`, `avatar_url`).
- `POST /api/storage/presigned-url` - Generates AWS S3-compatible presigned PUT URLs for R2 bucket.
- `GET/POST/DELETE /api/wishes/[cardId]` - Guestbook interactions.

---

## 5. Active Environment Variables & Bindings

- **`SUPABASE_URL`**: Supabase instance URL.
- **`SUPABASE_ANON_KEY`**: Supabase anonymous key (safe for public clients).
- **`R2_ACCOUNT_ID`**: Cloudflare account ID for R2.
- **`R2_ACCESS_KEY_ID`**: R2 API access key.
- **`R2_SECRET_ACCESS_KEY`**: R2 API secret.
- **`R2_BUCKET_NAME`**: Destination bucket (e.g., `elcelebrate-assets`).
- **`R2_PUBLIC_DOMAIN`**: Optional domain for asset resolution.

*(Note: Bindings for Cloudflare Workers/Pages are mapped via `wrangler.toml` if utilizing Cloudflare-specific `env` variables, though the S3 client uses explicit env variables here).*

---

## 6. Pending Roadmap & Backlog

- **QRIS Payment Gateway Integration**: For automated digital envelope or premium feature unlocks.
- **Admin Role Schema**: Addition of RBAC to manage overarching platform metrics, featured cards, and abuse reports.
