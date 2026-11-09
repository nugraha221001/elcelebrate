/* ═══════════════════════════════════════════════════════════
   ElCelebrate — Official Duration-Based Pricing Tiers
   ═══════════════════════════════════════════════════════════ */

export interface PricingTier {
  days: number;
  price: number;
  name: string;
  badge?: string;
  description: string;
}

export const DURATION_TIERS: ReadonlyArray<PricingTier> = [
  {
    days: 3,
    price: 5000,
    name: 'Paket Kilat 3 Hari',
    description: 'Cocok untuk syukuran singkat atau perayaan akhir pekan',
  },
  {
    days: 7,
    price: 10000,
    name: 'Paket Mingguan 7 Hari',
    badge: 'Populer',
    description: 'Ideal untuk pesta ulang tahun dan acara wisuda',
  },
  {
    days: 14,
    price: 18000,
    name: 'Paket Dua Minggu 14 Hari',
    description: 'Waktu leluasa bagi kerabat mengonfirmasi RSVP',
  },
  {
    days: 30,
    price: 29000,
    name: 'Paket Sebulan 30 Hari',
    badge: 'Terbaik',
    description: 'Standar emas untuk persiapan pesta & undangan pernikahan',
  },
  {
    days: 45,
    price: 39000,
    name: 'Paket Spesial 45 Hari',
    description: 'Jangkauan lebih panjang untuk keluarga luar kota',
  },
  {
    days: 60,
    price: 49000,
    name: 'Paket Ekstra 60 Hari',
    badge: 'Maksimal',
    description: 'Masa aktif maksimal dua bulan penuh tanpa khawatir',
  },
];

export function getTierByDays(days: number): PricingTier {
  const tier = DURATION_TIERS.find((t) => t.days === days);
  return tier || DURATION_TIERS[1]; // default 7 days
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

