import type { Card, Wish } from './types';

/**
 * Canonical Showcase Wedding Card: Raden & Arum
 *
 * Dedicated read-only demonstrator representing the peak editorial boutique
 * stationery experience in ElCelebrate. Used on the Homepage Interactive Hero
 * Studio, the Dashboard guest/user showcases, and the public /c/demo-wedding route.
 */
export const SHOWCASE_WEDDING_CARD: Readonly<Card> = {
  id: 'showcase-wedding-card-001',
  user_id: '00000000-0000-0000-0000-000000000000',
  slug: 'demo-wedding',
  category: 'wedding',
  recipient_name: 'Raden & Arum',
  sender_name: 'Keluarga Besar Atmojo & Kusuma',
  message: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.',
  event_date: '2026-10-24',
  is_published: true,
  created_at: '2026-10-19T00:00:00.000Z',
  media_urls: [
    // 0: Couple Cover / Hero Banner
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=75',
    // 1: Bride Portrait (Arum)
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=75',
    // 2: Groom Portrait (Raden)
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=75',
    // 3: Prewedding Gallery 1 (Traditional elegance)
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=75',
    // 4: Prewedding Gallery 2 (Ring details & hands)
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=75',
    // 5: Prewedding Gallery 3 (Garden walk)
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=75',
    // 6: Prewedding Gallery 4 (Floral arch)
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=75',
    // 7: Prewedding Gallery 5 (Sunset romantic gaze)
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=75',
    // 8: Prewedding Gallery 6 (Classic architecture)
    'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=600&q=75',
    // 9: Prewedding Gallery 7 (Intimate moment)
    'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=600&q=75',
    // 10: Prewedding Gallery 8 (Celebration confetti / banquet)
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  ],
  theme_config: {
    primaryColor: '#f5c563',
    secondaryColor: '#d4af37',
    backgroundColor: '#0f0d15',
    fontFamily: 'serif',
    backgroundPattern: 'kawung',
    cornerOrnament: 'diamond-frame',
    ambientEffect: 'champagne-dust',
    unboxStyle: 'envelope',
    unboxingStyle: 'wax-seal',
    audioTrackId: 'wedding',
    externalAudioUrl: null,
    audioStartTime: 0,
    weddingHeaderTitle: 'The Wedding Celebration of',
    weddingData: {
      bride: {
        fullName: 'Roro Arum Kusumawardhani, M.Psi.',
        nickname: 'Arum',
        parents: 'Putri dari Bpk. K.R.T. Hendra Kusuma & Ibu Hj. Ratna Sari',
      },
      groom: {
        fullName: 'Raden Mas Suryo Atmojo, S.Ars.',
        nickname: 'Raden',
        parents: 'Putra dari Bpk. Ir. Bambang Atmojo & Ibu Dewi Anggraini',
      },
      openingGreeting: 'Assalamu’alaikum Warahmatullahi Wabarakatuh. Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan putra-putri kami.',
      sacredQuote: {
        enabled: true,
        quote: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
        source: 'QS. Ar-Rum: 21',
      },
      loveStory: 'Pertemuan dua insan dalam ikatan suci yang dipenuhi berkah dan restu keluarga.',
      loveStoryTimeline: [
        {
          year: '2023',
          title: 'Pertemuan Pertama',
          story: 'Berawal dari sebuah diskusi arsitektur dan psikologi di Yogyakarta, benih ketertarikan mulai tumbuh.',
        },
        {
          year: '2025',
          title: 'Ikatan Lamaran',
          story: 'Dua keluarga besar resmi bersilaturahmi dan mengikat komitmen suci menuju jenjang pernikahan.',
        },
        {
          year: '2026',
          title: 'Menuju Pelaminan',
          story: 'Mengucap janji suci akad nikah untuk saling menyempurnakan ibadah seumur hidup.',
        },
      ],
      akadEvent: {
        date: '2026-10-24',
        timeStart: '08:00',
        timeEnd: '10:00 WIB',
        venue: 'Masjid Agung Al-Azhar',
        address: 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan',
        mapsUrl: 'https://maps.google.com/?q=Masjid+Agung+Al-Azhar+Jakarta',
      },
      receptionEvent: {
        date: '2026-10-24',
        timeStart: '19:00',
        timeEnd: '21:30 WIB',
        venue: 'Grand Ballroom The Dharmawangsa',
        address: 'Jl. Brawijaya Raya No. 26, Kebayoran Baru, Jakarta Selatan',
        mapsUrl: 'https://maps.google.com/?q=The+Dharmawangsa+Jakarta',
      },
      dresscode: {
        enabled: true,
        colors: ['#f5c563', '#d4c4b5', '#8c7a6b', '#181522'],
        note: 'Busana Formal Malam bernuansa Champagne Gold, Warm Beige, atau Batik Nusantara.',
      },
      digitalEnvelope: {
        bankName: 'BCA',
        accountNumber: '8720192837',
        accountHolder: 'a.n. Roro Arum Kusumawardhani',
      },
      turutMengundang: 'Keluarga Besar Keraton Yogyakarta\nKeluarga Besar Bpk. Prof. Dr. Budiman\nRekan Sejawat Ikatan Arsitek Indonesia (IAI)',
    },
  },
};

/**
 * Curated sample wishes for the showcase demonstrator
 */
export const SHOWCASE_WEDDING_WISHES: ReadonlyArray<Wish> = [
  {
    id: 'showcase-wish-001',
    card_id: 'showcase-wedding-card-001',
    sender_name: 'Dinda & Fajar Pratama',
    attendance: 'Hadir',
    message: 'Barakallahu lakuma wa baraka alaikuma wa jama’a bainakuma fii khoir. Selamat menempuh hidup baru Raden & Arum! Semoga senantiasa sakinah, mawaddah, warahmah.',
    created_at: '2026-10-18T10:15:00.000Z',
  },
  {
    id: 'showcase-wish-002',
    card_id: 'showcase-wedding-card-001',
    sender_name: 'Bima Satria (IAI Jakarta)',
    attendance: 'Hadir',
    message: 'Selamat berbahagia Mas Raden & Mbak Arum! Desain undangannya sangat berkelas dan elegan. Semoga langgeng hingga kakek nenek.',
    created_at: '2026-10-18T14:30:00.000Z',
  },
  {
    id: 'showcase-wish-003',
    card_id: 'showcase-wedding-card-001',
    sender_name: 'Keluarga Besar Hendra Kusuma',
    attendance: 'Hadir',
    message: 'Doa terbaik kami untuk kedua ananda tercinta. Semoga perjalanan rumah tangga senantiasa dilimpahi keberkahan dan kebahagiaan abadi.',
    created_at: '2026-10-18T16:00:00.000Z',
  },
];

/**
 * Format Google Calendar URL for 1-tap calendar CTA
 */
export function formatGoogleCalendarUrl(event: {
  title: string;
  date?: string;
  timeStart?: string;
  timeEnd?: string;
  venue?: string;
  address?: string;
  description?: string;
}): string {
  if (!event.date) return '#';
  const rawDate = event.date.replace(/-/g, '');
  let startStr = rawDate;
  let endStr = rawDate;

  if (event.timeStart) {
    const sTime = event.timeStart.replace(/:/g, '').padEnd(4, '0') + '00';
    startStr = `${rawDate}T${sTime}`;
    if (event.timeEnd) {
      const eTime = event.timeEnd.replace(/:/g, '').padEnd(4, '0') + '00';
      endStr = `${rawDate}T${eTime}`;
    } else {
      const [sh, sm] = event.timeStart.split(':').map(Number);
      const eh = String(((sh || 0) + 2) % 24).padStart(2, '0');
      const em = String(sm || 0).padStart(2, '0');
      endStr = `${rawDate}T${eh}${em}00`;
    }
  }

  const location = [event.venue, event.address].filter(Boolean).join(', ');
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    ...(location ? { location } : {}),
    ...(event.description ? { details: event.description } : {}),
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

