/* ═══════════════════════════════════════════════════════════
   ElCelebrate — Shared TypeScript Types
   ═══════════════════════════════════════════════════════════ */

export type CardCategory = 'birthday' | 'anniversary' | 'graduation' | 'invitation' | 'wedding' | 'love' | 'greetings';

export type UnboxStyle = 'envelope' | 'giftbox' | 'ribbon';

export type AmbientEffectType = 'petals' | 'golden-sparkles' | 'hearts' | 'confetti-float' | 'starlight' | 'lanterns' | 'butterflies' | 'bokeh' | 'sparklers' | 'snowfall' | 'hearts-petals' | 'jasmine' | 'beras-kuning' | 'keraton-glow' | 'fireflies' | 'none';

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
}

export type WeddingConfig = WeddingData;

export interface InteractiveConfessionConfig {
  enabled: boolean;
  prompt?: string;
  yesText?: string;
  noText?: string;
}

export type GreetingsOccasion = 'idul-fitri' | 'natal-tahun-baru' | 'hari-ibu-ayah' | 'general' | string;

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
  ambientEffect?: AmbientEffectType;
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
