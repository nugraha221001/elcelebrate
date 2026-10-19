# ElCelebrate — Authoritative Project Context & Single Source of Truth

> **Authoritative Technical Documentation**  
> **Repository**: `nugraha221001/elcelebrate` (`celebrateloop`)  
> **Target Runtime**: Cloudflare Pages / Workers V8 Isolate (`@astrojs/cloudflare`)  
> **Version**: 1.0.0 Production Release  
> **Last Updated**: 2026-10-19

---

## 1. System Architecture & Tech Stack Matrix

ElCelebrate is a zero-cost-tier, high-aesthetic digital celebration and stationery platform engineered for the Indonesian market. Built on modern web standards with strict zero-placeholder guarantees, it delivers an editorial boutique user experience across mobile and desktop viewports.

### Core Architecture Matrix

| Component | Technology | Version | Purpose & Technical Specifications |
| :--- | :--- | :--- | :--- |
| **Framework** | Astro SSR | `^5.2.0` | Output mode `server`, hybrid static rendering for static assets, SSR routes for auth, dashboard, API, and dynamic cards. |
| **Runtime Adapter** | `@astrojs/cloudflare` | `^12.6.13` | Cloudflare Workers / Pages V8 isolate runtime, image service set to `passthrough`. |
| **Styling & Design Tokens** | Tailwind CSS v4 | `^4.0.0` | Vite plugin `@tailwindcss/vite` (`^4.0.0`), `@theme` design tokens in `src/styles/global.css`, "Midnight Velvet & Champagne Gold" palette tokens. |
| **Vector Iconography** | `lucide-astro` | `^0.460.0` | Strict Zero Emoji Policy for landing/auth interfaces; uses refined 1.5-stroke vector medallions (`border border-[#f5c563]/25 bg-[#f5c563]/5 text-[#f5c563]`). |
| **Typography** | Google Fonts | Web CDN | Headings: *Cormorant Garamond* (300, 400, 600, 700 italic) & *Playfair Display* (400, 600, 700 italic). Body: *Inter* system sans-serif. |
| **Database & Auth** | Supabase PostgreSQL | `^2.49.0` | PostgreSQL with Row Level Security (RLS), auth cookies managed via `@supabase/ssr` (`^0.5.0`), database triggers on `auth.users`. |
| **Object Storage** | Cloudflare R2 | S3 API | Managed via `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` (`^3.700.0`). Zero egress fees, direct browser-to-R2 presigned PUT uploads. |
| **Media Processing** | `browser-image-compression` | `^2.0.2` | Client-side Web Worker image transcoding to WebP format, hard capped at `<=200KB` per photo before upload. |
| **Visual FX** | `canvas-confetti` | `^1.9.3` | Dynamic confetti engine for celebration bursts, candle-blow moments, and unboxing reveals. |
| **Audio Engine** | Dual-Engine | Native | **Primary**: 7 category-curated Opus audio tracks in `public/audio/`.<br>**Fallback**: Procedural Web Audio synthesizer (`src/lib/synth-audio.ts`). |
| **Type Safety** | TypeScript | `^5.7.0` | Strict mode enabled (`astro check` validated with 0 errors, 0 warnings). |

---

## 2. Database Schema, RLS, & Storage Architecture

### 2.1 Database Schema (PostgreSQL)

The database schema is structured into three primary tables under the `public` schema with foreign key cascades and security definer triggers.

```
auth.users (Supabase Managed)
    │
    ├── (1:1 ON DELETE CASCADE) ──> public.profiles
    │
    └── (1:N ON DELETE CASCADE) ──> public.cards
                                        │
                                        └── (1:N ON DELETE CASCADE) ──> public.wishes
```

#### Table: `public.profiles`
Stores user profile information, automatically populated on user registration via the `handle_new_user` PostgreSQL trigger.
*Note: `bio` is intentionally omitted to minimize Supabase storage footprint.*

```sql
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text not null default '',
  avatar_url   text,
  phone_number text,
  created_at   timestamptz not null default now()
);
```

#### Table: `public.cards`
Core table containing card metadata, visual configurations, and multimedia references. Enforces a 7-category check constraint.

```sql
create table public.cards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  slug            text unique not null,
  category        text not null check (
                    category in ('birthday', 'anniversary', 'graduation', 'invitation', 'wedding', 'love', 'greetings')
                  ),
  recipient_name  text not null,
  sender_name     text not null default '',
  message         text not null default '',
  event_date      date,
  theme_config    jsonb not null default '{}'::jsonb,
  media_urls      text[] default '{}',
  is_published    boolean default true,
  created_at      timestamptz not null default now()
);

create index idx_cards_slug on public.cards(slug);
create index idx_cards_user_id on public.cards(user_id);
```

#### Table: `public.wishes`
Public guestbook and RSVP blessings associated with specific published cards.

```sql
create table public.wishes (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards(id) on delete cascade,
  sender_name text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index idx_wishes_card_id on public.wishes(card_id);
```

---

### 2.2 Row Level Security (RLS) Policies

All tables have RLS enabled (`alter table ... enable row level security;`).

#### `public.profiles` Policies
- **Read**: `Users can view own profile`: `(auth.uid() = id)`
- **Update**: `Users can update own profile`: `(auth.uid() = id)`

#### `public.cards` Policies
- **Public Read**: `Public can view published cards`: `(is_published = true)`
- **Owner Read**: `Owners can view all own cards`: `(auth.uid() = user_id)`
- **Create**: `Authenticated users can create cards`: `(auth.uid() = user_id)` with check `(auth.uid() = user_id)`
- **Update**: `Owners can update own cards`: `(auth.uid() = user_id)`
- **Delete**: `Owners can delete own cards`: `(auth.uid() = user_id)`

#### `public.wishes` Policies
- **Public Read**: `Public can view wishes for published cards`:
  ```sql
  exists (
    select 1 from public.cards
    where cards.id = wishes.card_id
    and cards.is_published = true
  )
  ```
- **Public Insert**: `Anyone can submit wishes`:
  ```sql
  exists (
    select 1 from public.cards
    where cards.id = wishes.card_id
    and cards.is_published = true
  )
  ```
- **Owner Delete**: `Card owners can delete wishes`:
  ```sql
  exists (
    select 1 from public.cards
    where cards.id = wishes.card_id
    and cards.user_id = auth.uid()
  )
  ```

---

### 2.3 `theme_config` JSONB Structure

The `theme_config` column in `public.cards` houses visual, audio, and category-specific configuration payloads:

```typescript
export interface ThemeConfig {
  // Visual Tokens
  primaryColor: string;          // Hex code (e.g. '#f5c563')
  secondaryColor: string;        // Hex code (e.g. '#d4af37')
  backgroundColor: string;       // Hex code (e.g. '#0f0d15')
  fontFamily: 'serif' | 'sans' | 'handwritten' | 'display';
  backgroundPattern: 'none' | 'kawung' | 'truntum' | 'megamendung' | 'songket' | 'pucukrebung' | 'parang' | 'tenun' | 'damask' | 'arabesque' | 'constellation';
  cornerOrnament: 'none' | 'botanical' | 'keraton' | 'melati' | 'pucukrebung' | 'artdeco' | 'baroque' | 'diamond-frame' | 'celestial' | 'gunungan' | 'mandala';
  ambientEffect: 'petals' | 'golden-sparkles' | 'hearts' | 'confetti-float' | 'starlight' | 'lanterns' | 'butterflies' | 'bokeh' | 'sparklers' | 'snowfall' | 'hearts-petals' | 'jasmine' | 'beras-kuning' | 'keraton-glow' | 'fireflies' | 'champagne-dust' | 'prism-glow' | 'sakura-drift' | 'floating-pearls' | 'aurora-mist' | 'none';

  // Audio Tokens
  audioTrackId: string | null;   // e.g. 'wedding', 'birthday', 'anniversary'
  externalAudioUrl: string | null;
  customAudioUrl?: string | null;
  audioStartTime?: number;       // Offset in seconds

  // Unboxing Styles
  unboxStyle: 'envelope' | 'giftbox' | 'ribbon';
  unboxingStyle?: 'gate-split' | 'curtain-lift' | 'wax-seal' | 'giftbox-pop' | 'ribbon-untie' | 'wax-seal-letter' | 'folded-note' | 'diploma-scroll' | 'folder-reveal' | 'vip-sleeve' | 'gold-envelope' | 'jewelry-box' | 'bifold-card' | 'festive-envelope';

  // Category Specific Payloads
  weddingData?: {
    bride: { fullName: string; nickname: string; parents: string; };
    groom: { fullName: string; nickname: string; parents: string; };
    akadEvent: { date: string; timeStart: string; timeEnd: string; venue: string; address: string; mapsUrl: string; };
    receptionEvent: { date: string; timeStart: string; timeEnd: string; venue: string; address: string; mapsUrl: string; };
    unduhMantu?: { enabled: boolean; title?: string; date?: string; time?: string; locationName?: string; address?: string; mapUrl?: string; };
    digitalEnvelope: { bankName: string; accountNumber: string; accountHolder: string; };
    loveStory: string;
    openingGreeting: string;
    sacredQuote?: { enabled?: boolean; quote?: string; source?: string; };
    loveStoryTimeline?: Array<{ year?: string; title?: string; story?: string; }>;
    dresscode?: { enabled?: boolean; colors?: string[]; note?: string; };
    turutMengundang?: string;
  };
  passcode?: string;                          // 4-digit PIN for Love cards
  interactiveConfession?: {                   // Love confession module
    enabled: boolean;
    prompt?: string;
    yesText?: string;
    noText?: string;
  };
  occasion?: string;                          // Greetings occasion preset
  signature?: string;                         // Greetings sender signature
  ageMilestone?: string;                      // Birthday age (e.g., '25th')
  anniversaryMilestone?: string;              // Anniversary years (e.g., '5th')
  degreeMajor?: string;                       // Graduation major
  schoolCampus?: string;                      // Graduation institution
  invitationEventType?: string;               // Invitation event title
  invitationTime?: string;                    // Invitation time range
  invitationVenue?: string;                   // Invitation location
}
```

---

### 2.4 Storage Architecture (Cloudflare R2)

1. **Direct Browser-to-R2 Presigned PUT Upload**:
   - Client requests presigned URL from `POST /api/storage/presigned-url` with `{ filename, contentType: 'image/webp', folder: 'cards' | 'avatars' | 'audio' }`.
   - Endpoint generates single-use signed S3 URL via `@aws-sdk/s3-request-presigner` (valid for 300 seconds).
   - Browser uploads compressed binary directly to Cloudflare R2 bucket with zero server bandwidth load.

2. **Client-Side Image Optimization**:
   - `browser-image-compression` runs via Web Worker before upload.
   - Enforces format `image/webp`, max dimension `1920px`, and max file size `<=200KB`.

3. **Edge Streaming Reverse Proxy (`/api/media/[...path]`)**:
   - Bypasses Indonesian ISP DNS and SNI filtering blocks against public `*.r2.dev` domains.
   - Worker fetches object via `GetObjectCommand`, streams the body directly as a `ReadableStream`, and attaches immutable edge caching headers (`Cache-Control: public, max-age=31536000, immutable`).

4. **Automated Garbage Collection & Cascading Asset Purge**:
   - **Card Updates (`PATCH /api/cards/[id]`)**: Automatically diffs old and new `media_urls` and `customAudioUrl`, issuing `DeleteObjectCommand` for orphaned assets.
   - **Card Deletion (`DELETE /api/cards/[id]`)**: Purges all card photos and custom audio from R2 before deleting the database row.
   - **Account Deletion (`POST /api/profile/delete-account`)**: Sweeps all user cards, collects all R2 keys, and executes batch deletion via `DeleteObjectsCommand` (in chunks of 1000 with individual fallback), followed by database cleanup.

---

## 3. Complete Feature Matrix & Category Staging

### 3.1 The 7 Boutique Celebration Categories

| Category | Unboxing Animation Styles | Signature Interactive Features | Audio Default |
| :--- | :--- | :--- | :--- |
| **Wedding** | Gate Split (`gate-split`), Royal Curtain (`curtain-lift`), Wax Seal (`wax-seal`). | Royal filigree divider, double-bordered quote card, 1-tap Google Calendar CTA, dresscode color palette, Keraton cultural crest, Turut Mengundang block, Love Story timeline, and digital envelope copy bank. | `wedding.opus` (*Sacred Romance*) |
| **Birthday** | Gift Box Pop (`giftbox-pop`), Ribbon Untie (`ribbon-untie`), Envelope. | Interactive candle blow widget (with smoke dispersal and 3-second relight cooldown), confetti celebration burst, Polaroid stack deck with 3D shuffle fling animation and lightbox, age milestone badge. | `birthday.opus` (*Birthday Joy*) |
| **Anniversary** | Ribbon Untie (`ribbon-untie`), Wax Seal Letter (`wax-seal-letter`), Envelope. | Real-time live relationship counter (years, months, days, hours, mins, secs), vintage filmstrip photo gallery, milestone badge. | `anniversary.opus` (*Sweet Milestone*) |
| **Graduation** | Diploma Scroll (`diploma-scroll`), Folder Reveal (`folder-reveal`), Envelope. | Royal diploma framing, animated mortarboard toss, degree & campus insignia, celebration photo gallery. | `graduation.opus` (*Triumphant Horizon*) |
| **Invitation** | VIP Sleeve (`vip-sleeve`), Gold Envelope (`gold-envelope`), Envelope. | VIP Ticket Pass layout with perforated edge and barcode, 1-tap Google Calendar CTA, Google Maps direction CTA, symmetrical RSVP attending/declining buttons. | `invitation.opus` (*Celebration Vibe*) |
| **Love** | Wax Seal Letter (`wax-seal-letter`), Folded Note (`folded-note`), Envelope. | 4-digit PIN passcode gate, runaway dodging "Nggak" button, romantic confession response with celebratory confetti. | `love.opus` (*Heartfelt Melody*) |
| **Greetings** | Festive Envelope (`festive-envelope`), Bifold Card (`bifold-card`), Envelope. | Indonesian holiday presets (Idul Fitri, Natal, Imlek, Idul Adha, Waisak, Nyepi, etc.), thematic ambient particles, family signature block. | `greetings.opus` (*Warm Wishes*) |

---

### 3.2 Studio Wizard & Live Preview (`src/pages/dashboard/create.astro`)

The card creation wizard implements a 5-step guided flow:
- **Step 1: Pilih Kategori** — 7 category selection cards with thematic micro-accents.
- **Step 2: Tema & Visual** — 24 curated mobile color swatches, direct HEX input, cultural patterns (kawung, truntum, songket, etc.), corner ornaments, ambient effects, and unboxing animation selector.
- **Step 3: Foto & Musik** — Drag-and-drop photo uploader with client-side WebP compression (`<=200KB`), touchscreen delete badges, and audio track selector.
- **Step 4: Detail & Pesan** — Category-specific input forms (bride/groom fields, event schedule, dresscode, quote, timeline, passcode, confession prompt).
- **Step 5: Tinjau & Terbitkan** — Summary review, slug validator, and instant publish toggle.

**Key Technical Protections in Studio Wizard:**
- **Mobile Anti-Clipping**: Form containers enforce `pb-36 sm:pb-24` padding so floating step navigation bars never obscure form inputs or action buttons on mobile screens.
- **1:1 Phone Live Preview Frame**: Features an isolated stationary `#preview-corner-frame` overlay sibling to prevent corner ornaments from scrolling out of view during scrollable preview interactions.
- **Touchscreen Photo Management**: Photos display visible red delete badges (`w-6 h-6 rounded-full bg-red-600/90 text-white`) optimized for touch targets.
- **Post-Submission Behavior**: Smoothly redirects the creator to `/dashboard` while opening the published card in a `_blank` tab.

---

### 3.3 Dual-Engine Audio System

1. **Opus Audio Engine (`public/audio/`)**:
   - 7 curated royalty-free tracks pre-transcoded to Opus format (`<2MB` each):
     - `wedding.opus` (58s, Sacred & Romantic)
     - `birthday.opus` (44s, Joyful & Festive)
     - `anniversary.opus` (50s, Warm & Nostalgic)
     - `graduation.opus` (60s, Inspiring & Grand)
     - `invitation.opus` (48s, Upbeat & Welcoming)
     - `love.opus` (54s, Intimate & Tender)
     - `greetings.opus` (46s, Peaceful & Cordial)
   - Supports `audioStartTime` offset looping.

2. **Web Audio Procedural Synthesizer Fallback (`src/lib/synth-audio.ts`)**:
   - Zero-dependency client-side procedural music generator.
   - Runs natively on Web Audio API (`AudioContext`, `BiquadFilterNode`, `DelayNode`, `GainNode`).
   - Implements custom synthesis profiles for:
     - `piano`: Warm acoustic piano via triangle + sub-sine wave with ADSR envelope.
     - `strings`: Dual detuned sawtooth waves with lowpass filter sweep.
     - `bells`: Sine fundamental with 3.01x harmonic overtone for music box/kalimba chime.
     - `pluck`: Fast acoustic plucking envelope.
     - `bass`: Smooth low foundation tone.
   - Activates automatically if local `.opus` network streams fail or offline.

---

### 3.4 Universal WhatsApp Share Engine (`src/pages/dashboard/index.astro`)

Generates category-personalized WhatsApp share links with URL query parameters:
- **Personalized Recipient URL**: Appends `?to=${encodeURIComponent(guestName)}` to customize greeting headers.
- **Salutation Engine**: Supports formal Indonesian titles (`Bapak`, `Ibu`, `Saudara/i`, `Teman`).
- **One-Click Share CTA**: Pre-populates ready-to-send invitation text with card URL and personalized greeting.

---

## 4. API & Routing Contract

All API endpoints are implemented as Astro server endpoints (`.ts`) located in `src/pages/api/`.

### 4.1 Authentication Endpoints (`/api/auth/`)

| Method | Endpoint | Request Payload | Response Codes | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/callback` | Query: `code`, `next` | `302 Redirect` | Validates Supabase OAuth or magic link exchange code and redirects to dashboard. |
| `POST` | `/api/auth/login` | `{ email, password }` | `200`, `400` | Authenticates user credentials, sets HTTP-only session cookies. |
| `POST` | `/api/auth/signup` | `{ email, password, fullName }` | `200`, `400` | Registers user in `auth.users`, triggers profile creation in `public.profiles`. |
| `POST` | `/api/auth/magic-link` | `{ email }` | `200`, `400` | Sends passwordless OTP magic link to user email. |
| `POST` | `/api/auth/logout` | Form submit / empty body | `302 Redirect` | Clears Supabase auth cookies and redirects to `/signin`. |

---

### 4.2 Cards Management Endpoints (`/api/cards/`)

| Method | Endpoint | Request Payload | Response Codes | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/cards` | None (Auth cookie required) | `200`, `401` | Returns all cards created by the authenticated user (`{ cards: Card[] }`). |
| `POST` | `/api/cards` | `{ category, recipient_name, sender_name, message, event_date, theme_config, media_urls, is_published, slug? }` | `201`, `400`, `401`, `500` | Creates a new card record. Auto-generates unique slug if omitted. |
| `GET` | `/api/cards/[id]` | None (Auth cookie required) | `200`, `401`, `404` | Fetches a single card owned by the user. |
| `PATCH` | `/api/cards/[id]` | Partial `<Card>` payload (e.g. `{ is_published }` or full update) | `200`, `400`, `401`, `404`, `500` | Updates card fields. Automatically sweeps orphaned R2 assets when media URLs are replaced. |
| `DELETE` | `/api/cards/[id]` | None (Auth cookie required) | `200`, `401`, `404`, `500` | Purges all associated R2 assets (photos and audio) and deletes card record from database. |
| `GET` | `/api/cards/by-slug/[slug]` | None (Public) | `200`, `404` | Public resolver returning published card payload by slug. |

---

### 4.3 Profile & Account Endpoints (`/api/profile/`)

| Method | Endpoint | Request Payload | Response Codes | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PUT` | `/api/profile/update` | `{ full_name, avatar_url, phone_number }` | `200`, `400`, `401`, `500` | Validates `full_name` `<=60` chars and `phone_number` 9-16 numeric chars. Purges orphaned avatar from R2 if changed. Updates profile and auth metadata. |
| `POST` | `/api/profile/delete-account` | None (Auth cookie required) | `200`, `401`, `500` | Permanent account purge: Sweeps all user R2 assets in chunks of 1000, deletes DB wishes, deletes cards, deletes profile, deletes `auth.users` record via admin service client, and signs out. |

---

### 4.4 Storage & Media Proxy Endpoints

| Method | Endpoint | Request Payload | Response Codes | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/storage/presigned-url` | `{ filename, contentType, folder: 'cards' \| 'avatars' \| 'audio' }` | `200`, `400`, `401`, `500` | Generates single-use AWS S3 presigned PUT URL for direct client-to-R2 upload (`{ uploadUrl, publicUrl, key }`). |
| `GET` | `/api/media/[...path]` | None (Public) | `200`, `304`, `400`, `404`, `500` | Internal reverse proxy streaming R2 assets with immutable caching, bypassing Indonesian ISP DNS/SNI blocks on `*.r2.dev`. |

---

### 4.5 Wishes & Guestbook Endpoints (`/api/wishes/`)

| Method | Endpoint | Request Payload | Response Codes | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/wishes/[cardId]` | None (Public) | `200`, `400`, `500` | Returns list of wishes for a card sorted by `created_at DESC` (`{ wishes: Wish[] }`). |
| `POST` | `/api/wishes/[cardId]` | `{ sender_name, message }` | `201`, `400`, `403`, `500` | Adds guest wish to published card. Blocked if card is unpublished. |
| `DELETE` | `/api/wishes/[cardId]?wishId=...` | None (Card owner required) | `200`, `400`, `401`, `403`, `500` | Deletes a wish; only allowed by the owner of the card. |

---

## 5. Environment Variables & Bindings Contract

Runtime environment variables are configured in `.env` (local development) and Cloudflare Pages/Workers environment variables (production).

| Variable Name | Required | Client/Server | Description & Example |
| :--- | :--- | :--- | :--- |
| `PUBLIC_SUPABASE_URL` | Yes | Universal | Supabase project URL (`https://<project-ref>.supabase.co`). |
| `PUBLIC_SUPABASE_ANON_KEY` | Yes | Universal | Supabase public anonymous API key for browser client and RLS queries. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-Only | Supabase admin service role key for administrative sweeps and cascade account deletion. |
| `R2_ACCOUNT_ID` | Yes | Server-Only | Cloudflare Account ID for R2 S3 endpoint generation. |
| `R2_ACCESS_KEY_ID` | Yes | Server-Only | Cloudflare R2 S3 API access key credential. |
| `R2_SECRET_ACCESS_KEY` | Yes | Server-Only | Cloudflare R2 S3 API secret access key credential. |
| `R2_BUCKET_NAME` | Yes | Server-Only | Destination Cloudflare R2 bucket name (`celebrateloop-assets`). |
| `R2_PUBLIC_DOMAIN` | Optional | Server-Only | Public R2 domain endpoint (`https://pub-<hash>.r2.dev`). |

---

## 6. Current Production Status & Pending Backlog

### 6.1 Current Production Status
- **Type Checking (`astro check`)**: **100% Clean Pass** (50 files inspected, 0 errors, 0 warnings).
- **Production Build (`astro build`)**: **Clean Pass** (`Server built in 10.42s`, 62 client chunks transformed).
- **Zero Emoji Policy**: Enforced across landing page (`src/pages/index.astro`), authentication pages (`/signin`, `/signup`), layout footers (`src/components/layout/Footer.astro`), and dashboard empty states. Replaced with `lucide-astro` vector medallions.
- **Indonesian Business-Grade Copy**: All navigation, error toasts, wizards, and modals standardized to professional Indonesian, retaining selective industry terms (*"Live Preview"*, *"VIP Pass"*, *"Google Calendar"*, *"Polaroid"*, *"Wax Seal"*).
- **Interactive Safeguards**:
  - `getBoundingClientRect` calls on birthday candle blows safely wrapped with try-catch fallbacks to `{ originX: 0.5, originY: 0.6 }`.
  - Confetti triggers utilize fail-safe global runner without detached canvas exceptions.
  - Delete confirmation input normalizes typed text to uppercase real-time, unlocking deletion exclusively on `"HAPUS"`.

### 6.2 Active Backlog
1. **Dynamic QRIS Payment Gateway Integration**:
   - `transactions` database table with foreign keys to `cards` and `profiles`.
   - Webhook listener endpoint (`/api/payments/webhook`) supporting Midtrans / Xendit QRIS payloads for digital envelope monetary contributions.
2. **Custom User Audio Upload**:
   - Direct R2 upload for custom MP3/Opus background music (hard capped at `<=3MB`).
   - Client-side audio duration detector before presigned URL request.
3. **Admin RBAC Role Schema**:
   - Role column on `public.profiles` (`role: 'admin' | 'user'`).
   - Administrative dashboard for platform analytics, card moderation, and abuse reports.

---

## 7. Canonical Showcase Architecture ("Raden & Arum")

To provide an immediate, zero-latency showcase of ElCelebrate's editorial boutique capabilities for both prospective users and authenticated creators, the platform includes a canonical read-only demonstrator:

### 7.1 Shared Canonical Showcase Data (`src/lib/showcase-wedding.ts`)
- **`SHOWCASE_WEDDING_CARD`**: Strongly-typed `Readonly<Card>` instance strictly matching `Card` and `ThemeConfig` interfaces in `src/lib/types.ts`:
  - `slug`: `'demo-wedding'`, `category`: `'wedding'`, `recipient_name`: `'Raden & Arum'`, `event_date`: `'2026-10-24'`.
  - Palette: `#f5c563` (primary), `#d4af37` (secondary), `#0f0d15` (background), `fontFamily: 'serif'`.
  - Ornaments: `backgroundPattern: 'kawung'`, `cornerOrnament: 'keraton'`, `ambientEffect: 'champagne-dust'`, `unboxingStyle: 'wax-seal'`, `audioTrackId: 'wedding'`.
  - Lineage & Ceremony: Complete bride & groom details, sacred quote (QS. Ar-Rum: 21), 3-step Love Story timeline, Akad & Resepsi schedules with Google Maps coordinates, 4-swatch dresscode palette, BCA digital envelope, and Keraton Yogyakarta Turut Mengundang block.
  - Photography: 11 curated, lightweight Unsplash WebP image URLs (`?auto=format&fit=crop&w=600&q=75`).
- **`SHOWCASE_WEDDING_WISHES`**: 3 canonical sample wishes with timestamps and attendance status.
- **`formatGoogleCalendarUrl`**: Formats Google Calendar URLs for 1-tap calendar addition.

### 7.2 Hero Interactive Studio Preview (`src/pages/index.astro`)
- Anchored under `#studio-preview` / `#hero-showcase-frame` inside the Hero split grid:
  - **Cover**: Dual gate split doors (`#hero-gate-left`, `#hero-gate-right`), cover typography (`Raden & Arum • 24.10.2026`), R&A wax seal medallion (`#hero-wax-seal`), and interactive unbox CTA.
  - **Unbox Sequence**: Smooth gate separation, seal expansion/fade, automated optional background audio playback (`/audio/wedding.opus`), top action bar (`#showcase-top-bar`) with sound equalizer bars, mute/unmute toggle, and "Tutup Segel" reset action.
  - **Scrollable Showcase Viewport (`#showcase-scroll-container`)**:
    1. Hero couple banner with royal filigree gold divider.
    2. Double-bordered sacred quote card (QS. Ar-Rum: 21).
    3. Bride & Groom circular portraits with lineage (`#preview-mempelai`).
    4. Live countdown 4-grid timer + Akad & Resepsi event cards with Google Calendar and Maps links (`#preview-acara`).
    5. 3-step vertical Love Story timeline.
    6. Lazy-loaded prewedding gallery grid (`#preview-galeri`).
    7. 4-swatch dresscode palette card.
    8. Digital envelope card with 1-tap copy (`#preview-amplop`).
    9. Turut Mengundang block with royal styling.
    10. Interactive Guestbook / RSVP simulation (`#preview-doa`) with Hadir/Berhalangan toggle and instant client-side wish submission prepending.
    11. Sticky floating navigation pill inside phone (`Mempelai`, `Acara`, `Galeri`, `Amplop`, `Doa`) with smooth in-phone scrolling.
    12. Bottom CTA link to full-screen invitation (`/c/demo-wedding`).

### 7.3 Dashboard Showcase & Guest Mode (`src/pages/dashboard/index.astro`)
- **Guest Mode (`!user`)**: Eliminates hard redirects when unauthenticated visitors access the dashboard; displays a "Mode Pratinjau Tamu" alert banner and the "Contoh Undangan Studio: Raden & Arum" showcase card with "Lihat Undangan Utuh", "Simulasi Studio", and "Gunakan Konsep Ini".
- **Authenticated Mode (`user`)**: Renders user's Supabase cards alongside a permanent, non-deletable "Contoh Resmi Studio: Raden & Arum" master template card with quick actions: "Lihat Demo Utuh", "Uji Bagikan WA", and "Buat Seperti Ini" (`/dashboard/create?category=wedding`).
- **Zero Database Bloat**: Does not write dummy records to Supabase tables or Cloudflare R2 storage.

### 7.4 Public Route Sync (`/c/demo-wedding` in `src/pages/c/[slug].astro`)
- When `slug === 'demo-wedding'`, directly serves `SHOWCASE_WEDDING_CARD` and `SHOWCASE_WEDDING_WISHES` from memory with 0 database queries.
- Intercepts wish submissions for `showcase-wedding-card-001` with instant client-side prepend and notification toast.

