# ElCelebrate — Authoritative Technical Specifications & Project Context

> **Authoritative Technical Documentation & Single Source of Truth**  
> **Repository**: `nugraha221001/elcelebrate` (`celebrateloop`)  
> **Target Runtime**: Cloudflare Pages / Workers V8 Isolate (`@astrojs/cloudflare`)  
> **Framework**: Astro v5 SSR (`output: 'server'`)  
> **Version**: 1.0.0 Production Release  
> **Last Updated**: 2026-11-02  
> **Audit Status**: Verified Clean (`astro check`: 0 errors, 0 warnings across 51 files)

---

## Table of Contents
1. [System Architecture & Tech Stack Matrix](#1-system-architecture--tech-stack-matrix)
2. [Complete UI & Page-by-Page Visual Specification](#2-complete-ui--page-by-page-visual-specification)
   - [2.1 Global Layout & Chrome System](#21-global-layout--chrome-system)
   - [2.2 Homepage (`src/pages/index.astro`)](#22-homepage-srcpagesindexastro)
   - [2.3 Dashboard (`src/pages/dashboard/index.astro`)](#23-dashboard-srcpagesdashboardindexastro)
   - [2.4 Studio Wizard & 1:1 Live Preview (`src/pages/dashboard/create.astro`)](#24-studio-wizard--11-live-preview-srcpagesdashboardcreateastro)
   - [2.5 Public Recipient Card Engine (`src/pages/c/[slug].astro`)](#25-public-recipient-card-engine-srcpagescslugastro)
   - [2.6 Auth Pages (`signin.astro`, `signup.astro`)](#26-auth-pages-srcpagessigninastro-srcpagessignupastro)
   - [2.7 Profile Management (`src/pages/dashboard/profile.astro`)](#27-profile-management-srcpagesdashboardprofileastro)
   - [2.8 Legal Pages (`privacy.astro`, `terms.astro`)](#28-legal-pages-srcpagesprivacyastro-srcpagestermsastro)
3. [Database Schema, RLS, & exact `ThemeConfig` Contract](#3-database-schema-rls--exact-themeconfig-contract)
   - [3.1 PostgreSQL Database Schema](#31-postgresql-database-schema)
   - [3.2 Row Level Security (RLS) Policies](#32-row-level-security-rls-policies)
   - [3.3 Exact TypeScript Interfaces (`src/lib/types.ts`)](#33-exact-typescript-interfaces-srclibtypests)
4. [Storage, Audio & Media Pipeline](#4-storage-audio--media-pipeline)
   - [4.1 Client-Side WebP Compression Pipeline](#41-client-side-webp-compression-pipeline)
   - [4.2 Direct S3/R2 Presigned PUT Upload](#42-direct-s3r2-presigned-put-upload)
   - [4.3 Edge Reverse Streaming Media Proxy (`/api/media/[...path]`)](#43-edge-reverse-streaming-media-proxy-apimediapath)
   - [4.4 Automated Orphaned Asset Garbage Collection](#44-automated-orphaned-asset-garbage-collection)
   - [4.5 Dual-Engine Audio Architecture](#45-dual-engine-audio-architecture)
5. [Complete API & Routing Contract](#5-complete-api--routing-contract)
6. [Environment Variables & Current Roadmap Backlog](#6-environment-variables--current-roadmap-backlog)
   - [6.1 Runtime Environment Variables & Cloudflare Bindings](#61-runtime-environment-variables--cloudflare-bindings)
   - [6.2 Production Roadmap & Active Backlog](#62-production-roadmap--active-backlog)

---

## 1. System Architecture & Tech Stack Matrix

ElCelebrate is an ultra-lightweight, zero-cost-tier, high-aesthetic digital celebration and stationery platform tailored for the Indonesian market. Operating under an editorial luxury stationery aesthetic ("Midnight Velvet & Champagne Gold"), the system guarantees zero placeholders and combines modern serverless edge rendering with client-side media optimization.

### Core Tech Stack Matrix

| Technology | Package / Version | Deployment / Runtime Environment | Architectural Responsibility & Technical Notes |
| :--- | :--- | :--- | :--- |
| **Astro SSR** | `astro@^5.2.0` | Node.js Build / V8 Runtime | Configured with `output: 'server'`. Server-side renders authentication, member dashboard, dynamic card recipient engine, and REST API endpoints. |
| **Cloudflare Adapter** | `@astrojs/cloudflare@^12.6.13` | Cloudflare Pages / Workers V8 Isolate | Executes SSR routes in lightweight V8 isolate containers. Configured with `imageService: 'passthrough'` to prevent remote image fetching overhead. |
| **CSS Framework** | `tailwindcss@^4.0.0`<br>`@tailwindcss/vite@^4.0.0` | Vite Plugin in `astro.config.mjs` | Native Tailwind CSS v4 CSS-first design token configuration via `@theme` in `src/styles/global.css`. Eliminates legacy `tailwind.config.js`. |
| **Iconography** | `lucide-astro@^0.460.0` | Universal Component Library | **Strict Zero Emoji Policy** on landing, dashboard, and auth UI chrome. All system icons use SVG 1.5-stroke vector medallions. |
| **Typography** | Google Fonts | Web CDN via `<link rel="stylesheet">` | Primary Serif: *Playfair Display* & *Cormorant Garamond*. Primary Sans: *Inter*. Display: *Outfit*. Monospace: *JetBrains Mono*. |
| **Database & Auth** | `@supabase/ssr@^0.5.0`<br>`@supabase/supabase-js@^2.49.0` | Supabase Cloud (PostgreSQL 15+) | Multi-tenant PostgreSQL with Row Level Security (RLS). Server-side auth session cookies (`sb-access-token`, `sb-refresh-token`) managed in `src/middleware.ts`. |
| **Object Storage** | `@aws-sdk/client-s3@^3.700.0`<br>`@aws-sdk/s3-request-presigner@^3.700.0` | Cloudflare R2 (S3 API Compatible) | Zero egress fee object storage. Direct browser-to-bucket uploads via presigned PUT URLs, streamed via internal edge proxy. |
| **Image Compression** | `browser-image-compression@^2.0.2` | Browser Web Worker & Main Thread | Client-side pre-upload downscaling (max 1280px) and transcoding to WebP format, hard capped at strictly `≤ 200KB` per media asset. |
| **Celebration FX** | `canvas-confetti@^1.9.3` | Browser Client | Physics-driven particle celebration confetti for unboxing animations, candle blowing, and confession reveals. |
| **Audio Synthesizer** | Native Web Audio API | Client Browser Native | Procedural polyphonic Web Audio synthesizer (`src/lib/synth-audio.ts`) providing continuous offline/fallback audio loops when network streams are unavailable. |
| **Type Checking** | `typescript@^5.7.0`<br>`@astrojs/check@^0.9.0` | Strict Mode (`strict: true`) | Validated with 0 errors and 0 warnings via `astro check`. |

---

## 2. Complete UI & Page-by-Page Visual Specification

### 2.1 Global Layout & Chrome System

#### Design Palette & Tokens (`src/styles/global.css`)
- **Canvas Base**: Midnight Velvet Deep Obsidian (`#0f0d15`)
- **Card Surface**: Deep Plum Glass (`#181522`, `rgba(24, 21, 34, 0.7)`) with `backdrop-filter: blur(16px)`
- **Primary Accent**: Champagne Gold (`#f5c563`, Light: `#fae09a`, Dark: `#d9a738`)
- **Secondary Accent**: Muted Rose Gold (`#e07a93`, Light: `#ea9fb2`, Dark: `#c95e78`)
- **Text Palette**: Primary Ivory (`#f7f6f9`), Muted Slate (`#a59fad`), Subtle Subtitle (`#c2bdcb`)
- **Strict Zero Emoji Policy**: Raw Unicode emojis are strictly forbidden on landing page chrome, navbar, dashboard navigation, and system buttons. Emojis are reserved strictly for user-facing celebratory content (e.g. card previews or category stickers).

#### Navbar Component (`src/components/layout/Navbar.astro`)
- Sticky top navigation with glassmorphism blur (`bg-[#0f0d15]/80 backdrop-blur-xl border-b border-white/10`).
- **Brand Medallion**: Logo image `/logo-icon.png` housed inside a square rounded container (`bg-linear-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30`) with brand text: `<span class="bg-linear-to-r from-amber-300 via-pink-400 to-purple-400 bg-clip-text text-transparent font-extrabold">El</span><span class="text-white font-bold">Celebrate</span>`.
- **Dynamic Auth-Aware States**:
  - *Guest State*: Displays "Masuk" (`/signin`) and gold button "Daftar Gratis" (`/signup`).
  - *Authenticated State*: Displays "Dashboard" (`/dashboard`), gold CTA "Buat Kartu" (`/dashboard/create`), and interactive User Menu dropdown showing avatar image or user initials, full name, email, link to "Pengaturan Profil" (`/dashboard/profile`), and "Keluar" (`POST /api/auth/logout`).
  - *Mobile Responsive Drawer*: Hamburger toggle with glass backdrop, sliding navigation links, and full touch accessibility.

---

### 2.2 Homepage (`src/pages/index.astro`)

The homepage delivers an editorial boutique stationery studio atmosphere featuring an asymmetric layout, high-contrast typography, and live interactive demonstrators.

```
┌────────────────────────────────────────────────────────────────────────┐
│ NAVBAR (Brand Logo • Dynamic Auth Nav / Dashboard Pill)                │
├───────────────────────────────────┬────────────────────────────────────┤
│ EDITORIAL HERO COPY               │ LIVE INTERACTIVE STUDIO PHONE      │
│ • "Bukan sekadar pesan singkat,   │ • 3D Phone Mockup Chassis          │
│    merancang momen yang layak     │ • Wax Seal Gate Split Cover        │
│    dikenang."                     │ • Top Action Bar (Reseal & Audio)  │
│ • Champagne Gold CTAs             │ • 1:1 Embedded /c/demo-wedding     │
│ • Trust Strip (<1s, No Watermark) │ • Bidirectional postMessage Bridge │
├───────────────────────────────────┴────────────────────────────────────┤
│ ASYMMETRIC BENTO FEATURE GRID (4 Luxury Cards)                         │
├────────────────────────────────────────────────────────────────────────┤
│ 7 BOUTIQUE CATEGORY SHOWCASE CARDS                                     │
├────────────────────────────────────────────────────────────────────────┤
│ FOOTER (Editorial Stationery Branding, Legal Links, Zero Emoji Chrome) │
└────────────────────────────────────────────────────────────────────────┘
```

#### Key Sections:
1. **Editorial Split Hero**:
   - Left Column: Studio atelier pill (`Digital Stationery & Invitation Studio`), editorial H1 typography (*Cormorant Garamond* / *Playfair Display* italics), Indonesian value proposition, and two prominent CTAs ("Mulai Mendesain" and "Jelajahi Koleksi Desain"). Understated trust strip: *Bebas Iklan & Watermark*, *Ringan & Akses Instan <1 Detik*, *7 Kategori Eksklusif*.
2. **Pratinjau Interaktif Studio (1:1 Embedded Phone Showcase)**:
   - Chassis: `w-72.5 sm:w-80 h-145 sm:h-157.5 rounded-[32px] border border-[#f5c563]/30 bg-[#0f0d15]` with outer ambient glow.
   - **Layer 1: Unboxing Cover**: Left and right gate doors (`#hero-gate-left`, `#hero-gate-right`) with gold filigree hairline borders, gold header text ("The Wedding Celebration Of Raden & Arum • 24.10.2026"), and center embossed wax seal medallion (`#hero-wax-seal`, initialed "R&A").
   - **Layer 2: Top Action Bar (`#showcase-top-bar`)**: Revealed smoothly after unboxing. Contains phone notch speaker, "Tutup Segel" reseal reset button (`#showcase-reseal-top-btn`), equalizer pulse bars displaying `wedding.opus`, audio mute/unmute toggle (`Volume2`/`VolumeX`), and external fullscreen shortcut.
   - **Layer 3: 1:1 Embedded Viewport (`#showcase-iframe`)**: Lazy-loaded `<iframe>` pointing to `/c/demo-wedding?embed=1`. Preloaded on browser idle (`requestIdleCallback`) or on first hover/touch.
   - **Bidirectional `postMessage` Bridge**:
     - Parent -> Iframe: `{ type: 'PLAY_AUDIO' }` on unbox, `{ type: 'RESET_SEAL' }` on reseal, `{ type: 'TOGGLE_MUTE' }` on audio button click.
     - Iframe -> Parent: `{ type: 'AUDIO_STATE_CHANGED', isPlaying: boolean }` to sync equalizer bars and volume icons.
3. **Asymmetric Bento Feature Grid**:
   - *Card 1 (Audio)*: Audio track selector preview showing `wedding.opus`, equalizer animations, and royalty-free guarantee.
   - *Card 2 (Speed)*: Performance metric card highlighting V8 runtime, instant CDN distribution, and zero mobile clipping.
   - *Card 3 (Typography)*: Showcase of *Cormorant Garamond* and *Playfair Display* paired with cultural Indonesian batik motifs.
   - *Card 4 (Digital Envelope)*: Interactive bank account copy module with live clipboard feedback toast ("Tersalin!").
4. **7 Boutique Category Showcase Cards**:
   - Atelier Signature editions for Wedding, Birthday, Anniversary, Graduation, Invitation, Love, and Greetings with custom vector icons (`lucide-astro`), descriptions, and direct wizard jump links.

---

### 2.3 Dashboard (`src/pages/dashboard/index.astro`)

The dashboard serves as the central management studio for user stationery cards, supporting both guest visitors and authenticated creators.

#### 1. Dual-Mode Accessibility:
- **Guest Preview Mode (`!user`)**:
  - Non-authenticated visitors accessing `/dashboard` are **not** abruptly redirected.
  - Renders a prominent "Mode Pratinjau Tamu (Guest Showcase)" alert card explaining features and inviting users to "Masuk ke Akun" or "Daftar Gratis".
  - Renders the canonical "Raden & Arum" wedding showcase card with simulated studio actions.
- **Authenticated Member Dashboard (`user`)**:
  - Queries `public.cards` by `user_id = user.id` ordered by `created_at DESC`.
  - Displays user cards with live publish toggles, edit shortcuts, share buttons, and delete dialogs.

#### 2. Built-in Studio Showcase Card ("Raden & Arum"):
- Pinned permanently at the top of the dashboard.
- Features luxury banner styling (`bg-linear-to-br from-[#1b1728] via-[#15121e] to-[#0f0d15]`), 11-photo thumbnail indicator, badge "Boutique Master Template", and action buttons:
  - *Guest*: "Lihat Undangan Utuh", "Simulasi Studio", "Gunakan Konsep Ini".
  - *Authenticated*: "Lihat Demo Utuh" (`/c/demo-wedding`), "Uji Bagikan WA" (triggers WhatsApp modal), "Buat Seperti Ini" (`/dashboard/create?category=wedding`).
- **Non-Deletable**: Does not exist as a user row in the database; cannot be accidentally modified or deleted.

#### 3. Personal User Cards Grid:
- Cards display thumbnail, recipient name, category badge, event date, status toggle, and action buttons.
- **Publish Status Toggle (`.status-toggle-btn`)**: Optimistically toggles between "Diterbitkan" (emerald green with pulsing dot) and "Draf" (muted slate), issuing `PATCH /api/cards/[id]` with `{ is_published: boolean }`.
- **Delete Confirmation Modal (`#delete-card-modal`)**: Confirms card recipient name and calls `DELETE /api/cards/[id]`, which purges associated photos and custom audio from Cloudflare R2 before removing the database row.

#### 4. Universal WhatsApp Share Modal (`#share-card-modal`):
- Provides personalized invitation generation:
  - Input field for **Nama Tamu** (`#share-guest-name`).
  - Dropdown for **Sapaan** (`Bapak`, `Ibu`, `Saudara/i`, `Teman`).
  - Live link generator appending `?to={encodedName}`.
  - Live preview of Indonesian WhatsApp text template with emojis and event details.
  - Direct 1-click CTAs: "Salin Tautan" (clipboard) and "Kirim via WhatsApp" (`https://api.whatsapp.com/send?text=...`).

---

### 2.4 Studio Wizard & 1:1 Live Preview (`src/pages/dashboard/create.astro`)

The studio wizard is an interactive 5-step creation suite with a simultaneous 1:1 live WYSIWYG phone simulator.

```
┌─────────────────────────────────────────────────────────────┬────────────────────────────────────┐
│ STEP 1 - 5 FORM WIZARD (3 Columns)                          │ 1:1 PHONE LIVE PREVIEW (2 Columns) │
│ • Step 1: 7 Category Cards                                  │ • Stationary Outer Frame           │
│ • Step 2: 24 Color Swatches + HEX, 11 Patterns,             │ • Isolated #preview-corner-frame   │
│           11 Ornaments, 20 Ambient Effects, Unboxing Styles │ • Live Unbox Cover Simulator       │
│ • Step 3: <=200KB WebP Uploader, 7 Opus Tracks              │ • Real-time Typography & CSS       │
│ • Step 4: Category-Specific Detail Fields                   │ • Bottom Anti-Clipping (pb-36)     │
│ • Step 5: Slug Validator & Instant Publish                  │                                    │
└─────────────────────────────────────────────────────────────┴────────────────────────────────────┘
```

#### 5-Step Guided Flow:
1. **Step 1: Pilih Kategori**:
   - 7 boutique categories with visual emojis, titles, and descriptions. Selecting a category sets default ambient effects and recommended audio tracks.
2. **Step 2: Tema & Visual**:
   - **24 Curated Swatches**: 12 Core Swatches (*Champagne Gold*, *Classic Gold*, *Muted Rose*, *Warm Terracotta*, *Emerald Teal*, etc.) + 12 Extended Swatches (*Soft Coral*, *Deep Plum*, *Midnight Indigo*, etc.) + direct custom `#HEX` input.
   - **11 Authentic Cultural Patterns**: *Kawung*, *Truntum*, *Megamendung*, *Songket*, *Pucuk Rebung*, *Parang*, *Tenun*, *Damask*, *Arabesque*, *Constellation*, or *None*.
   - **11 Corner Ornaments**: *Botanical*, *Keraton Floral*, *Ronce Melati*, *Pucuk Rebung*, *Art Deco*, *Baroque*, *Diamond Frame*, *Celestial*, *Gunungan*, *Mandala*, or *None*.
   - **20 Ambient Particle Effects**: *Petals*, *Golden Sparkles*, *Hearts*, *Confetti*, *Starlight*, *Lanterns*, *Butterflies*, *Bokeh*, *Sparklers*, *Snowfall*, *Jasmine*, *Beras Kuning*, *Keraton Glow*, *Fireflies*, *Champagne Dust*, *Prism Glow*, *Sakura Drift*, *Floating Pearls*, *Aurora Mist*, or *None*.
   - **Thematic Unboxing Style**: Category-specific selector (e.g. *Gate Split*, *Curtain Lift*, *Wax Seal* for Wedding; *Gift Box Pop*, *Ribbon Untie* for Birthday; *Diploma Scroll* for Graduation).
   - **Greetings Occasion Selector**: 10 Indonesian holiday presets (*Idul Fitri*, *Idul Adha*, *Natal & Tahun Baru*, *Imlek*, *Waisak*, *Nyepi*, *Kemerdekaan RI*, *Hari Ibu/Ayah*, *Lekas Sembuh*, *General*).
3. **Step 3: Foto & Musik**:
   - Multi-photo upload with client-side WebP compression (max 4 photos for general cards, max 11 photos for Wedding).
   - Touchscreen-friendly thumbnail management with red delete badges (`w-6 h-6 rounded-full bg-red-600/90`).
   - 7 curated Opus audio loops with built-in preview audio players and external/custom audio URL input.
4. **Step 4: Detail & Pesan**:
   - Form fields dynamically morph based on selected category:
     - *Wedding*: Bride details, groom details, opening greeting, sacred quote toggle + text + source, Akad schedule (date, time, venue, address, Google Maps URL), Resepsi schedule, Unduh Mantu optional event, 1-5 dresscode color swatches + styling notes, digital envelope (bank, account number, account holder), Love Story timeline milestones, and Turut Mengundang block.
     - *Birthday*: Age milestone, candle blow toggle, celebration message.
     - *Anniversary*: Partner names, anniversary date (live relationship counter), milestone badge.
     - *Graduation*: Degree/major, institution/campus, graduation date, royal diploma framing.
     - *Invitation*: Event title, host name, event date & time, venue location, Google Maps URL.
     - *Love*: Recipient & sender, 4-digit PIN passcode lock, interactive confession prompt ("Mau" vs runaway "Nggak").
     - *Greetings*: Selected occasion preset, sender/family signature.
5. **Step 5: Tinjau & Terbitkan**:
   - Summary card review, custom slug input with auto-slug generation from recipient name, and instant publish toggle. Submitting launches the published card in a new tab while smoothly redirecting the dashboard.

#### Technical Safeguards:
- **Mobile Anti-Clipping (`pb-36 sm:pb-24`)**: Guarantees bottom navigation buttons never overlap form fields on mobile viewports.
- **Stationary Phone Frame (`#preview-corner-frame`)**: Corner ornaments are rendered in a stationary sibling frame above the scrollable phone container, ensuring ornaments stay fixed at the corners during preview scrolling.

---

### 2.5 Public Recipient Card Engine (`src/pages/c/[slug].astro`)

The recipient card engine renders the public-facing celebratory card at `/c/[slug]`.

#### Routing & Modes:
1. **Standard Supabase Slugs**: Queries `public.cards` where `slug = :slug` and `is_published = true`.
2. **In-Memory Showcase Route (`/c/demo-wedding`)**: Directly serves `SHOWCASE_WEDDING_CARD` and `SHOWCASE_WEDDING_WISHES` from `src/lib/showcase-wedding.ts` without database lookups.
3. **Studio Embed Mode (`?embed=1`)**:
   - Hides the full-screen unbox cover overlay (`hidden! pointer-events-none`).
   - Applies `:global(html.is-embed)` and `:global(body.is-embed)` styles for custom compact scrollbars.
   - Listens to parent window `postMessage` calls for audio controls (`PLAY_AUDIO`, `TOGGLE_MUTE`, `RESET_SEAL`) and posts back `AUDIO_STATE_CHANGED`.

#### Category-Specific Interactive Staging:

| Category | Signature Visual Architecture & Interactivity |
| :--- | :--- |
| **Wedding** | **11-Photo Architecture**: Cover/Hero (Photo 0), Bride portrait (Photo 1), Groom portrait (Photo 2), 8 Prewedding gallery photos (Photos 3-10).<br>**Features**: Sacred quote card, circular portrait framing with parentage, Akad & Resepsi event cards with 1-tap Google Calendar (`formatGoogleCalendarUrl`) and Google Maps CTAs, 1-5 dresscode chips, digital envelope bank card with 1-tap clipboard copy toast, Turut Mengundang block, RSVP & Wish Wall with "Hadir"/"Tidak Hadir" status tags, and floating glass bottom dock pill (`#sampul`, `#mempelai`, `#acara`, `#galeri`, `#amplop`, `#rsvp`) paired with a rotating vinyl music disc. |
| **Birthday** | **Interactive Candle Blow**: Realistic animated SVG candle with flame flicker. Clicking or touching blows out the flame with particle smoke and triggers a confetti burst; auto-relights after a 3-second cooldown.<br>**3D Polaroid Stack Deck**: Layered polaroid cards with CSS 3D rotations; clicking or swiping flips through cards in a cyclic deck with lightbox zoom. |
| **Anniversary** | **Live Relationship Counter**: Real-time counter computing exact years, months, and days elapsed since wedding/dating date.<br>**Filmstrip Keepsake**: Retro film perforation borders housing couple memories. |
| **Graduation** | **Royal Diploma Cylinder**: 3D embossed diploma scroll with golden wax stamp.<br>**Mortarboard Toss**: Animated graduation caps floating upwards continuously with particle trails. |
| **Invitation** | **VIP Ticket Pass**: Event pass styling with perforated punch-out notches, barcode graphic, calendar CTA, and RSVP attending/declining buttons. |
| **Love** | **4-Digit PIN Lock**: Passcode gate overlay with numerical keypad requiring creator's secret PIN.<br>**Runaway "Nggak" Button**: Interactive confession prompt where the "Nggak" button physically jumps away on hover or touch, forcing acceptance ("Mau") followed by a massive confetti explosion. |
| **Greetings** | **Indonesian Holiday Presets**: Thematic banners for *Idul Fitri* (ketupat/lanterns), *Natal* (snowfall), *Imlek* (red/gold envelopes), etc., with family signature stamp. |

---

### 2.6 Auth Pages (`signin.astro`, `signup.astro`)

- **Sign In (`src/pages/signin.astro`)**:
  - Email and password inputs with eye visibility toggle (`#toggle-password`).
  - Localized Indonesian error handling (*"Email atau kata sandi yang Anda masukkan salah"*).
  - Passwordless Magic Link fallback via `POST /api/auth/magic-link`.
  - Sets HTTP-only cookies `sb-access-token` (session duration) and `sb-refresh-token` (7 days).
- **Sign Up (`src/pages/signup.astro`)**:
  - Full Name, Email, and Password (min 6 characters).
  - Real-time password strength meter (Weak, Medium, Strong) with color-coded bar.
  - Automatic profile row provisioning via Supabase trigger on `auth.users`.

---

### 2.7 Profile Management (`src/pages/dashboard/profile.astro`)

- **Avatar Upload Pipeline**:
  - Client-side downscaling and compression via `compressAvatar` (`image-compress.ts`) to WebP (max 100KB, max 400px).
  - Uploads to Cloudflare R2 via presigned URL (`folder: 'avatars'`).
  - Instant circular preview with initial fallback.
- **User Metadata & Phone Validation**:
  - Full Name input (sanitized, max 60 chars).
  - WhatsApp Phone Number input (`phone_number`) validated with regex `/^\+?[0-9]{9,16}$/`.
  - Profile updates synchronize both `public.profiles` table and Supabase auth user metadata.
- **Permanent Account Deletion ("HAPUS" Confirmation)**:
  - Destructive modal requiring user to type exact uppercase word `"HAPUS"`.
  - Submits to `POST /api/profile/delete-account`, which executes a full cascade: sweeps all R2 assets (card photos, custom audio, profile avatar), deletes DB wishes, deletes cards, deletes profile, deletes `auth.users` record, invalidates cookies, and clears local/session storage.

---

### 2.8 Legal Pages (`privacy.astro`, `terms.astro`)

- Comprehensive Indonesian legal terms and privacy disclosures covering data collection, media ownership, R2 storage retention, digital envelope disclaimer (ElCelebrate is strictly a display medium and never touches financial transactions), and account purge rights.

---

## 3. Database Schema, RLS, & exact `ThemeConfig` Contract

### 3.1 PostgreSQL Database Schema

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
```sql
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text not null default '',
  avatar_url   text,
  phone_number text,
  created_at   timestamptz not null default now()
);
```

#### Table: `public.cards`
```sql
create table if not exists public.cards (
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

create index if not exists idx_cards_slug on public.cards(slug);
create index if not exists idx_cards_user_id on public.cards(user_id);
```

#### Table: `public.wishes`
```sql
create table if not exists public.wishes (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards(id) on delete cascade,
  sender_name text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_wishes_card_id on public.wishes(card_id);
```

---

### 3.2 Row Level Security (RLS) Policies

All tables enforce Row Level Security (`alter table ... enable row level security;`).

#### `public.profiles`:
- **View**: `create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);`
- **Update**: `create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);`

#### `public.cards`:
- **Public View**: `create policy "Public can view published cards" on public.cards for select using (is_published = true);`
- **Owner View**: `create policy "Owners can view all own cards" on public.cards for select using (auth.uid() = user_id);`
- **Insert**: `create policy "Authenticated users can create cards" on public.cards for insert with check (auth.uid() = user_id);`
- **Update**: `create policy "Owners can update own cards" on public.cards for update using (auth.uid() = user_id);`
- **Delete**: `create policy "Owners can delete own cards" on public.cards for delete using (auth.uid() = user_id);`

#### `public.wishes`:
- **Public View**: `create policy "Public can view wishes for published cards" on public.wishes for select using (exists (select 1 from public.cards where cards.id = wishes.card_id and cards.is_published = true));`
- **Public Insert**: `create policy "Anyone can submit wishes" on public.wishes for insert with check (exists (select 1 from public.cards where cards.id = wishes.card_id and cards.is_published = true));`
- **Owner Delete**: `create policy "Card owners can delete wishes" on public.wishes for delete using (exists (select 1 from public.cards where cards.id = wishes.card_id and cards.user_id = auth.uid()));`

---

### 3.3 Exact TypeScript Interfaces (`src/lib/types.ts`)

```typescript
export type CardCategory = 'birthday' | 'anniversary' | 'graduation' | 'invitation' | 'wedding' | 'love' | 'greetings';

export type UnboxStyle = 'envelope' | 'giftbox' | 'ribbon';

export type ThematicUnboxStyle =
  | 'gate-split'
  | 'curtain-lift'
  | 'wax-seal'
  | 'giftbox-pop'
  | 'ribbon-untie'
  | 'wax-seal-letter'
  | 'folded-note'
  | 'diploma-scroll'
  | 'folder-reveal'
  | 'vip-sleeve'
  | 'gold-envelope'
  | 'jewelry-box'
  | 'bifold-card'
  | 'festive-envelope';

export type AmbientEffectType =
  | 'petals'
  | 'golden-sparkles'
  | 'hearts'
  | 'confetti-float'
  | 'starlight'
  | 'lanterns'
  | 'butterflies'
  | 'bokeh'
  | 'sparklers'
  | 'snowfall'
  | 'hearts-petals'
  | 'jasmine'
  | 'beras-kuning'
  | 'keraton-glow'
  | 'fireflies'
  | 'champagne-dust'
  | 'prism-glow'
  | 'sakura-drift'
  | 'floating-pearls'
  | 'aurora-mist'
  | 'none';

export type CornerOrnamentType =
  | 'none'
  | 'botanical'
  | 'keraton'
  | 'melati'
  | 'pucukrebung'
  | 'artdeco'
  | 'baroque'
  | 'diamond-frame'
  | 'celestial'
  | 'gunungan'
  | 'mandala';

export interface WeddingEventDetail {
  date: string;       // YYYY-MM-DD
  timeStart: string;  // HH:MM
  timeEnd: string;    // HH:MM
  venue: string;
  address: string;
  mapsUrl: string;
}

export interface WeddingDigitalEnvelope {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface WeddingData {
  bride: {
    fullName: string;
    nickname: string;
    parents: string;
  };
  groom: {
    fullName: string;
    nickname: string;
    parents: string;
  };
  akadEvent: WeddingEventDetail;
  receptionEvent: WeddingEventDetail;
  unduhMantu?: {
    enabled: boolean;
    title?: string;
    date?: string;
    time?: string;
    locationName?: string;
    address?: string;
    mapUrl?: string;
  };
  digitalEnvelope: WeddingDigitalEnvelope;
  loveStory: string;
  openingGreeting: string;
  sacredQuote?: {
    enabled?: boolean;
    quote?: string;
    source?: string;
  };
  loveStoryTimeline?: Array<{
    year?: string;
    title?: string;
    story?: string;
  }>;
  dresscode?: {
    enabled?: boolean;
    colors?: string[];
    note?: string;
  };
  turutMengundang?: string;
}

export interface InteractiveConfessionConfig {
  enabled: boolean;
  prompt?: string;
  yesText?: string;
  noText?: string;
}

export type GreetingsOccasion =
  | 'idul-fitri'
  | 'natal-tahun-baru'
  | 'imlek'
  | 'idul-adha'
  | 'waisak'
  | 'nyepi'
  | 'kemerdekaan'
  | 'hari-ibu-ayah'
  | 'get-well-soon'
  | 'general'
  | string;

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: 'serif' | 'sans' | 'handwritten' | 'display';
  backgroundPattern: 'none' | 'kawung' | 'truntum' | 'megamendung' | 'songket' | 'pucukrebung' | 'parang' | 'tenun' | 'damask' | 'arabesque' | 'constellation';
  unboxStyle: UnboxStyle;
  audioTrackId: string | null;
  externalAudioUrl: string | null;
  customAudioUrl?: string | null;
  audioStartTime?: number;
  ambientEffect?: AmbientEffectType;
  cornerOrnament?: CornerOrnamentType;
  unboxingStyle?: ThematicUnboxStyle | string;
  weddingHeaderTitle?: string;
  weddingData?: WeddingData;
  passcode?: string;
  interactiveConfession?: InteractiveConfessionConfig;
  occasion?: GreetingsOccasion;
  signature?: string;
  ageMilestone?: string;
  anniversaryMilestone?: string;
  degreeMajor?: string;
  schoolCampus?: string;
  invitationEventType?: string;
  invitationTime?: string;
  invitationVenue?: string;
}

export interface Card {
  id: string;
  user_id: string;
  slug: string;
  category: CardCategory;
  recipient_name: string;
  sender_name: string;
  message: string;
  event_date: string | null;
  theme_config: ThemeConfig;
  media_urls: string[];
  is_published: boolean;
  created_at: string;
}

export interface Wish {
  id: string;
  card_id: string;
  sender_name: string;
  message: string;
  attendance?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone_number?: string | null;
  created_at: string;
}
```

---

## 4. Storage, Audio & Media Pipeline

### 4.1 Client-Side WebP Compression Pipeline
Engineered in `src/lib/image-compress.ts` using `browser-image-compression`:
- **Constraints**: Max dimension `1280px` (prevents mobile canvas Out-Of-Memory crashes), quality `0.80`, hard file size limit strictly `≤ 200KB` (target `~194.5KB`).
- **Resilient Fallback**: Tries compression in a dedicated Web Worker first; if the worker crashes on low-end mobile devices, immediately catches and re-executes on the main thread.
- **Secondary Pass**: If file remains > 200KB, triggers an aggressive secondary pass with quality `0.60`.
- **Avatar Compression (`compressAvatar`)**: Capped at `≤ 100KB` with max dimension `400px`.

### 4.2 Direct S3/R2 Presigned PUT Upload
- Client requests a signed URL from `POST /api/storage/presigned-url` with `{ filename, contentType: 'image/webp', folder: 'cards' | 'avatars' | 'audio' }`.
- Server generates a single-use S3 presigned URL via `@aws-sdk/s3-request-presigner` valid for 300 seconds.
- Client uploads raw WebP binary directly to R2 bucket via `XMLHttpRequest` with live progress tracking (`uploadToR2`). Server bandwidth load is 0MB.

### 4.3 Edge Reverse Streaming Media Proxy (`/api/media/[...path]`)
- **Indonesian ISP Protection**: Public `*.r2.dev` domains are frequently blocked by Indonesian ISPs (DNS/SNI censorship).
- **Edge Proxy**: Requests to `/api/media/[...path]` are streamed directly from R2 using `GetObjectCommand` with `transformToWebStream()`.
- **Security**: Strictly restricts prefixes to `cards/`, `avatars/`, and `audio/`, while rejecting any path traversal (`..` or `\`).
- **Edge Caching**: Injects immutable cache headers: `Cache-Control: public, max-age=31536000, immutable` and `Accept-Ranges: bytes`.

### 4.4 Automated Orphaned Asset Garbage Collection
- **Card Edit (`PATCH /api/cards/[id]`)**: Automatically diffs previous `media_urls` and `customAudioUrl` against incoming values, issuing `DeleteObjectCommand` for removed files.
- **Card Delete (`DELETE /api/cards/[id]`)**: Sweeps all photos and custom audio from R2 before deleting the card row.
- **Profile Avatar Change (`POST /api/profile/update`)**: Detects avatar replacements or deletions and deletes previous avatar files from R2.
- **Account Deletion (`POST /api/profile/delete-account`)**: Harvests all user R2 keys across avatar, cards, and audio, batch-deleting them via `DeleteObjectsCommand` in chunks of 1000 items with individual fallback.

### 4.5 Dual-Engine Audio Architecture
1. **Primary Opus Catalog (`public/audio/`)**:
   - `wedding.opus` (*Sacred Romance*, 58s, Sacred & Romantic)
   - `birthday.opus` (*Birthday Joy*, 44s, Joyful & Festive)
   - `anniversary.opus` (*Sweet Milestone*, 50s, Warm & Nostalgic)
   - `graduation.opus` (*Triumphant Horizon*, 60s, Inspiring & Grand)
   - `invitation.opus` (*Celebration Vibe*, 48s, Upbeat & Welcoming)
   - `love.opus` (*Heartfelt Melody*, 54s, Intimate & Tender)
   - `greetings.opus` (*Warm Wishes*, 46s, Peaceful & Cordial)
   - Files are pre-transcoded to Opus format (<2MB each) with instant streaming.
2. **Procedural Web Audio Synthesizer Fallback (`src/lib/synth-audio.ts`)**:
   - Zero-dependency client-side procedural synthesizer using native Web Audio API (`AudioContext`, `BiquadFilterNode`, `DelayNode`, `GainNode`).
   - Generates polyphonic celebratory motifs on demand if network audio streams fail. Supports `piano`, `strings`, `bells`, `pluck`, and `bass` instruments with ADSR envelopes and delay feedback.

---

## 5. Complete API & Routing Contract

All server endpoints are located in `src/pages/api/`:

| Endpoint | HTTP Method | Auth Required | Request Payload | Response Status & Body | Description & Internal Workflow |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | No | `{ email, password }` | `200`: `{ user, session }`<br>`400`: `{ error }`<br>`401`: `{ error }` | Authenticates via Supabase `signInWithPassword`. Injects `sb-access-token` and `sb-refresh-token` HTTP-only cookies. |
| `/api/auth/signup` | `POST` | No | `{ email, password, full_name }` | `201`: `{ user, session }`<br>`400`: `{ error }` | Registers user via Supabase `signUp`. Database trigger automatically provisions `public.profiles`. |
| `/api/auth/logout` | `POST` | Yes | Form submit / empty | `302 Redirect` to `/` | Calls `signOut()`, deletes `sb-access-token` and `sb-refresh-token` cookies. |
| `/api/auth/magic-link` | `POST` | No | `{ email }` | `200`: `{ message }`<br>`400`: `{ error }` | Issues passwordless OTP magic link pointing to `/api/auth/callback`. |
| `/api/auth/callback` | `GET` | No | Query: `?code=...` | `302 Redirect` to `/dashboard` or `/signin` | Exchanges PKCE code for session and persists session cookies. |
| `/api/cards` | `GET` | Yes | None | `200`: `Card[]`<br>`401`: `{ error }` | Returns all cards created by the authenticated user (`user_id = user.id`). |
| `/api/cards` | `POST` | Yes | `{ category, recipient_name, sender_name, message, event_date, theme_config, media_urls }` | `201`: `Card`<br>`400`: `{ error }`<br>`401`: `{ error }` | Creates new card. Enforces photo count limits (11 for Wedding, 4 for others), auto-generates unique slug. |
| `/api/cards/[id]` | `GET` | Yes | None | `200`: `Card`<br>`404`: `{ error }` | Fetches single card by ID with sanitized media URLs. |
| `/api/cards/[id]` | `PATCH` | Yes | Partial `<Card>` payload (`is_published`, `theme_config`, etc.) | `200`: `Card`<br>`400`: `{ error }`<br>`404`: `{ error }` | Updates card fields. Performs automated R2 diff and purges removed media assets. |
| `/api/cards/[id]` | `DELETE` | Yes | None | `200`: `{ success: true }`<br>`404`: `{ error }` | Purges all associated R2 assets and deletes card row (cascades to `wishes`). |
| `/api/cards/by-slug/[slug]` | `GET` | No | None | `200`: `Card`<br>`404`: `{ error }` | Public endpoint resolving published cards by unique slug. |
| `/api/media/[...path]` | `GET`, `HEAD` | No | None | `200`: Streamed Binary<br>`403`: `{ error }`<br>`404`: `Not Found` | Edge streaming reverse proxy for R2 assets (`cards/`, `avatars/`, `audio/`) with immutable caching. |
| `/api/profile/update` | `POST` | Yes | `{ full_name, avatar_url, phone_number }` | `200`: `{ success, profile }`<br>`400`: `{ error }` | Updates `public.profiles` and auth user metadata. Validates phone format and cleans orphaned R2 avatars. |
| `/api/profile/delete-account` | `POST`, `DELETE` | Yes | None | `200`: `{ success, message }`<br>`401`: `{ error }` | Permanently deletes user R2 files, wishes, cards, profile, and `auth.users` row. |
| `/api/storage/presigned-url` | `POST` | Yes | `{ filename, contentType, folder }` | `200`: `{ uploadUrl, publicUrl, key }`<br>`400`: `{ error }` | Issues AWS S3 presigned PUT URL for browser uploads (300s expiry). |
| `/api/wishes/[cardId]` | `GET` | No | None | `200`: `Wish[]`<br>`500`: `{ error }` | Fetches all wishes submitted to a card ordered by `created_at DESC`. |
| `/api/wishes/[cardId]` | `POST` | No | `{ sender_name, message }` | `201`: `Wish`<br>`400`: `{ error }`<br>`404`: `{ error }` | Submits public blessing/wish to a published card. |

---

## 6. Environment Variables & Current Roadmap Backlog

### 6.1 Runtime Environment Variables & Cloudflare Bindings

| Environment Variable | Required | Scope | Purpose & Format |
| :--- | :--- | :--- | :--- |
| `PUBLIC_SUPABASE_URL` | Yes | Universal | Supabase Project URL (`https://<project-ref>.supabase.co`). |
| `PUBLIC_SUPABASE_ANON_KEY` | Yes | Universal | Supabase public anonymous API key for client and SSR RLS queries. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-Only | Admin secret key for administrative account purge and profile deletion. |
| `R2_ACCOUNT_ID` | Yes | Server-Only | Cloudflare Account ID for constructing S3 endpoint. |
| `R2_ACCESS_KEY_ID` | Yes | Server-Only | Cloudflare R2 S3 API access key credential. |
| `R2_SECRET_ACCESS_KEY` | Yes | Server-Only | Cloudflare R2 S3 API secret access key credential. |
| `R2_BUCKET_NAME` | Yes | Server-Only | Target Cloudflare R2 storage bucket name (`elcelebrate-assets`). |
| `R2_PUBLIC_DOMAIN` | Optional | Server-Only | Optional public R2 URL (`https://pub-<hash>.r2.dev`). |

### 6.2 Production Roadmap & Active Backlog
1. **Dynamic QRIS Payment Gateway Integration**:
   - `transactions` database table with foreign keys linking to `cards` and `profiles`.
   - Webhook listener endpoint (`/api/payments/webhook`) supporting Midtrans or Xendit dynamic QRIS generation for digital envelope monetary contributions.
2. **Custom User Audio Upload UI Refinement**:
   - Add direct file upload interface in Step 3 for custom MP3/Opus tracks (capped at `<= 3MB`).
   - Client-side audio duration detector before presigned URL request.
3. **Template Presets from Showcase**:
   - Enable users to click "Gunakan Konsep Ini" on the "Raden & Arum" showcase to auto-fill Step 1-4 with master template defaults.
4. **Admin RBAC Role Schema**:
   - Add `role: 'admin' | 'user'` column to `public.profiles`.
   - Administrative dashboard for card moderation, user management, and platform analytics.
