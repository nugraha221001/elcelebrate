/* ═══════════════════════════════════════════════════════════
   ElCelebrate — Shared TypeScript Types
   ═══════════════════════════════════════════════════════════ */

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

export type AmbientEffectType = 'petals' | 'golden-sparkles' | 'hearts' | 'confetti-float' | 'starlight' | 'lanterns' | 'butterflies' | 'bokeh' | 'sparklers' | 'snowfall' | 'hearts-petals' | 'jasmine' | 'beras-kuning' | 'keraton-glow' | 'fireflies' | 'champagne-dust' | 'prism-glow' | 'sakura-drift' | 'floating-pearls' | 'aurora-mist' | 'none';

export type CornerOrnamentType = 'none' | 'botanical' | 'keraton' | 'melati' | 'pucukrebung' | 'artdeco' | 'baroque' | 'diamond-frame' | 'celestial' | 'gunungan' | 'mandala';

/** Wedding-specific structured data stored inside ThemeConfig.weddingData */
export interface WeddingEventDetail {
  date: string;       // ISO date string (YYYY-MM-DD)
  timeStart: string;  // HH:MM format
  timeEnd: string;    // HH:MM format
  venue: string;      // Venue name
  address: string;    // Full address
  mapsUrl: string;    // Google Maps URL
}

export interface WeddingDigitalEnvelope {
  bankName: string;       // Bank or e-wallet name (e.g. "BCA", "GoPay")
  accountNumber: string;  // Account number
  accountHolder: string;  // Account holder name
}

export interface WeddingData {
  bride: {
    fullName: string;
    nickname: string;
    parents: string;    // e.g. "Bapak Suharto & Ibu Sari"
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
  loveStory: string;  // Optional love story / quote
  openingGreeting: string;  // Opening greeting / Salam Pembuka
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

export type WeddingConfig = WeddingData;

export interface InteractiveConfessionConfig {
  enabled: boolean;
  prompt?: string;
  yesText?: string;
  noText?: string;
}

export type GreetingsOccasion = 'idul-fitri' | 'natal-tahun-baru' | 'imlek' | 'idul-adha' | 'waisak' | 'nyepi' | 'kemerdekaan' | 'hari-ibu-ayah' | 'get-well-soon' | 'general' | string;

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
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  filename: string;
  duration: number; // seconds
  mood: string;
  category: CardCategory[];
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  primaryColor: '#c084fc',
  secondaryColor: '#f472b6',
  backgroundColor: '#1c1c28',
  fontFamily: 'sans',
  backgroundPattern: 'none',
  unboxStyle: 'envelope',
  audioTrackId: null,
  externalAudioUrl: null,
  customAudioUrl: null,
  audioStartTime: 0,
  cornerOrnament: 'none',
};

export const CATEGORY_META: Record<CardCategory, { label: string; emoji: string; description: string }> = {
  birthday: {
    label: 'Birthday',
    emoji: '🎂',
    description: 'Celebrate another trip around the sun',
  },
  anniversary: {
    label: 'Anniversary',
    emoji: '💍',
    description: 'Honor a special milestone together',
  },
  graduation: {
    label: 'Graduation',
    emoji: '🎓',
    description: 'Congratulate an amazing achievement',
  },
  invitation: {
    label: 'Invitation',
    emoji: '✉️',
    description: 'Invite loved ones to your event',
  },
  wedding: {
    label: 'Wedding Invitation',
    emoji: '💍',
    description: 'Luxury long-scroll invitation for your big day',
  },
  love: {
    label: 'Love Letter & Confession',
    emoji: '💌',
    description: 'Express your deepest feelings',
  },
  greetings: {
    label: 'Holiday & Greetings',
    emoji: '🌙',
    description: 'Send warm wishes for any occasion',
  },
};

export interface UnboxingOption {
  id: ThematicUnboxStyle;
  emoji: string;
  label: string;
  desc: string;
}

export const CATEGORY_UNBOXING_OPTIONS: Record<CardCategory, UnboxingOption[]> = {
  wedding: [
    { id: 'gate-split', emoji: '🏛️', label: 'Royal Gate Split', desc: 'Splits laterally' },
    { id: 'curtain-lift', emoji: '✨', label: 'Curtain Lift', desc: 'Upward silk glide' },
    { id: 'wax-seal', emoji: '💌', label: 'Wax Seal Envelope', desc: 'Breaking seal flap' },
  ],
  birthday: [
    { id: 'giftbox-pop', emoji: '🎁', label: 'Luxury Gift Box Pop', desc: 'Lid lifts with pop' },
    { id: 'ribbon-untie', emoji: '🎀', label: 'Satin Ribbon Untie', desc: 'Silky ribbon unbind' },
  ],
  love: [
    { id: 'wax-seal-letter', emoji: '💌', label: 'Wax Seal Love Letter', desc: '3D stamp & unfold' },
    { id: 'folded-note', emoji: '📜', label: 'Romantic Folded Note', desc: 'Unfolds tender note' },
  ],
  graduation: [
    { id: 'diploma-scroll', emoji: '📜', label: 'Royal Diploma Scroll', desc: 'Gold ring unroll' },
    { id: 'folder-reveal', emoji: '🎓', label: 'Honor Folder Reveal', desc: 'Embossed folder open' },
  ],
  invitation: [
    { id: 'vip-sleeve', emoji: '🎟️', label: 'VIP Pass Sleeve Reveal', desc: 'Velvet pocket slide' },
    { id: 'gold-envelope', emoji: '✉️', label: 'Black & Gold Envelope', desc: 'Gold-lined flap flip' },
  ],
  anniversary: [
    { id: 'jewelry-box', emoji: '💍', label: 'Velvet Keepsake Box', desc: 'Hinged jewel shine' },
    { id: 'ribbon-untie', emoji: '🎀', label: 'Satin Ribbon Untie', desc: 'Silky ribbon unbind' },
  ],
  greetings: [
    { id: 'bifold-card', emoji: '📖', label: '3D Bifold Card Open', desc: 'Booklet gatefold swing' },
    { id: 'festive-envelope', emoji: '✨', label: 'Festive Envelope', desc: 'Glowing flap reveal' },
  ],
};

export function resolveUnboxingStyle(
  category: CardCategory | string,
  unboxingStyle?: string | null,
  legacyUnboxStyle?: string | null
): ThematicUnboxStyle {
  const cat = (category || 'birthday') as CardCategory;
  const options = CATEGORY_UNBOXING_OPTIONS[cat] || CATEGORY_UNBOXING_OPTIONS.birthday;
  const validIds = options.map((o) => o.id);

  if (unboxingStyle && validIds.includes(unboxingStyle as ThematicUnboxStyle)) {
    return unboxingStyle as ThematicUnboxStyle;
  }

  // Graceful fallback from legacy unboxStyle or category defaults
  if (legacyUnboxStyle === 'giftbox') {
    if (cat === 'anniversary') return 'jewelry-box';
    return 'giftbox-pop';
  }
  if (legacyUnboxStyle === 'ribbon') {
    return 'ribbon-untie';
  }
  if (legacyUnboxStyle === 'envelope') {
    if (cat === 'wedding') return 'gate-split';
    if (cat === 'love') return 'wax-seal-letter';
    if (cat === 'graduation') return 'diploma-scroll';
    if (cat === 'invitation') return 'gold-envelope';
    if (cat === 'greetings') return 'festive-envelope';
    if (cat === 'birthday') return 'giftbox-pop';
    if (cat === 'anniversary') return 'jewelry-box';
  }

  // Fallback to the first curated option for this category
  return options[0].id;
}
