/**
 * Images manifest — Toutou Gourmet V2
 *
 * Source de vérité pour la génération Gemini 2.5 Flash Image.
 * Chaque slot = une image à générer, avec composition, décorations,
 * ton et chemin de sortie figés.
 *
 * Prompt système : docs/prompts/gemini-image-system.md
 * Script batch   : scripts/generate-images.ts (batch 2)
 */

/** Tons alignés sur les pill colors de globals.css */
export type ImageTone = 'cream' | 'rose' | 'blue' | 'amber' | 'green'

/** Groupes de slots = sous-dossier /public/images/{group}/ */
export type ImageGroup = 'hero' | 'brands' | 'breeds' | 'articles' | 'social'

/** Éléments décoratifs signatures autorisés (cf. § 3 du prompt système) */
export type Decoration =
  | 'confetti'
  | 'party-hat'
  | 'food-bowl'
  | 'bone'
  | 'sparkle'
  | 'paw-print'

/** Ratios supportés = 1 ratio = 1 set de dimensions */
export type ImageRatio = '16:9' | '4:3' | '3:2' | '1:1' | '1.91:1'

export interface ImageSlot {
  /** Identifiant unique (= basename du fichier) */
  id: string
  /** Sous-dossier /public/images/{group}/ */
  group: ImageGroup
  /** Ratio cible pour Gemini + export webp */
  ratio: ImageRatio
  /** Ton de référence (aligné pill color) — guide Gemini + overlay runtime */
  tone: ImageTone
  /** Sujet principal — injecté dans le prompt par slot */
  subject: string
  /** Notes de composition — contraintes spatiales, zones de texte à préserver */
  composition: string
  /** Décorations à inclure (1 à 3 max selon § 3 du prompt système) */
  decorations: Decoration[]
  /** LCP = priority sur next/image — une seule par page */
  isLCP?: boolean
  /** Notes additionnelles pour variation artistique */
  notes?: string
}

/** Dimensions par ratio — utilisées à la génération + en prop next/image */
export const RATIO_DIMENSIONS: Record<ImageRatio, { w: number; h: number }> = {
  '16:9': { w: 1600, h: 900 },
  '4:3': { w: 1200, h: 900 },
  '3:2': { w: 1500, h: 1000 },
  '1:1': { w: 1000, h: 1000 },
  '1.91:1': { w: 1200, h: 630 },
}

// ============================================================
// GROUPE A — HOME (11 slots)
// ============================================================

const HOME_HERO: ImageSlot = {
  id: 'home-hero',
  group: 'hero',
  ratio: '16:9',
  tone: 'cream',
  isLCP: true,
  subject:
    'A medium-sized happy golden-coated dog sitting on a warm cream backdrop, head tilted slightly, soft natural daylight from the top-left, shallow depth of field.',
  composition:
    'Dog positioned right-third. Upper-left and lower-left quadrants are clean cream negative space for H1 overlay and stats block. Dog occupies roughly 40% of the right side.',
  decorations: ['confetti', 'sparkle', 'party-hat'],
  notes:
    'Hero of the homepage — this image defines the entire visual identity. Confetti should scatter across the upper third, party hat sits precisely on the dog\'s head in rose or amber.',
}

const BRAND_FRANKLIN: ImageSlot = {
  id: 'brand-franklin',
  group: 'brands',
  ratio: '4:3',
  tone: 'amber',
  subject:
    'A shallow ceramic bowl filled with crunchy mono-protein dog kibble, shot from a 45° angle on a warm cream linen surface with a few loose kibble pieces scattered around.',
  composition:
    'Bowl centered-right. Left side is cream negative space. Warm amber tint in the kibble.',
  decorations: ['sparkle', 'confetti'],
  notes:
    'Evokes premium mono-protein kibble. Do NOT imitate Franklin Pet Food packaging. Amber-forward palette.',
}

const BRAND_ELMUT: ImageSlot = {
  id: 'brand-elmut',
  group: 'brands',
  ratio: '4:3',
  tone: 'green',
  subject:
    'A shallow ceramic bowl filled with fresh cooked dog food (visible pieces of meat, carrots, peas, rice), shot from above, with fresh herbs scattered around on a cream linen surface.',
  composition:
    'Bowl centered. Herbs (rosemary, parsley) scattered at the edges. Shot 3/4 high angle.',
  decorations: ['food-bowl', 'sparkle'],
  notes:
    'Evokes home-cooked freshness. Green-forward palette. Do NOT imitate Elmut packaging.',
}

const BRAND_PETTY_WELL: ImageSlot = {
  id: 'brand-pettywell',
  group: 'brands',
  ratio: '4:3',
  tone: 'blue',
  subject:
    'A handful of golden kibble in the foreground with a subtle French countryside feel — wheat stalks or sunflower hints in the soft blurred background, warm daylight.',
  composition:
    'Kibble fills lower-right third. Upper half = dreamy cream/blue soft bokeh.',
  decorations: ['paw-print', 'sparkle'],
  notes:
    'Evokes 100% French origin, scientific rigor. Blue-forward palette. Do NOT imitate Petty Well packaging.',
}

const BRAND_DOG_CHEF: ImageSlot = {
  id: 'brand-dogchef',
  group: 'brands',
  ratio: '4:3',
  tone: 'rose',
  subject:
    'A handwritten-style fresh meal portion in a clear compartmented tray (meat, veggies, grains) with a small ribbon tag, shot from above on a cream surface.',
  composition:
    'Tray centered, slight tilt for editorial feel. Cream negative space around.',
  decorations: ['food-bowl', 'confetti'],
  notes:
    'Evokes tailored personalized fresh meals. Rose-forward palette. Do NOT imitate Dog Chef packaging.',
}

const BREED_LABRADOR: ImageSlot = {
  id: 'breed-labrador',
  group: 'breeds',
  ratio: '1:1',
  tone: 'amber',
  subject:
    'A chest-up portrait of a happy yellow Labrador Retriever, mouth slightly open in a smile, looking directly at camera, warm cream backdrop.',
  composition: 'Head-shoulders framing, eyes at upper third.',
  decorations: ['party-hat'],
  notes: 'Hat sits precisely on top of the head, amber color.',
}

const BREED_GOLDEN: ImageSlot = {
  id: 'breed-golden',
  group: 'breeds',
  ratio: '1:1',
  tone: 'rose',
  subject:
    'A chest-up portrait of a Golden Retriever with a soft curly coat, calm and alert expression, warm cream backdrop.',
  composition: 'Head-shoulders framing, slight 3/4 angle.',
  decorations: ['party-hat'],
  notes: 'Rose-colored party hat on the head.',
}

const BREED_BOULEDOGUE: ImageSlot = {
  id: 'breed-bouledogue',
  group: 'breeds',
  ratio: '1:1',
  tone: 'blue',
  subject:
    'A chest-up portrait of a French Bulldog with a fawn or cream coat, ears upright, curious expression.',
  composition: 'Head-shoulders framing, straight on.',
  decorations: ['paw-print'],
  notes:
    'Paw print floating near top-right corner, blue color. No party hat for this one (brachycephalic, different signature).',
}

const BREED_BERGER_AUSTRALIEN: ImageSlot = {
  id: 'breed-berger-australien',
  group: 'breeds',
  ratio: '1:1',
  tone: 'green',
  subject:
    'A chest-up portrait of an Australian Shepherd with merle coat pattern (blue merle or red merle), bright alert eyes.',
  composition: 'Head-shoulders framing, slight angle.',
  decorations: ['sparkle', 'party-hat'],
  notes: 'Green hat, sparkle near one eye.',
}

const BREED_CHIHUAHUA: ImageSlot = {
  id: 'breed-chihuahua',
  group: 'breeds',
  ratio: '1:1',
  tone: 'rose',
  subject:
    'A chest-up portrait of a small Chihuahua with large alert ears, tan or cream coat, looking confidently at camera.',
  composition: 'Head-shoulders framing, centered.',
  decorations: ['party-hat', 'sparkle'],
  notes: 'Tiny rose party hat — scale adjusted to small breed.',
}

const BREED_CAVALIER: ImageSlot = {
  id: 'breed-cavalier',
  group: 'breeds',
  ratio: '1:1',
  tone: 'amber',
  subject:
    'A chest-up portrait of a Cavalier King Charles Spaniel with long silky ears (Blenheim pattern — white with chestnut markings), gentle expression.',
  composition: 'Head-shoulders framing, slight 3/4 angle.',
  decorations: ['party-hat'],
  notes: 'Amber hat, ears framing the face softly.',
}

// ============================================================
// GROUPE B — ARTICLE COVERS PAR CATÉGORIE (8 slots)
// ============================================================

const CAT_NUTRITION: ImageSlot = {
  id: 'cat-nutrition',
  group: 'articles',
  ratio: '3:2',
  tone: 'amber',
  subject:
    'An editorial still-life: a bowl of premium dog food surrounded by key nutrients — a piece of raw meat, a small pile of rice, fresh vegetables — shot from above on cream linen.',
  composition: 'Flat lay composition, bowl slightly off-center.',
  decorations: ['confetti', 'sparkle'],
}

const CAT_SANTE: ImageSlot = {
  id: 'cat-sante',
  group: 'articles',
  ratio: '3:2',
  tone: 'green',
  subject:
    'A ceramic dog bowl next to a wooden spoon and a few natural supplements (fish oil capsules, dried herbs) on cream background.',
  composition: 'Left-side subject, right side negative space for title overlay.',
  decorations: ['sparkle', 'paw-print'],
  notes: 'Green sparkles suggesting wellness, not medical.',
}

const CAT_ALIMENTATION: ImageSlot = {
  id: 'cat-alimentation',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  subject:
    'A happy dog looking up at a hand holding a bowl of food (hand cropped from frame), cream kitchen backdrop, soft window light.',
  composition: 'Dog on the left, bowl upper-right, lots of cream space.',
  decorations: ['food-bowl', 'confetti'],
}

const CAT_COMPORTEMENT: ImageSlot = {
  id: 'cat-comportement',
  group: 'articles',
  ratio: '3:2',
  tone: 'blue',
  subject:
    'A curious dog tilting its head sideways looking at camera, warm cream backdrop, 3/4 view.',
  composition: 'Dog centered-left, right side clean for text.',
  decorations: ['sparkle', 'confetti'],
  notes:
    'Blue confetti suggesting thoughts/questions. Playful curiosity mood.',
}

const CAT_ENQUETES: ImageSlot = {
  id: 'cat-enquetes',
  group: 'articles',
  ratio: '3:2',
  tone: 'amber',
  subject:
    'A pile of dry kibble on cream linen with a magnifying glass hovering just above, warm daylight, macro detail on the kibble texture.',
  composition: 'Kibble pile centered, magnifying glass upper-right.',
  decorations: ['sparkle'],
  notes: 'Single orange #E8622A sparkle accent through the magnifier.',
}

const CAT_URGENCES: ImageSlot = {
  id: 'cat-urgences',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  subject:
    'A dog food bowl with a small illustrated warning star floating above it, cream backdrop.',
  composition: 'Bowl lower-right, star upper-left for a read-flow.',
  decorations: ['sparkle', 'paw-print'],
  notes:
    'Sparkle in orange #E8622A = alert cue, but keep the mood reassuring, not scary.',
}

const CAT_AVIS_MARQUES: ImageSlot = {
  id: 'cat-avis-marques',
  group: 'articles',
  ratio: '3:2',
  tone: 'blue',
  subject:
    'Three different ceramic bowls with different textures of dog food (kibble / fresh / raw-style), arranged in a row on cream linen, top-down 45° view.',
  composition: 'Three bowls left-to-right diagonal, cream space above.',
  decorations: ['sparkle', 'confetti'],
}

const CAT_PAR_RACE: ImageSlot = {
  id: 'cat-par-race',
  group: 'articles',
  ratio: '3:2',
  tone: 'amber',
  subject:
    'Two different dogs side by side in portrait (one small, one medium-large, any breeds) sharing the same cream backdrop, calm and friendly.',
  composition: 'Two dogs centered, frontal.',
  decorations: ['confetti', 'party-hat'],
}

// ============================================================
// GROUPE C — ARTICLES PILOTES (5 slots)
// ============================================================

const ART_MALINOIS: ImageSlot = {
  id: 'art-malinois',
  group: 'articles',
  ratio: '3:2',
  tone: 'amber',
  subject:
    'A chest-up portrait of a Belgian Malinois with attentive alert expression, warm cream backdrop, slight 3/4 angle, short fawn coat with black mask.',
  composition: 'Dog centered-left, right side clean for title overlay.',
  decorations: ['party-hat', 'paw-print'],
  notes:
    'Pilot article visual — sets the reference for future breed articles.',
}

const ART_CROQUETTES_VS_FRAIS: ImageSlot = {
  id: 'art-croquettes-vs-frais',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  subject:
    'A split composition — one side a pile of golden kibble, the other side a bowl of fresh cooked dog food with meat and veggies — separated by a thin cream line.',
  composition:
    'Split 50/50 vertically. Cream negative space top and bottom bands.',
  decorations: ['sparkle'],
  notes: 'Editorial "vs" composition, no text, purely visual duality.',
}

const ART_BARF: ImageSlot = {
  id: 'art-barf',
  group: 'articles',
  ratio: '3:2',
  tone: 'green',
  subject:
    'A wooden cutting board with raw dog-safe ingredients artfully arranged — piece of raw meat, bone, a few veggies, an egg — cream background.',
  composition: 'Board centered, top-down view.',
  decorations: ['bone', 'sparkle'],
}

const ART_BCS: ImageSlot = {
  id: 'art-bcs',
  group: 'articles',
  ratio: '3:2',
  tone: 'blue',
  subject:
    'A side-profile portrait of a medium dog showing healthy body shape, warm cream backdrop, clean studio look.',
  composition: 'Dog centered, side profile.',
  decorations: ['paw-print', 'sparkle'],
  notes: 'Minimalist, educational feel. Blue paw print signature.',
}

const ART_TRANSITION: ImageSlot = {
  id: 'art-transition',
  group: 'articles',
  ratio: '3:2',
  tone: 'amber',
  subject:
    'Two adjacent small bowls — one with old-style kibble, one with new kibble of different color — with a few pieces mixing in the middle on a cream surface.',
  composition: 'Two bowls centered, top-down view, transition zone emphasized.',
  decorations: ['confetti', 'sparkle'],
}

// ============================================================
// GROUPE D — SOCIAL / OG (1 slot)
// ============================================================

const OG_DEFAULT: ImageSlot = {
  id: 'og-default',
  group: 'social',
  ratio: '1.91:1',
  tone: 'cream',
  subject:
    'A happy dog with a party hat sitting next to a bowl of food on warm cream backdrop, editorial composition with lots of clean space for title overlay.',
  composition:
    'Dog and bowl centered-right, large clean cream space on left half for title.',
  decorations: ['party-hat', 'confetti', 'sparkle'],
  notes:
    'Open Graph / social share default — becomes the face of the brand on every shared link.',
}

// ============================================================
// EXPORT
// ============================================================

export const imageSlots: readonly ImageSlot[] = [
  // Home (11)
  HOME_HERO,
  BRAND_FRANKLIN,
  BRAND_ELMUT,
  BRAND_PETTY_WELL,
  BRAND_DOG_CHEF,
  BREED_LABRADOR,
  BREED_GOLDEN,
  BREED_BOULEDOGUE,
  BREED_BERGER_AUSTRALIEN,
  BREED_CHIHUAHUA,
  BREED_CAVALIER,
  // Categories (8)
  CAT_NUTRITION,
  CAT_SANTE,
  CAT_ALIMENTATION,
  CAT_COMPORTEMENT,
  CAT_ENQUETES,
  CAT_URGENCES,
  CAT_AVIS_MARQUES,
  CAT_PAR_RACE,
  // Pilots (5)
  ART_MALINOIS,
  ART_CROQUETTES_VS_FRAIS,
  ART_BARF,
  ART_BCS,
  ART_TRANSITION,
  // Social (1)
  OG_DEFAULT,
] as const

export function getSlotById(id: string): ImageSlot | undefined {
  return imageSlots.find((s) => s.id === id)
}

export function getSlotsByGroup(group: ImageGroup): readonly ImageSlot[] {
  return imageSlots.filter((s) => s.group === group)
}
