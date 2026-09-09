/* ═══════════════════════════════════════════════════════════
   CelebrateLoop — Shared TypeScript Types
   ═══════════════════════════════════════════════════════════ */

export type CardCategory = 'birthday' | 'anniversary' | 'graduation' | 'invitation';

export type UnboxStyle = 'envelope' | 'giftbox' | 'ribbon';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: 'serif' | 'sans' | 'handwritten' | 'display';
  backgroundPattern: 'none' | 'confetti' | 'hearts' | 'stars' | 'dots' | 'waves';
  unboxStyle: UnboxStyle;
  audioTrackId: string | null;
  externalAudioUrl: string | null;
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
};
