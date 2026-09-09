# ElCelebrate — System Architecture & Context Documentation

> **Target Audience:** External AI Architects, Engineering Leads, and Technical Contributors  
> **Document Status:** Active & Grounded to Current Codebase  
> **Repository:** `elcelebrate`  
> **Last Verified:** September 2026

---

## 1. Project Overview & Tech Stack

ElCelebrate is an ultra-lightweight, zero-cost-tier digital celebration and greeting card web platform. It empowers users to design, customize, and share interactive digital cards featuring animations, music, countdown timers, photo galleries, and guestbooks (Wish Walls) for milestones like birthdays, anniversaries, graduations, and event invitations.

### 1.1 Core Technologies & Versions

| Layer | Technology | Version | Purpose & Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | [Astro](https://astro.build/) | `^5.2.0` | Content-first web framework with zero JS by default, used in full SSR mode. |
| **Edge Adapter** | `@astrojs/cloudflare` | `^12.0.0` | Cloudflare Pages / Workers deployment adapter. |
| **Type Checking** | `@astrojs/check` + `typescript` | `^0.9.0` / `^5.7.0` | Static typing and template diagnostics. |
| **Styling Engine** | [Tailwind CSS v4](https://tailwindcss.com/) | `^4.0.0` | CSS-first configuration via `@import "tailwindcss";` and `@theme` in `src/styles/global.css`. |
| **Vite Integration** | `@tailwindcss/vite` | `^4.0.0` | Tailwind v4 Vite plugin in `astro.config.mjs`. |
| **Database / Auth** | `@supabase/supabase-js`<br>`@supabase/ssr` | `^2.49.0`<br>`^0.5.0` | PostgreSQL with Row-Level Security (RLS) & cookie-based SSR authentication. |
| **Object Storage** | `@aws-sdk/client-s3`<br>`@aws-sdk/s3-request-presigner` | `^3.700.0`<br>`^3.700.0` | S3 client utilized to generate presigned upload URLs for Cloudflare R2. |
| **Client Compression** | `browser-image-compression` | `^2.0.2` | Browser-side downscaling and WebP conversion (max 200KB) prior to R2 upload. |
| **Effects & Confetti** | `canvas-confetti` | `^1.9.3` | Dynamic particle burst on card unboxing. |
| **Icons** | `lucide-astro` | `^0.460.0` | Lucide icon set available for Astro components. |

### 1.2 Rendering Strategy & Runtime Model

* **Global SSR Mode:**  
  The Astro configuration uses `adapter: cloudflare()`. Every dynamic page and API route explicitly declares:
  ```typescript
  export const prerender = false;
  ```
* **No Server-Side Node.js Dependencies in Runtime Paths:**  
  Code executing in API routes and SSR pages runs within the Cloudflare Workers V8 runtime (Edge), utilizing the Web Fetch standard (`Request`, `Response`, `Headers`, `AstroCookies`).
* **Client-Side Heavy Lifting:**  
  Heavy media processing (image resizing, WebP compression) runs completely in client Web Workers via `browser-image-compression`. Card media is PUT directly from browser to Cloudflare R2 without streaming raw bytes through the application server.

---

## 2. Complete File & Directory Tree

Below is the annotated directory tree of the project with a functional breakdown of every file:

```text
elcelebrate/
├── .env.example                     # Reference environment variables template
├── astro.config.mjs                 # Astro configuration (Cloudflare adapter, Tailwind Vite plugin, aliases)
├── package.json                     # Dependencies, scripts (dev, build, preview, check)
├── tsconfig.json                    # TypeScript compiler options and path aliases
├── wrangler.toml                    # Cloudflare Pages / Workers deployment settings and assets dir
├── public/
│   └── favicon.svg                  # SVG celebration party popper favicon
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Initial schema: profiles, cards, wishes tables, triggers, indexes, RLS
│       └── 002_add_avatar_url_to_profiles.sql # Adds avatar_url column to profiles & updates user trigger
└── src/
    ├── env.d.ts                     # Ambient type declarations for ImportMetaEnv and App.Locals
    ├── middleware.ts                # SSR middleware: auth verification, token refresh, populates Astro.locals
    ├── components/
    │   ├── layout/
    │   │   ├── BaseLayout.astro     # Core HTML document shell, fonts, SEO/OpenGraph tags, styles import
    │   │   ├── DashboardLayout.astro# Protected dashboard layout wrapper (includes Navbar and Footer)
    │   │   ├── Footer.astro         # Site footer with brand, category links, legal placeholders
    │   │   └── Navbar.astro         # Responsive navigation bar with user session dropdown & mobile menu
    │   └── ui/
    │       ├── Badge.astro          # Status badge component (default, success, warning, error, info)
    │       ├── Button.astro         # Reusable button/anchor with gradient, sizes, and loading state
    │       ├── Card.astro           # Visual surface card with glassmorphism and hover effects
    │       ├── Input.astro          # Accessible form input with labels, states, and error handling
    │       ├── Modal.astro          # Dialog modal overlay with backdrop dismissal and close actions
    │       └── Toast.astro          # Client-side floating toast notification container and global trigger
    ├── db/
    │   └── schema.sql               # Duplicate reference copy of 001_initial_schema.sql
    ├── lib/
    │   ├── audio-tracks.ts          # Catalog of royalty-free Opus background tracks & helper functions
    │   ├── image-compress.ts        # Client-side image compression to WebP & direct R2 XHR uploader
    │   ├── r2.ts                    # Cloudflare R2 S3 client & presigned PUT URL generator
    │   ├── slug.ts                  # URL-safe slug generator ({name}-{cat}-{random}) and validator
    │   ├── supabase-browser.ts      # Public browser-side Supabase client (anon key)
    │   ├── supabase.ts              # Server-side Supabase client (cookie-aware SSR client & admin client)
    │   └── types.ts                 # Shared TypeScript interfaces (Card, ThemeConfig, Wish, Profile, etc.)
    ├── styles/
    │   └── global.css               # Tailwind v4 theme tokens, keyframe animations, glass utilities, form styles
    └── pages/
        ├── index.astro              # Public landing page with hero, categories, stats, and dynamic CTAs
        ├── login.astro              # Sign in page (Email/Password + Magic Link OTP)
        ├── signup.astro             # User registration page with full_name, email, password
        ├── c/
        │   └── [slug].astro         # Public recipient card route: unboxing animation, music, confetti, wishes
        ├── dashboard/
        │   ├── index.astro          # Protected user cards dashboard (cards grid, copy link, new card CTA)
        │   ├── create.astro         # 5-step card creation studio wizard + live mobile preview simulator
        │   └── profile.astro        # Profile settings page: avatar upload to R2, name change, sync
        └── api/
            ├── auth/
            │   ├── login.ts         # POST: Authenticate user with password, set sb-access-token cookies
            │   ├── signup.ts        # POST: Register user with Supabase Auth, set cookies
            │   ├── magic-link.ts    # POST: Trigger passwordless email OTP
            │   ├── callback.ts      # GET: Exchange OTP auth code for session tokens & redirect
            │   └── logout.ts        # POST: Sign out via Supabase & expire auth cookies
            ├── cards/
            │   ├── index.ts         # GET (list user cards), POST (create card with unique slug)
            │   ├── [id].ts          # GET (by id), PATCH (update card), DELETE (delete card)
            │   └── by-slug/
            │       └── [slug].ts    # GET: Public card lookup by slug (published cards only)
            ├── profile/
            │   └── update.ts        # POST: Update full_name and avatar_url in DB & Supabase auth metadata
            ├── storage/
            │   └── presigned-url.ts # POST: Authenticated presigned PUT URL generation for WebP assets
            └── wishes/
                └── [cardId].ts      # GET: List card wishes, POST: Public guestbook wish submission
```

---

## 3. Navigation & Routing Map

### 3.1 Route Summary Table

| Route URL | File Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | `src/pages/index.astro` | Public | Marketing landing page. Displays hero, celebration categories, benefits, and contextual CTA depending on session. |
| `/login` | `src/pages/login.astro` | Public (Guest) | Login form. Redirects authenticated users to `/dashboard`. |
| `/signup` | `src/pages/signup.astro` | Public (Guest) | Registration form. Redirects authenticated users to `/dashboard`. |
| `/c/[slug]` | `src/pages/c/[slug].astro` | Public | Public recipient celebration page. Fetches published card and associated guestbook wishes. |
| `/dashboard` | `src/pages/dashboard/index.astro` | **Protected** | Main user workspace. Lists created cards, card status, view links, and clipboard copy triggers. |
| `/dashboard/create` | `src/pages/dashboard/create.astro` | **Protected** | Interactive 5-step creation studio with live simulated iPhone/Android preview. |
| `/dashboard/profile` | `src/pages/dashboard/profile.astro` | **Protected** | Account details and avatar picture uploader. |

### 3.2 Authentication Guard Mechanism

The authentication pipeline relies on a dual-layer strategy:

```
[ Incoming Request ]
         │
         ▼
[ src/middleware.ts ]
   ├── Create SSR Supabase Client (@supabase/ssr)
   ├── Validate session via supabase.auth.getUser()
   ├── Fallback: Inspect sb-access-token / sb-refresh-token cookies
   │    └── Refresh token if expired -> Update cookies with new session
   ├── Query public.profiles by user.id
   └── Attach context.locals.user, locals.supabase, locals.profile
         │
         ▼
[ Target Astro Page / API Route Frontmatter ]
   ├── Protected Pages (/dashboard/*):
   │    const user = Astro.locals.user;
   │    if (!user) return Astro.redirect('/login');
   │
   └── Guest-Only Pages (/login, /signup):
        const user = Astro.locals.user;
        if (user) return Astro.redirect('/dashboard');
```

* **Cookie Specifications:**
  * `sb-access-token`: `httpOnly: true`, `sameSite: 'lax'`, `secure: import.meta.env.PROD`, `maxAge: session.expires_in`, `path: '/'`.
  * `sb-refresh-token`: `httpOnly: true`, `sameSite: 'lax'`, `secure: import.meta.env.PROD`, `maxAge: 7 days`, `path: '/'`.
* **State Bridge:** `src/env.d.ts` extends `App.Locals`:
  ```typescript
  declare namespace App {
    interface Locals {
      user: import('@supabase/supabase-js').User | null;
      supabase: import('@supabase/supabase-js').SupabaseClient;
      profile: import('./lib/types').Profile | null;
    }
  }
  ```

---

## 4. API Endpoints Map

All endpoints reside in `src/pages/api/` and operate in SSR mode (`prerender = false`).

### 4.1 Authentication Endpoints (`/api/auth/*`)

#### `POST /api/auth/login`
* **Auth Required:** No
* **Request Payload:**
  ```json
  { "email": "user@example.com", "password": "secretpassword" }
  ```
* **Success Response (`200 OK`):**
  ```json
  { "user": { ... }, "session": { ... } }
  ```
* **Side Effects:** Writes `sb-access-token` and `sb-refresh-token` HTTP-only cookies.

#### `POST /api/auth/signup`
* **Auth Required:** No
* **Request Payload:**
  ```json
  { "email": "user@example.com", "password": "secretpassword", "full_name": "Jane Doe" }
  ```
* **Success Response (`201 Created`):**
  ```json
  { "user": { ... }, "session": { ... } }
  ```
* **Side Effects:** Registers user in Supabase Auth, triggers `on_auth_user_created` trigger in PostgreSQL to populate `public.profiles`, and sets auth cookies if session is returned immediately.

#### `POST /api/auth/magic-link`
* **Auth Required:** No
* **Request Payload:**
  ```json
  { "email": "user@example.com" }
  ```
* **Success Response (`200 OK`):**
  ```json
  { "message": "Magic link sent" }
  ```
* **Side Effects:** Sends Supabase OTP magic link pointing to `/api/auth/callback`.

#### `GET /api/auth/callback`
* **Auth Required:** No
* **Query Params:** `?code=<supabase_auth_code>`
* **Behavior:** Exchanges code for tokens via `locals.supabase.auth.exchangeCodeForSession(code)`, sets HTTP-only cookies, and returns a redirect to `/dashboard` (or `/login` on error).

#### `POST /api/auth/logout`
* **Auth Required:** No (reads session if present)
* **Behavior:** Calls `locals.supabase.auth.signOut()`, deletes `sb-access-token` and `sb-refresh-token` cookies with `path: '/'`, and redirects `302` to `/`.

---

### 4.2 Cards Management Endpoints (`/api/cards/*`)

#### `GET /api/cards`
* **Auth Required:** Yes (`locals.user` must exist)
* **Response (`200 OK`):** Array of card objects belonging to `locals.user.id`, ordered by `created_at DESC`.

#### `POST /api/cards`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "category": "birthday",
    "recipient_name": "Sarah Connor",
    "sender_name": "John Connor",
    "message": "Happy Birthday Mom!",
    "event_date": "2026-10-15",
    "theme_config": {
      "primaryColor": "#c084fc",
      "secondaryColor": "#f472b6",
      "backgroundColor": "#1c1c28",
      "fontFamily": "sans",
      "backgroundPattern": "confetti",
      "unboxStyle": "envelope",
      "audioTrackId": "warm-piano",
      "externalAudioUrl": null
    },
    "media_urls": ["https://pub-xxxx.r2.dev/cards/.../photo.webp"]
  }
  ```
* **Validation & Slug Generation:**
  * Checks category against whitelist: `birthday`, `anniversary`, `graduation`, `invitation`.
  * Restricts `media_urls` to a maximum of 4 items.
  * Generates custom slug: `sanitize(recipient_name)-category-randomSuffix(4)`.
  * Runs collision-check loop against `cards.slug` (up to 5 attempts).
* **Response (`201 Created`):** Newly created card record.

#### `GET /api/cards/[id]`
* **Auth Required:** No (RLS filters visibility)
* **Response (`200 OK`):** Card record matching UUID `id`.

#### `PATCH /api/cards/[id]`
* **Auth Required:** Yes (must own card)
* **Request Payload:** Partial card properties. Fields `id`, `user_id`, `slug`, and `created_at` are stripped before update.
* **Response (`200 OK`):** Updated card record.

#### `DELETE /api/cards/[id]`
* **Auth Required:** Yes (must own card)
* **Response (`200 OK`):** `{ "success": true }`.

#### `GET /api/cards/by-slug/[slug]`
* **Auth Required:** No (Public endpoint)
* **Behavior:** Queries `cards` where `slug = slug` and `is_published = true`.
* **Response (`200 OK`):** Card record.

---

### 4.3 Profile & Storage Endpoints

#### `POST /api/profile/update`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  { "full_name": "Sarah Connor", "avatar_url": "https://pub-xxxx.r2.dev/avatars/.../avatar.webp" }
  ```
* **Behavior:**
  1. Updates `public.profiles` row where `id = locals.user.id`.
  2. Synchronizes data to Supabase Auth metadata via `locals.supabase.auth.updateUser({ data: ... })` so active JWT sessions reflect the changes without re-login.
* **Response (`200 OK`):** `{ "success": true, "profile": { ... } }`.

#### `POST /api/storage/presigned-url`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "filename": "photo-1.webp",
    "contentType": "image/webp",
    "folder": "cards" // "cards" | "avatars"
  }
  ```
* **Validation:** Enforces `.webp` extension and `image/webp` content type.
* **Key Format:** `{folder}/{userId}/{Date.now()}-{filename}`
* **Response (`200 OK`):**
  ```json
  {
    "uploadUrl": "https://<account_id>.r2.cloudflarestorage.com/<bucket>/<key>?X-Amz-Signature=...",
    "publicUrl": "https://<r2_public_domain>/<key>",
    "key": "cards/123e4567-e89b-12d3-a456-426614174000/1772718000000-photo-1.webp"
  }
  ```

---

### 4.4 Guestbook Wishes Endpoints (`/api/wishes/*`)

#### `GET /api/wishes/[cardId]`
* **Auth Required:** No (Public for published cards)
* **Response (`200 OK`):** Array of wishes ordered by `created_at DESC`.

#### `POST /api/wishes/[cardId]`
* **Auth Required:** No (Guestbook open to public)
* **Validation:** `sender_name` (max 100 chars), `message` (max 500 chars). Verifies the card exists and `is_published = true`.
* **Response (`201 Created`):** Newly created wish record.

---

## 5. Database & Cloudflare R2 Integration

### 5.1 Supabase PostgreSQL Schema

The database is built on PostgreSQL with Row Level Security (RLS) enabled on all public tables.

```
┌──────────────────────────────────────┐
│            auth.users                │
└──────────────────┬───────────────────┘
                   │ 1:1 on delete cascade
                   ▼
┌──────────────────────────────────────┐       1:N       ┌──────────────────────────────────────┐
│           public.profiles            │ ──────────────> │             public.cards             │
├──────────────────────────────────────┤                 ├──────────────────────────────────────┤
│ id         : uuid (PK, FK auth.users)│                 │ id             : uuid (PK, default)  │
│ email      : text                    │                 │ user_id        : uuid (FK auth.users)│
│ full_name  : text                    │                 │ slug           : text (UNIQUE, INDEX) │
│ avatar_url : text (NULLABLE)         │                 │ category       : text (CHECK ENUM)   │
│ created_at : timestamptz             │                 │ recipient_name : text                │
└──────────────────────────────────────┘                 │ sender_name    : text                │
                                                         │ message        : text                │
                                                         │ event_date     : date (NULLABLE)     │
                                                         │ theme_config   : jsonb               │
                                                         │ media_urls     : text[]              │
                                                         │ is_published   : boolean (default T) │
                                                         │ created_at     : timestamptz         │
                                                         └──────────────────┬───────────────────┘
                                                                            │ 1:N on delete cascade
                                                                            ▼
                                                         ┌──────────────────────────────────────┐
                                                         │            public.wishes             │
                                                         ├──────────────────────────────────────┤
                                                         │ id          : uuid (PK, default)     │
                                                         │ card_id     : uuid (FK cards, INDEX) │
                                                         │ sender_name : text                   │
                                                         │ message     : text                   │
                                                         │ created_at  : timestamptz            │
                                                         └──────────────────────────────────────┘
```

#### Table Definitions & Constraints

1. **`public.profiles`**
   * Columns: `id` (uuid, PK, ref `auth.users(id)`), `email` (text), `full_name` (text, default `''`), `avatar_url` (text, nullable), `created_at` (timestamptz, default `now()`).
   * Trigger: `on_auth_user_created` executes `handle_new_user()` on `AFTER INSERT ON auth.users`. Auto-populates `full_name` and `avatar_url` from `raw_user_meta_data`.
   * RLS Policies:
     * `Users can view own profile`: `SELECT FOR auth.uid() = id`
     * `Users can update own profile`: `UPDATE FOR auth.uid() = id`

2. **`public.cards`**
   * Columns: `id` (uuid, PK), `user_id` (uuid, ref `auth.users(id)`), `slug` (text, unique), `category` (text, check: `'birthday'`, `'anniversary'`, `'graduation'`, `'invitation'`), `recipient_name` (text), `sender_name` (text), `message` (text), `event_date` (date, nullable), `theme_config` (jsonb), `media_urls` (text[], default `'{}'`), `is_published` (boolean, default `true`), `created_at` (timestamptz).
   * Indexes: `idx_cards_slug` ON `cards(slug)`, `idx_cards_user_id` ON `cards(user_id)`.
   * RLS Policies:
     * `Public can view published cards`: `SELECT FOR is_published = true`
     * `Owners can view all own cards`: `SELECT FOR auth.uid() = user_id`
     * `Authenticated users can create cards`: `INSERT WITH CHECK auth.uid() = user_id`
     * `Owners can update own cards`: `UPDATE FOR auth.uid() = user_id`
     * `Owners can delete own cards`: `DELETE FOR auth.uid() = user_id`

3. **`public.wishes`**
   * Columns: `id` (uuid, PK), `card_id` (uuid, ref `public.cards(id)` on delete cascade), `sender_name` (text), `message` (text), `created_at` (timestamptz).
   * Indexes: `idx_wishes_card_id` ON `wishes(card_id)`.
   * RLS Policies:
     * `Public can view wishes for published cards`: `SELECT` where exists in published cards.
     * `Anyone can submit wishes`: `INSERT WITH CHECK` where exists in published cards.
     * `Card owners can delete wishes`: `DELETE` where card's `user_id = auth.uid()`.

---

### 5.2 Cloudflare R2 Storage Pipeline

```
[ User selects Image ] 
         │
         ▼
[ Client-side Compression (image-compress.ts) ]
   ├── Downscale to max 1080px (or 400px for avatar)
   ├── Transcode to WebP (quality 0.8)
   └── Verify size <= 200KB (or 100KB for avatar)
         │
         ▼
[ Request Presigned URL ] ────> POST /api/storage/presigned-url
                                     │
                                     ▼
                     [ S3 PutObjectCommand Presigned (r2.ts) ]
                     TTL: 300 seconds
                                     │
         ┌───────────────────────────┘
         ▼
[ Direct Client Upload ] ─────> HTTP PUT (image/webp) ────> [ Cloudflare R2 Bucket ]
                                                                     │
[ Storage Key: cards/{userId}/{timestamp}-{filename}.webp ]         │
                                                                     ▼
[ Public URL: https://{R2_PUBLIC_DOMAIN}/{key} ] <───────────────────┘
```

* **S3 Client Endpoint:** `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
* **Region:** `auto`
* **Bucket:** Configured via `R2_BUCKET_NAME` (e.g., `elcelebrate-assets`)
* **Public Domain:** Configured via `R2_PUBLIC_DOMAIN` (e.g., `https://pub-xxxx.r2.dev` or custom domain)

---

## 6. Current UI/UX & Component State

### 6.1 Key Components Breakdown

1. **`Navbar.astro` (`src/components/layout/Navbar.astro`):**
   * **State Resolution:** Evaluates `Astro.props.user || Astro.locals.user` and `Astro.locals.profile`.
   * **Logged In View:**
     * "My Cards" link (highlighted when on `/dashboard`).
     * "Create Card" CTA button with gradient styling.
     * User profile avatar pill (displays custom R2 avatar image or first-name initial circle).
     * Accessible dropdown menu: User full name, email, link to Dashboard, link to Edit Profile (`/dashboard/profile`), and Sign Out form action (`POST /api/auth/logout`).
     * Mobile drawer menu with active route indicators and profile details.
   * **Logged Out View:**
     * "Sign In" link (`/login`).
     * "Get Started" gradient button (`/signup`).

2. **Card Creation Studio (`src/pages/dashboard/create.astro`):**
   * **State Machine:** Governed by client-side `CardState` object holding `category`, `themeConfig`, `photos`, `recipientName`, `senderName`, `message`, and `eventDate`.
   * **5 Steps Wizard:**
     * **Step 1 (Category):** Birthday, Anniversary, Graduation, Invitation selection.
     * **Step 2 (Theme):** Primary/Secondary hex color inputs with live preview, background patterns (`confetti`, `hearts`, `stars`, `dots`, `waves`), font style selector (`Inter`, `Georgia`, `cursive`, `Outfit`), and unboxing animation style (`envelope`, `giftbox`, `ribbon`).
     * **Step 3 (Media):** Drag-and-drop file uploader with live compression progress bar, photo grid preview, and individual remove buttons.
     * **Step 4 (Message & Audio):** Recipient/sender inputs, multiline message textarea, event date picker, curated Opus audio track selector with mood info, or external link input.
     * **Step 5 (Preview & Publish):** Final card summary check and one-click publish handler.
   * **Live Preview Simulator:** Fixed/sticky right-column viewport featuring realistic mobile device frames with an **iPhone / Android** toggle, dynamically updating styles and layouts in real-time as the user types or adjusts colors.

3. **Public Card Experience (`src/pages/c/[slug].astro`):**
   * **Unbox Transition:** Fullscreen overlay displaying the selected 3D unboxing animation:
     * `envelope`: Flap perspective flip (`rotateX(-180deg)`).
     * `giftbox`: Lid lift and perspective tilt.
     * `ribbon`: Vertical and horizontal ribbon unwrap.
   * **Celebration Effects:** Triggers dual-burst celebratory confetti via `canvas-confetti` immediately upon unboxing.
   * **Autoplay Music:** Plays configured background audio loop (compliant with browser autoplay policies since playback starts upon the user's unbox click) with an interactive floating sound mute/unmute control.
   * **Countdown Timer:** Live client-side timer counting down days, hours, minutes, and seconds to `event_date`.
   * **Guestbook Wall:** Real-time wish submission form with instant DOM insertion without requiring page reload.

4. **Design System & Tokens (`src/styles/global.css`):**
   * Uses Tailwind CSS v4 CSS variables for dark-mode surface palette (`--color-surface-900` down to `--color-surface-50`).
   * Custom glassmorphic utilities (`.glass`, `.glass-light`) with backdrop blur and border alpha.
   * CSS keyframe animations: `@keyframes float`, `shimmer`, `confetti-fall`, `envelope-flip`, `ribbon-pull`, `gift-lid`, `fade-in-up`, `fade-in-scale`.
   * Single-rule form input styling (`.form-input`, `.form-text`, `.form-input-error`) preventing Tailwind v4 class-conflict warnings.

---

## 7. Pending Tasks & Known Issues

1. **Audio Track Static Asset Files:**
   * `src/lib/audio-tracks.ts` defines 8 curated tracks pointing to `/audio/*.opus` (e.g., `warm-piano.opus`, `gentle-strings.opus`).
   * *Status:* The `public/audio/` directory is not yet created in the project repository. Audio playback will 404 until audio files are placed in `public/audio/`.
2. **Card Editing UI in Dashboard:**
   * `/api/cards/[id]` provides full `PATCH` and `DELETE` support.
   * *Status:* The cards grid on `/dashboard` currently provides "View" and "Copy Link" buttons, but lacks an "Edit" button leading to an edit interface or an edit modal.
3. **Card Unpublishing / Draft Toggle:**
   * The database supports `is_published` (`boolean default true`).
   * *Status:* The UI lacks an in-dashboard toggle to unpublish or archive a card without deleting it.
4. **Password Reset / Forgot Password:**
   * Login provides password login and passwordless Magic Link (OTP).
   * *Status:* No dedicated "Forgot Password" self-service flow (request reset email & set new password) is currently implemented.
5. **Monetization & Quotas:**
   * Architecture is strictly zero-cost tier.
   * *Status:* No payment gateway (Stripe, LemonSqueezy, Midtrans) is integrated yet for premium card templates or higher photo limits.
6. **Card Themes / Presets:**
   * Card styling relies on individual color pickers and pattern selectors.
   * *Status:* Pre-bundled theme presets (e.g., "Midnight Romance", "Golden Gala", "Retro Neon") would accelerate card creation.

---

*This document serves as the authoritative technical context for the ElCelebrate codebase. All paths, schemas, and signatures reflect the active code.*
