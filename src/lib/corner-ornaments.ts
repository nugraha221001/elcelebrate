import type { CornerOrnamentType } from './types';

export interface CornerOrnamentOption {
  id: CornerOrnamentType;
  label: string;
  emoji: string;
  desc: string;
}

export const CORNER_ORNAMENTS: CornerOrnamentOption[] = [
  {
    id: 'none',
    emoji: '✕',
    label: 'None',
    desc: 'No corner ornament',
  },
  {
    id: 'botanical',
    emoji: '🌿',
    label: 'Botanical Leafy',
    desc: 'Organic drifting leafy branch with gentle breeze sway',
  },
  {
    id: 'keraton',
    emoji: '🏛️',
    label: 'Keraton Floral',
    desc: 'Intricate royal Javanese/Jepara carved floral scroll motif',
  },
  {
    id: 'melati',
    emoji: '🤍',
    label: 'Ronce Melati',
    desc: 'Sacred wedding jasmine buds & betel leaf garland with subtle pulse',
  },
  {
    id: 'pucukrebung',
    emoji: '🎋',
    label: 'Pucuk Rebung',
    desc: 'Traditional Minang chevron corner brocade',
  },
  {
    id: 'artdeco',
    emoji: '⚜️',
    label: 'Art Deco Gatsby',
    desc: 'Symmetrical geometric luxury Gatsby lines',
  },
  {
    id: 'baroque',
    emoji: '👑',
    label: 'Baroque Flourish',
    desc: 'Royal Victorian floral filigree flourish',
  },
  {
    id: 'diamond-frame',
    emoji: '💎',
    label: 'Diamond Frame',
    desc: 'Minimalist dual-stroke lines with center diamond stud',
  },
  {
    id: 'celestial',
    emoji: '🌙',
    label: 'Celestial Starburst',
    desc: 'Starburst & crescent moon corner accents',
  },
  {
    id: 'gunungan',
    emoji: '🏔️',
    label: 'Gunungan Wayang',
    desc: 'Stylized traditional Indonesian gunungan finial',
  },
  {
    id: 'mandala',
    emoji: '🏵️',
    label: 'Mandala Lace',
    desc: 'Symmetrical lace filigree rosette corner',
  },
];

/**
 * Returns raw inner SVG markup for a single top-left corner (0 0 120 120 coordinate space).
 * Mirroring transforms handle the other 3 corners.
 */
export function getCornerOrnamentSvgContent(motif: string): string {
  switch (motif) {
    case 'botanical':
      return `
        <!-- Main Stems -->
        <path d="M-5 -5 C25 20, 55 35, 105 45" stroke="url(#corner-grad)" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M-5 -5 C20 35, 35 68, 45 108" stroke="url(#corner-grad)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <!-- Leaves with Gradient Fills & Outlines -->
        <path d="M30 22 C42 12, 62 14, 70 26 C60 32, 42 32, 30 22 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M62 34 C78 26, 95 30, 102 42 C88 48, 72 44, 62 34 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M20 40 C12 54, 16 72, 26 80 C34 68, 30 50, 20 40 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M30 70 C22 84, 26 100, 38 104 C44 92, 40 78, 30 70 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M14 14 C22 4, 38 6, 44 16 C36 21, 24 21, 14 14 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1"/>
        <!-- Accent Berries & Pistils -->
        <circle cx="106" cy="46" r="3" fill="#f5c563" />
        <circle cx="46" cy="110" r="2.5" fill="#f5c563" />
        <circle cx="72" cy="18" r="2" fill="#f5c563" fill-opacity="0.85" />
        <circle cx="16" cy="72" r="2" fill="#f5c563" fill-opacity="0.85" />
      `;

    case 'keraton':
      return `
        <!-- Sweeping Royal Javanese Floral Lung-lungan -->
        <path d="M 0 0 C 35 15, 75 22, 92 52 C 102 72, 90 92, 72 86 C 58 80, 62 62, 75 62 C 84 62, 86 72, 80 76" stroke="url(#corner-grad)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M 0 0 C 15 35, 22 75, 52 92 C 72 102, 92 90, 86 72 C 80 58, 62 62, 62 75 C 62 84, 72 86, 76 80" stroke="url(#corner-grad)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <!-- Central Rib Ridge -->
        <path d="M 0 0 C 25 25, 45 45, 68 68" stroke="url(#corner-grad)" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
        <!-- Jepara Carved Acanthus Petals -->
        <path d="M 12 4 C 26 2, 42 10, 48 24 C 36 24, 24 16, 12 4 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M 4 12 C 2 26, 10 42, 24 48 C 24 36, 16 24, 4 12 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M 44 18 C 62 16, 80 28, 85 44 C 72 44, 58 34, 44 18 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M 18 44 C 16 62, 28 80, 44 85 C 44 72, 34 58, 18 44 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <!-- Royal Jepara Rosette Crest -->
        <path d="M 6 6 C 18 2, 26 10, 24 22 C 16 26, 6 22, 6 6 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.4"/>
        <circle cx="16" cy="16" r="3.5" fill="#f5c563" />
        <circle cx="16" cy="16" r="1.5" fill="#0f0d15" />
        <!-- Ornate Jewel Nodes -->
        <circle cx="94" cy="54" r="2.5" fill="#f5c563" />
        <circle cx="54" cy="94" r="2.5" fill="#f5c563" />
        <circle cx="70" cy="70" r="3" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2" />
      `;

    case 'melati':
      return `
        <!-- Paired Betel Leaves (Sirih) at Corner -->
        <path d="M 0 0 C 18 4, 38 18, 42 36 C 28 36, 14 22, 0 0 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.5"/>
        <path d="M 0 0 C 4 18, 18 38, 36 42 C 36 28, 22 14, 0 0 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.5"/>
        <path d="M 0 0 Q 22 16, 42 36" stroke="url(#corner-grad)" stroke-width="1" stroke-opacity="0.8" fill="none"/>
        <path d="M 0 0 Q 16 22, 36 42" stroke="url(#corner-grad)" stroke-width="1" stroke-opacity="0.8" fill="none"/>
        <!-- Draping Jasmine Garland Chains -->
        <path d="M 0 48 Q 42 42, 85 0" stroke="url(#corner-grad)" stroke-width="1.4" stroke-dasharray="1 4" stroke-linecap="round" fill="none"/>
        <path d="M 0 82 Q 58 72, 108 0" stroke="url(#corner-grad)" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        <path d="M 0 110 Q 75 95, 115 28" stroke="url(#corner-grad)" stroke-width="1.2" stroke-dasharray="2 3" fill="none"/>
        <!-- Sacred Wedding Jasmine Buds (Ronce Melati) -->
        <ellipse cx="28" cy="38" rx="3.5" ry="5.5" transform="rotate(-35 28 38)" fill="#ffffff" fill-opacity="0.9" stroke="url(#corner-grad)" stroke-width="1"/>
        <ellipse cx="58" cy="24" rx="3.5" ry="5.5" transform="rotate(-65 58 24)" fill="#ffffff" fill-opacity="0.9" stroke="url(#corner-grad)" stroke-width="1"/>
        <ellipse cx="22" cy="74" rx="4" ry="6" transform="rotate(-25 22 74)" fill="#ffffff" fill-opacity="0.9" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <ellipse cx="52" cy="58" rx="4" ry="6" transform="rotate(-45 52 58)" fill="#ffffff" fill-opacity="0.9" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <ellipse cx="82" cy="32" rx="4" ry="6" transform="rotate(-70 82 32)" fill="#ffffff" fill-opacity="0.9" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <ellipse cx="36" cy="98" rx="3" ry="5" transform="rotate(-30 36 98)" fill="#ffffff" fill-opacity="0.85" stroke="url(#corner-grad)" stroke-width="1"/>
        <ellipse cx="78" cy="80" rx="3.5" ry="5.5" transform="rotate(-55 78 80)" fill="#ffffff" fill-opacity="0.85" stroke="url(#corner-grad)" stroke-width="1"/>
        <ellipse cx="106" cy="48" rx="3" ry="5" transform="rotate(-75 106 48)" fill="#ffffff" fill-opacity="0.85" stroke="url(#corner-grad)" stroke-width="1"/>
        <!-- Corner Jasmine Star Flower -->
        <circle cx="16" cy="16" r="3" fill="#f5c563" />
        <circle cx="16" cy="11" r="2.2" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="0.8"/>
        <circle cx="21" cy="16" r="2.2" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="0.8"/>
        <circle cx="16" cy="21" r="2.2" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="0.8"/>
        <circle cx="11" cy="16" r="2.2" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="0.8"/>
        <circle cx="38" cy="67" r="2" fill="#f5c563"/>
        <circle cx="68" cy="44" r="2" fill="#f5c563"/>
      `;

    case 'pucukrebung':
      return `
        <!-- Diagonal Chevron Border Bars -->
        <line x1="0" y1="116" x2="116" y2="0" stroke="url(#corner-grad)" stroke-width="2" />
        <line x1="0" y1="106" x2="106" y2="0" stroke="url(#corner-grad)" stroke-width="1" stroke-dasharray="2 2" />
        <line x1="0" y1="62" x2="62" y2="0" stroke="url(#corner-grad)" stroke-width="1.4" />
        <line x1="0" y1="20" x2="20" y2="0" stroke="url(#corner-grad)" stroke-width="1.5" />
        <!-- Gigi Harimau (Serrated Chevron Teeth) -->
        <path d="M 0 106 L 8 100 L 16 106 L 24 100 L 32 106 L 40 100 L 48 106 L 56 100 L 64 106 L 72 100 L 80 106 L 88 100 L 96 106 L 104 100 L 106 106" stroke="url(#corner-grad)" stroke-width="1" fill="none"/>
        <!-- Tier 1 Chevron Apex -->
        <polygon points="0,0 26,0 38,38 0,26" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.4"/>
        <!-- Tier 2 Pucuk Rebung Spear (Bamboo Shoot Brocade) -->
        <polygon points="0,62 56,56 62,0 42,32 32,42" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.6"/>
        <!-- Tier 3 Outer Pucuk Rebung Spearhead -->
        <polygon points="0,96 82,82 96,0 72,55 55,72" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.8"/>
        <!-- Center Spear Ridge -->
        <line x1="0" y1="0" x2="88" y2="88" stroke="url(#corner-grad)" stroke-width="1.8" />
        <!-- Diamond Lozenges (Belah Ketupat Minang) -->
        <polygon points="20,12 28,20 20,28 12,20" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <polygon points="50,38 62,50 50,62 38,50" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.4"/>
        <polygon points="76,64 88,76 76,88 64,76" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.4"/>
        <circle cx="20" cy="20" r="2" fill="#f5c563"/>
        <circle cx="50" cy="50" r="2.5" fill="#f5c563"/>
        <circle cx="76" cy="76" r="3" fill="#f5c563"/>
        <circle cx="8" cy="8" r="2" fill="#f5c563"/>
      `;

    case 'artdeco':
      return `
        <!-- Gatsby Stepped Corner Anchor Frame -->
        <path d="M 0 16 H 16 V 0" stroke="url(#corner-grad)" stroke-width="2.5" fill="none"/>
        <path d="M 0 30 H 30 V 0" stroke="url(#corner-grad)" stroke-width="1.6" fill="none"/>
        <path d="M 0 44 H 44 V 0" stroke="url(#corner-grad)" stroke-width="1.2" stroke-dasharray="3 2" fill="none"/>
        <!-- Concentric Circular Arcs from Corner Vertex -->
        <path d="M 0 58 A 58 58 0 0 1 58 0" stroke="url(#corner-grad)" stroke-width="1.8" fill="none"/>
        <path d="M 0 76 A 76 76 0 0 1 76 0" stroke="url(#corner-grad)" stroke-width="2.2" fill="none"/>
        <path d="M 0 94 A 94 94 0 0 1 94 0" stroke="url(#corner-grad)" stroke-width="1.2" stroke-dasharray="2 3" fill="none"/>
        <path d="M 0 112 A 112 112 0 0 1 112 0" stroke="url(#corner-grad)" stroke-width="2" fill="none"/>
        <!-- Radiating Gatsby Sunburst Ray Lines -->
        <line x1="0" y1="0" x2="108" y2="29" stroke="url(#corner-grad)" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="0" y1="0" x2="97" y2="56" stroke="url(#corner-grad)" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="0" y1="0" x2="80" y2="80" stroke="url(#corner-grad)" stroke-width="2"/>
        <line x1="0" y1="0" x2="56" y2="97" stroke="url(#corner-grad)" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="0" y1="0" x2="29" y2="108" stroke="url(#corner-grad)" stroke-width="1.2" stroke-opacity="0.8"/>
        <!-- Central Diamond Spires on 45-degree axis -->
        <polygon points="54,42 66,54 54,66 42,54" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.5"/>
        <polygon points="76,64 88,76 76,88 64,76" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.5"/>
        <polygon points="26,18 34,26 26,34 18,26" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <!-- Polished Gold Stud Intersections -->
        <circle cx="54" cy="54" r="2.5" fill="#f5c563"/>
        <circle cx="76" cy="76" r="3" fill="#f5c563"/>
        <circle cx="0" cy="76" r="2.5" fill="#f5c563"/>
        <circle cx="76" cy="0" r="2.5" fill="#f5c563"/>
        <circle cx="0" cy="112" r="3" fill="#f5c563"/>
        <circle cx="112" cy="0" r="3" fill="#f5c563"/>
      `;

    case 'baroque':
      return `
        <!-- Baroque Corner Apex Scroll -->
        <path d="M 0 0 C 20 6, 38 18, 46 36 C 52 50, 44 64, 32 60 C 22 56, 26 42, 36 44 C 42 46, 42 54, 38 56" stroke="url(#corner-grad)" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M 0 0 C 6 20, 18 38, 36 46 C 50 52, 64 44, 60 32 C 56 22, 42 26, 44 36 C 46 42, 54 42, 56 38" stroke="url(#corner-grad)" stroke-width="2" stroke-linecap="round" fill="none"/>
        <!-- Grand Outer Volute Arms -->
        <path d="M 12 12 C 40 22, 72 26, 96 16 C 108 12, 114 20, 106 28 C 96 36, 82 32, 86 22" stroke="url(#corner-grad)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <path d="M 12 12 C 22 40, 26 72, 16 96 C 12 108, 20 114, 28 106 C 36 96, 32 82, 22 86" stroke="url(#corner-grad)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <!-- Diagonal Spine & Rococo Shell Crest -->
        <path d="M 0 0 Q 35 35, 78 78" stroke="url(#corner-grad)" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
        <path d="M 28 8 C 42 16, 54 30, 48 42 C 38 34, 32 20, 28 8 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M 8 28 C 16 42, 30 54, 42 48 C 34 38, 20 32, 8 28 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <!-- Acanthus Leaf Flourishes -->
        <path d="M 52 38 C 68 44, 82 60, 80 72 C 68 68, 60 54, 52 38 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.3"/>
        <path d="M 38 52 C 44 68, 60 82, 72 80 C 68 68, 54 60, 38 52 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.3"/>
        <!-- Royal Victorian Jewel Finials -->
        <circle cx="14" cy="14" r="3.5" fill="#f5c563"/>
        <circle cx="14" cy="14" r="1.5" fill="#ffffff"/>
        <circle cx="106" cy="20" r="2.5" fill="#f5c563"/>
        <circle cx="20" cy="106" r="2.5" fill="#f5c563"/>
        <circle cx="82" cy="76" r="3" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1"/>
        <circle cx="58" cy="18" r="2" fill="#f5c563"/>
        <circle cx="18" cy="58" r="2" fill="#f5c563"/>
      `;

    case 'diamond-frame':
      return `
        <!-- Dual Precision Border Lines with Mitred Corner -->
        <path d="M 6 114 L 6 18 L 18 6 L 114 6" stroke="url(#corner-grad)" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M 14 102 L 14 24 L 24 14 L 102 14" stroke="url(#corner-grad)" stroke-width="1.2" stroke-dasharray="4 2" stroke-linecap="round" fill="none"/>
        <!-- Fine Tertiary Accent Line -->
        <path d="M 22 88 L 22 30 L 30 22 L 88 22" stroke="url(#corner-grad)" stroke-width="0.8" stroke-opacity="0.6" fill="none"/>
        <!-- Diagonal Connector Struts -->
        <line x1="6" y1="18" x2="24" y2="14" stroke="url(#corner-grad)" stroke-width="1"/>
        <line x1="18" y1="6" x2="14" y2="24" stroke="url(#corner-grad)" stroke-width="1"/>
        <!-- Center Faceted Geometric Diamond Stud -->
        <polygon points="46,34 58,46 46,58 34,46" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.6"/>
        <polygon points="46,38 54,46 46,54 38,46" fill="#f5c563" fill-opacity="0.5" stroke="url(#corner-grad)" stroke-width="0.8"/>
        <circle cx="46" cy="46" r="2" fill="#ffffff"/>
        <!-- Satellite Diamond Studs on Frame Axis -->
        <polygon points="18,6 22,10 18,14 14,10" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <polygon points="6,18 10,22 6,26 2,22" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <polygon points="76,6 80,10 76,14 72,10" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1"/>
        <polygon points="6,76 10,80 6,84 2,80" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1"/>
        <!-- Terminal Rivet Studs -->
        <circle cx="114" cy="6" r="2.5" fill="#f5c563"/>
        <circle cx="6" cy="114" r="2.5" fill="#f5c563"/>
        <circle cx="102" cy="14" r="2" fill="#f5c563"/>
        <circle cx="14" cy="102" r="2" fill="#f5c563"/>
      `;

    case 'celestial':
      return `
        <!-- Slender Crescent Moon Cradling Corner Vertex -->
        <path d="M 8 38 C 10 20, 20 10, 38 8 C 24 16, 20 28, 26 42 C 30 50, 38 56, 44 60 C 26 56, 12 48, 8 38 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.5"/>
        <!-- 8-Point Radiant Starburst on Diagonal Axis -->
        <path d="M 64 64 L 66 52 L 72 62 L 84 64 L 72 66 L 66 76 L 64 64 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.4"/>
        <path d="M 64 64 L 56 62 L 44 64 L 56 66 L 62 76 L 64 64 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.4"/>
        <path d="M 64 64 L 62 52 L 64 44 L 66 52 L 76 56 L 64 64 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.4"/>
        <circle cx="64" cy="64" r="3" fill="#ffffff"/>
        <circle cx="64" cy="64" r="1.2" fill="#f5c563"/>
        <!-- Constellation Orbital Trajectory Arc -->
        <path d="M 0 84 A 84 84 0 0 1 84 0" stroke="url(#corner-grad)" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>
        <path d="M 0 110 A 110 110 0 0 1 110 0" stroke="url(#corner-grad)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <!-- Constellation Star Nodes -->
        <circle cx="84" cy="24" r="2.5" fill="#f5c563"/>
        <circle cx="24" cy="84" r="2.5" fill="#f5c563"/>
        <circle cx="104" cy="38" r="2" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="0.8"/>
        <circle cx="38" cy="104" r="2" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="0.8"/>
        <circle cx="16" cy="16" r="2.8" fill="#f5c563"/>
        <circle cx="110" cy="0" r="2" fill="#f5c563"/>
        <circle cx="0" cy="110" r="2" fill="#f5c563"/>
        <!-- Micro Sparkle Crosses -->
        <path d="M 48 24 L 52 24 M 50 22 L 50 26" stroke="#f5c563" stroke-width="1.2"/>
        <path d="M 24 48 L 24 52 M 22 50 L 26 50" stroke="#f5c563" stroke-width="1.2"/>
        <path d="M 94 72 L 98 72 M 96 70 L 96 74" stroke="#f5c563" stroke-width="1.2"/>
      `;

    case 'gunungan':
      return `
        <!-- Traditional Gunungan / Kayon Meru Spire along 45-degree diagonal -->
        <path d="M 4 4 L 14 0 C 26 12, 38 18, 54 32 C 68 44, 78 62, 82 82 C 62 78, 44 68, 32 54 C 18 38, 12 26, 0 14 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.8"/>
        <!-- Central Meru Tree-of-Life Axis Ridge -->
        <path d="M 6 6 Q 42 42, 88 88" stroke="url(#corner-grad)" stroke-width="2" stroke-linecap="round" fill="none"/>
        <!-- Praba Radiance Flame Curls (Blumbangan / Lidah Api) -->
        <path d="M 24 8 C 36 10, 46 22, 58 20 C 52 28, 44 32, 36 28 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M 8 24 C 10 36, 22 46, 20 58 C 28 52, 32 44, 28 36 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M 44 26 C 60 28, 74 42, 88 38 C 78 48, 68 54, 58 48 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.3"/>
        <path d="M 26 44 C 28 60, 42 74, 38 88 C 48 78, 54 68, 48 58 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.3"/>
        <!-- Gunungan Sacred Gate / Base Arc -->
        <path d="M 0 68 Q 38 58, 68 0" stroke="url(#corner-grad)" stroke-width="1.4" stroke-dasharray="3 2" fill="none"/>
        <path d="M 0 102 Q 62 92, 102 0" stroke="url(#corner-grad)" stroke-width="1.6" fill="none"/>
        <!-- Crown Finial & Sacred Mustika Jewels -->
        <circle cx="10" cy="10" r="3.5" fill="#f5c563"/>
        <circle cx="10" cy="10" r="1.5" fill="#ffffff"/>
        <circle cx="88" cy="88" r="3.2" fill="#f5c563"/>
        <circle cx="58" cy="58" r="2.5" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="1"/>
        <circle cx="102" cy="0" r="2.5" fill="#f5c563"/>
        <circle cx="0" cy="102" r="2.5" fill="#f5c563"/>
        <circle cx="48" cy="16" r="2" fill="#f5c563"/>
        <circle cx="16" cy="48" r="2" fill="#f5c563"/>
      `;

    case 'mandala':
      return `
        <!-- Tier 1 Rosette Petal Ring (Radius 30) -->
        <path d="M 0 30 C 14 30, 22 22, 22 14 C 22 6, 28 0, 30 0" stroke="url(#corner-grad)" stroke-width="1.8" fill="none"/>
        <path d="M 0 18 C 10 18, 14 14, 14 10 C 14 4, 16 0, 18 0" stroke="url(#corner-grad)" stroke-width="1.2" fill="none"/>
        <!-- Tier 2 Scalloped Lace Petal Arches (Radius 65) -->
        <path d="M 0 65 C 18 64, 30 52, 42 42 C 52 30, 64 18, 65 0" stroke="url(#corner-grad)" stroke-width="2" stroke-linecap="round" fill="none"/>
        <!-- Tier 2 Lotus Petal Lobes with Gradient Fills -->
        <path d="M 22 46 C 34 40, 44 28, 48 18 C 36 24, 26 34, 22 46 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <path d="M 46 22 C 40 34, 28 44, 18 48 C 24 36, 34 26, 46 22 Z" fill="url(#corner-fill)" stroke="url(#corner-grad)" stroke-width="1.2"/>
        <!-- Tier 3 Outer Beaded Lace Scallop Border (Radius 105) -->
        <path d="M 0 105 A 105 105 0 0 1 105 0" stroke="url(#corner-grad)" stroke-width="1.6" stroke-dasharray="2 3" fill="none"/>
        <path d="M 0 88 A 88 88 0 0 1 88 0" stroke="url(#corner-grad)" stroke-width="1.2" fill="none"/>
        <!-- Radial Mandala Ray Spokes -->
        <line x1="0" y1="0" x2="98" y2="38" stroke="url(#corner-grad)" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="0" y1="0" x2="74" y2="74" stroke="url(#corner-grad)" stroke-width="1.6"/>
        <line x1="0" y1="0" x2="38" y2="98" stroke="url(#corner-grad)" stroke-width="1.2" stroke-opacity="0.8"/>
        <!-- Droplet Pearls & Lace Rosette Beads -->
        <circle cx="12" cy="12" r="3" fill="#f5c563"/>
        <circle cx="34" cy="34" r="2.5" fill="#f5c563"/>
        <circle cx="58" cy="58" r="3" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="1"/>
        <circle cx="74" cy="74" r="3.5" fill="#f5c563"/>
        <circle cx="92" cy="92" r="2" fill="#f5c563"/>
        <circle cx="65" cy="0" r="2.5" fill="#f5c563"/>
        <circle cx="0" cy="65" r="2.5" fill="#f5c563"/>
        <circle cx="105" cy="0" r="3" fill="#f5c563"/>
        <circle cx="0" cy="105" r="3" fill="#f5c563"/>
        <circle cx="82" cy="32" r="2.2" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="0.8"/>
        <circle cx="32" cy="82" r="2.2" fill="#ffffff" stroke="url(#corner-grad)" stroke-width="0.8"/>
      `;

    default:
      return '';
  }
}

/**
 * Renders complete HTML for the 4 corners overlay with gradients and transforms.
 * @param motif The ornament type ('none', 'botanical', 'keraton', 'melati', 'pucukrebung', 'artdeco')
 * @param primaryColor Primary accent color (default: #f5c563)
 * @param secondaryColor Secondary accent color (default: #e07a93)
 * @param isPreview If true, renders relative positioning and compact sizing for phone preview
 */
export function renderCornerOrnamentsHtml(
  motif: string = 'none',
  primaryColor: string = '#f5c563',
  secondaryColor: string = '#e07a93',
  isPreview: boolean = false
): string {
  if (!motif || motif === 'none') {
    return '';
  }

  const svgContent = getCornerOrnamentSvgContent(motif);
  if (!svgContent) {
    return '';
  }

  const goldAccent = '#f5c563';
  const primaryAccent = primaryColor || goldAccent;
  const secondaryAccent = secondaryColor || '#e07a93';

  // Sizing & container classes
  const containerClass = isPreview
    ? 'pointer-events-none absolute inset-0 z-10 overflow-hidden'
    : 'pointer-events-none fixed inset-0 z-10 overflow-hidden';

  const baseSvgClass = isPreview
    ? 'preview-corner-ornament pointer-events-none z-10'
    : 'corner-ornament pointer-events-none z-10';

  const tlClass = isPreview ? `${baseSvgClass} preview-corner-ornament-tl top-0 left-0` : `${baseSvgClass} corner-ornament-tl fixed top-0 left-0`;
  const trClass = isPreview ? `${baseSvgClass} preview-corner-ornament-tr top-0 right-0` : `${baseSvgClass} corner-ornament-tr fixed top-0 right-0`;
  const blClass = isPreview ? `${baseSvgClass} preview-corner-ornament-bl bottom-0 left-0` : `${baseSvgClass} corner-ornament-bl fixed bottom-0 left-0`;
  const brClass = isPreview ? `${baseSvgClass} preview-corner-ornament-br bottom-0 right-0` : `${baseSvgClass} corner-ornament-br fixed bottom-0 right-0`;

  return `
    <div class="${containerClass}" aria-hidden="true" data-corner-motif="${motif}">
      <!-- Shared SVG Gradient Defs -->
      <svg class="absolute w-0 h-0" aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
        <defs>
          <linearGradient id="corner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9" />
            <stop offset="50%" stop-color="${goldAccent}" stop-opacity="0.8" />
            <stop offset="100%" stop-color="${secondaryAccent}" stop-opacity="0.65" />
          </linearGradient>
          <linearGradient id="corner-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primaryAccent}" stop-opacity="0.22" />
            <stop offset="100%" stop-color="${goldAccent}" stop-opacity="0.06" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Top Left -->
      <svg class="${tlClass}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${svgContent}
      </svg>

      <!-- Top Right (Mirrored Horizontally) -->
      <svg class="${trClass}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(120, 0) scale(-1, 1)">
          ${svgContent}
        </g>
      </svg>

      <!-- Bottom Left (Mirrored Vertically) -->
      <svg class="${blClass}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 120) scale(1, -1)">
          ${svgContent}
        </g>
      </svg>

      <!-- Bottom Right (Mirrored Both Axes) -->
      <svg class="${brClass}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(120, 120) scale(-1, -1)">
          ${svgContent}
        </g>
      </svg>
    </div>
  `.trim();
}
