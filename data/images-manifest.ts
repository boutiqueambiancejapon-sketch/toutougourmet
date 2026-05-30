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

/** Extension de fichier — `webp` par défaut, `jpeg` pour les images générées en JPEG natif */
export type ImageExt = 'webp' | 'jpg' | 'jpeg' | 'png'

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
  /**
   * Set `true` once the WebP file exists in /public/images/{group}/{id}.webp.
   * Flipped manually after each Gemini generation batch. Controls whether
   * the <Illustration> component renders the real photo or the SVG placeholder.
   */
  imageReady?: boolean
  /** Extension du fichier image — `webp` par défaut, `jpeg` pour les nouveaux batches Gemini */
  ext?: ImageExt
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
  imageReady: true,
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
  decorations: ['sparkle', 'confetti'],
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
  decorations: ['sparkle', 'confetti'],
  notes:
    'Evokes tailored personalized fresh meals. Rose-forward palette. Do NOT imitate Dog Chef packaging.',
}

const BREED_LABRADOR: ImageSlot = {
  id: 'breed-labrador',
  group: 'breeds',
  ratio: '3:2',
  tone: 'amber',
  imageReady: true,
  subject:
    'A chest-up portrait of a happy yellow Labrador Retriever, mouth slightly open in a smile, looking directly at camera, warm cream backdrop.',
  composition: 'Head-shoulders framing, eyes at upper third.',
  decorations: ['sparkle'],
  notes: 'Real photo already includes a painted party hat + ambient decorations — keep overlay minimal.',
}

const BREED_GOLDEN: ImageSlot = {
  id: 'breed-golden',
  group: 'breeds',
  ratio: '3:2',
  tone: 'rose',
  imageReady: true,
  subject:
    'A chest-up portrait of a Golden Retriever with a soft curly coat, calm and alert expression, warm cream backdrop.',
  composition: 'Head-shoulders framing, slight 3/4 angle.',
  decorations: ['sparkle'],
  notes: 'Rose-toned photo with baked-in party hat.',
}

const BREED_BOULEDOGUE: ImageSlot = {
  id: 'breed-bouledogue',
  group: 'breeds',
  ratio: '3:2',
  tone: 'blue',
  imageReady: true,
  subject:
    'A chest-up portrait of a French Bulldog with a fawn or cream coat, ears upright, curious expression.',
  composition: 'Head-shoulders framing, straight on.',
  decorations: ['sparkle'],
  notes: 'No party hat on the photo (brachycephalic) — paw print baked in.',
}

const BREED_BERGER_AUSTRALIEN: ImageSlot = {
  id: 'breed-berger-australien',
  group: 'breeds',
  ratio: '3:2',
  tone: 'green',
  imageReady: true,
  subject:
    'A chest-up portrait of an Australian Shepherd with merle coat pattern (blue merle or red merle), bright alert eyes.',
  composition: 'Head-shoulders framing, slight angle.',
  decorations: ['sparkle'],
  notes: 'Green-toned photo with baked-in party hat + eye sparkle.',
}

const BREED_CHIHUAHUA: ImageSlot = {
  id: 'breed-chihuahua',
  group: 'breeds',
  ratio: '3:2',
  tone: 'rose',
  imageReady: true,
  subject:
    'A chest-up portrait of a small Chihuahua with large alert ears, tan or cream coat, looking confidently at camera.',
  composition: 'Head-shoulders framing, centered.',
  decorations: ['sparkle'],
  notes: 'Tiny rose party hat baked into photo, scaled to small breed.',
}

const BREED_CAVALIER: ImageSlot = {
  id: 'breed-cavalier',
  group: 'breeds',
  ratio: '3:2',
  tone: 'amber',
  imageReady: true,
  subject:
    'A chest-up portrait of a Cavalier King Charles Spaniel with long silky ears (Blenheim pattern — white with chestnut markings), gentle expression.',
  composition: 'Head-shoulders framing, slight 3/4 angle.',
  decorations: ['sparkle'],
  notes: 'Amber hat baked into photo, ears framing the face softly.',
}

const BREED_GENERIC: ImageSlot = {
  id: 'breed-generic',
  group: 'breeds',
  ratio: '3:2',
  tone: 'amber',
  imageReady: true,
  subject:
    'A happy adult medium-sized mixed-breed dog in a chest-up portrait — intentionally ambiguous breed, universal portrait. Warm cream backdrop.',
  composition: 'Dog centered, frontal or slight 3/4 angle, clean cream borders.',
  decorations: ['sparkle'],
  notes: 'Fallback cover used only when no dedicated breed image exists.',
}

// ============================================================
// GROUPE A.bis — RACES PHOTOS BATCH 2 (36 slots, .jpeg natifs Gemini)
// ============================================================

interface BreedPhotoConfig {
  id: string
  tone: ImageTone
  subject: string
  decorations?: Decoration[]
}

function makeBreedPhoto(cfg: BreedPhotoConfig): ImageSlot {
  return {
    id: cfg.id,
    group: 'breeds',
    ratio: '3:2',
    tone: cfg.tone,
    imageReady: true,
    ext: 'jpeg',
    subject: cfg.subject,
    composition: 'Chest-up portrait, dog centered on warm cream backdrop, soft natural daylight.',
    decorations: cfg.decorations ?? ['party-hat', 'sparkle'],
  }
}

const NEW_BREED_PHOTOS: readonly ImageSlot[] = [
  makeBreedPhoto({ id: 'breed-akita-inu', tone: 'amber', subject: 'Akita Inu, red-and-white double coat, fox-like face, erect triangular ears.' }),
  makeBreedPhoto({ id: 'breed-basset-hound', tone: 'rose', subject: 'Basset Hound, tricolor coat, very long droopy ears.' }),
  makeBreedPhoto({ id: 'breed-beagle', tone: 'blue', subject: 'Beagle, tricolor coat, floppy ears, friendly expression.' }),
  makeBreedPhoto({ id: 'breed-berger-allemand', tone: 'green', subject: 'German Shepherd, tan and black coat, erect ears.' }),
  makeBreedPhoto({ id: 'breed-berger-belge-malinois', tone: 'amber', subject: 'Belgian Malinois, fawn coat with black mask, erect ears.' }),
  makeBreedPhoto({ id: 'breed-berger-de-beauce', tone: 'rose', subject: 'Beauceron, black-and-tan short coat, robust head.' }),
  makeBreedPhoto({ id: 'breed-berger-des-shetland', tone: 'blue', subject: 'Shetland Sheepdog, sable and white long coat.' }),
  makeBreedPhoto({ id: 'breed-bichon-frise', tone: 'green', subject: 'Bichon Frise, fluffy white curly coat.' }),
  makeBreedPhoto({ id: 'breed-border-collie', tone: 'amber', subject: 'Border Collie, black-and-white coat, intelligent gaze.' }),
  makeBreedPhoto({ id: 'breed-bouledogue-anglais', tone: 'blue', subject: 'English Bulldog, fawn-and-white coat, wrinkled brachycephalic face.', decorations: ['paw-print', 'sparkle'] }),
  makeBreedPhoto({ id: 'breed-bouvier-bernois', tone: 'rose', subject: 'Bernese Mountain Dog, tricolor coat (black, white, tan), gentle expression.' }),
  makeBreedPhoto({ id: 'breed-boxer', tone: 'green', subject: 'Boxer, fawn coat with black mask, brachycephalic muscular face.', decorations: ['paw-print', 'sparkle'] }),
  makeBreedPhoto({ id: 'breed-cane-corso', tone: 'amber', subject: 'Cane Corso, gray brindle coat, large robust head.', decorations: ['paw-print', 'sparkle'] }),
  makeBreedPhoto({ id: 'breed-caniche', tone: 'rose', subject: 'Standard Poodle, apricot curly coat, alert expression.' }),
  makeBreedPhoto({ id: 'breed-carlin', tone: 'blue', subject: 'Pug, fawn coat with black mask, brachycephalic wrinkled face.', decorations: ['paw-print', 'sparkle'] }),
  makeBreedPhoto({ id: 'breed-chow-chow', tone: 'amber', subject: 'Chow Chow, fluffy red coat, lion-like mane.' }),
  makeBreedPhoto({ id: 'breed-cocker-spaniel', tone: 'rose', subject: 'Cocker Spaniel, golden silky coat, long droopy ears.' }),
  makeBreedPhoto({ id: 'breed-dachshund', tone: 'green', subject: 'Dachshund, smooth red coat, long body short legs.' }),
  makeBreedPhoto({ id: 'breed-dalmatien', tone: 'blue', subject: 'Dalmatian, white coat with black spots.' }),
  makeBreedPhoto({ id: 'breed-doberman', tone: 'amber', subject: 'Doberman Pinscher, sleek black-and-tan coat, alert expression.' }),
  makeBreedPhoto({ id: 'breed-epagneul-breton', tone: 'rose', subject: 'Brittany Spaniel, white-and-orange coat, friendly expression.' }),
  makeBreedPhoto({ id: 'breed-husky-siberien', tone: 'blue', subject: 'Siberian Husky, gray-and-white coat, blue eyes, erect ears.' }),
  makeBreedPhoto({ id: 'breed-jack-russell-terrier', tone: 'green', subject: 'Jack Russell Terrier, white coat with brown markings, alert expression.' }),
  makeBreedPhoto({ id: 'breed-rottweiler', tone: 'amber', subject: 'Rottweiler, black-and-tan coat, robust expression.' }),
  makeBreedPhoto({ id: 'breed-saint-bernard', tone: 'rose', subject: 'Saint Bernard, white-and-red-brown coat, gentle giant expression.' }),
  makeBreedPhoto({ id: 'breed-samoyed', tone: 'blue', subject: 'Samoyed, fluffy pure white coat, smiling expression.' }),
  makeBreedPhoto({ id: 'breed-schnauzer-nain', tone: 'green', subject: 'Miniature Schnauzer, salt-and-pepper coat, distinctive beard and eyebrows.' }),
  makeBreedPhoto({ id: 'breed-shiba-inu', tone: 'amber', subject: 'Shiba Inu, red coat with cream markings, fox-like face, erect ears.' }),
  makeBreedPhoto({ id: 'breed-shih-tzu', tone: 'rose', subject: 'Shih Tzu, long flowing white-and-gold coat, small flat face.', decorations: ['paw-print', 'sparkle'] }),
  makeBreedPhoto({ id: 'breed-spitz-nain', tone: 'blue', subject: 'Pomeranian, fluffy orange coat, fox-like face.' }),
  makeBreedPhoto({ id: 'breed-staffordshire-bull-terrier', tone: 'green', subject: 'Staffordshire Bull Terrier, brindle coat, muscular short face.' }),
  makeBreedPhoto({ id: 'breed-teckel', tone: 'amber', subject: 'Teckel (long-haired dachshund), chocolate coat, long body short legs.' }),
  makeBreedPhoto({ id: 'breed-terre-neuve', tone: 'rose', subject: 'Newfoundland, fluffy black coat, gentle giant expression.' }),
  makeBreedPhoto({ id: 'breed-welsh-corgi-pembroke', tone: 'blue', subject: 'Welsh Corgi Pembroke, red-and-white coat, fox-like face, erect ears.' }),
  makeBreedPhoto({ id: 'breed-westie', tone: 'green', subject: 'West Highland White Terrier, fluffy pure white coat, alert expression.' }),
  makeBreedPhoto({ id: 'breed-yorkshire-terrier', tone: 'amber', subject: 'Yorkshire Terrier, long silky steel-blue-and-tan coat.' }),
]

// ============================================================
// GROUPE B — ARTICLE COVERS PAR CATÉGORIE (8 slots)
// ============================================================

const CAT_NUTRITION: ImageSlot = {
  id: 'cat-nutrition',
  group: 'articles',
  ratio: '3:2',
  tone: 'amber',
  imageReady: true,
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
  imageReady: true,
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
  imageReady: true,
  subject:
    'A happy dog looking up at a hand holding a bowl of food (hand cropped from frame), cream kitchen backdrop, soft window light.',
  composition: 'Dog on the left, bowl upper-right, lots of cream space.',
  decorations: ['confetti', 'sparkle'],
}

const CAT_COMPORTEMENT: ImageSlot = {
  id: 'cat-comportement',
  group: 'articles',
  ratio: '3:2',
  tone: 'blue',
  imageReady: true,
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
  imageReady: true,
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
  imageReady: true,
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
  imageReady: true,
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
  imageReady: true,
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

const ART_RECETTE_BOUILLON_OS_MAISON_CHIEN: ImageSlot = {
  id: 'art-recette-bouillon-os-maison-chien',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial flat-lay still-life: a rustic shallow ceramic bowl filled with clear amber dog bone broth, gentle steam rising, surrounded by raw beef knuckle bones, a wooden spoon, fresh parsley and thyme sprigs, a halved carrot, and a small glass cruet of apple cider vinegar, on a warm cream linen surface.',
  composition: 'Bowl centered-right, generous cream negative space on the upper-left third (40%+ clean cream for title overlay). Soft natural daylight from upper-left.',
  decorations: ['bone', 'sparkle'],
  notes: 'Featured image auto-générée pour l\'article recette-bouillon-os-maison-chien le 2026-05-17.',
}

const ART_CHIEN_PEUT_MANGER_BEURRE_DE_CACAHUETE: ImageSlot = {
  id: 'art-chien-peut-manger-beurre-de-cacahuete',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial flat-lay still-life on warm cream linen: a small open glass jar of natural peanut butter (visible creamy texture, no label, no brand), a wooden spoon resting on the rim with a generous dollop of peanut butter, a small scattering of whole roasted peanuts and one half-cut peanut showing its kernel. A curious cream-coated medium dog with soft floppy ears peeks into the frame from the upper-right corner, calm playful expression.',
  composition: 'Jar and spoon centered-left, peanuts scattered on the lower third. Dog upper-right but not dominating. 40%+ clean cream negative space upper-left and right for editorial title overlay. Rule-of-thirds, shallow depth of field, soft creamy bokeh.',
  decorations: ['confetti', 'sparkle', 'paw-print'],
  notes: 'Featured image auto-générée pour l\'article chien-peut-manger-beurre-de-cacahuete le 2026-05-17.',
}

const ART_TAPIS_DE_LECHAGE_CHIEN_GUIDE_UTILISATION_V2: ImageSlot = {
  id: 'art-tapis-de-lechage-chien-guide-utilisation-v2',
  group: 'articles',
  ratio: '3:2',
  tone: 'blue',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media illustration: a curious medium dog with cream-and-amber coat and soft floppy ears, leaning toward a pastel-blue silicone lick mat garnished with creamy white yogurt swirls, a light amber peanut-butter streak and a small mashed-banana smear, on a warm cream linen surface. A small ceramic bowl of plain yogurt sits soft-focus behind.',
  composition: 'Dog centered-left occupying about 45% of the frame, lick mat lower-center, 40%+ clean cream negative space upper-right for editorial title overlay. Soft natural daylight upper-left, gentle catch-light in the dog eye, shallow depth of field, creamy bokeh background.',
  decorations: ['sparkle', 'paw-print'],
  notes: 'Featured image auto-générée pour l\'article tapis-de-lechage-chien-guide-utilisation le 2026-05-18.',
}

const ART_MYCOTOXINES_CROQUETTES_CHIEN_RISQUES_PREVENTION_V2: ImageSlot = {
  id: 'art-mycotoxines-croquettes-chien-risques-prevention-v2',
  group: 'articles',
  ratio: '3:2',
  tone: 'green',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial flat-lay still-life on warm cream linen: a shallow ceramic bowl of golden-amber dry dog kibble, a small glass mason jar with airtight clip lid containing kibble, a wooden scoop, a few dried corn kernels and a wheat sprig. A small vintage magnifying glass hovers just above the kibble. A tiny illustrated pill-green shield with a hand-drawn checkmark floats upper-right as a safety/verification signature.',
  composition: 'Bowl of kibble centered-left at ~40% of frame, magnifying glass and mason jar staggered to the right and upper-third, 40%+ clean cream negative space on the right and lower portions for editorial title overlay. Rule-of-thirds, shallow depth of field, soft creamy bokeh.',
  decorations: ['sparkle', 'paw-print'],
  notes: 'Featured image auto-générée pour l\'article mycotoxines-croquettes-chien-risques-prevention le 2026-05-19.',
}

const ART_RECETTE_FRIANDISES_SAUMON_PATATE_DOUCE_CHIEN: ImageSlot = {
  id: 'art-recette-friandises-saumon-patate-douce-chien',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media still-life on warm cream linen: a small baking tray of freshly baked round dog treats with a rustic golden-amber color (visible specks of pink salmon flakes and orange sweet potato), arranged neatly. Next to the tray, a halved roasted sweet potato showing its bright orange flesh, a small piece of cooked pink salmon fillet flaking apart, a wooden rolling pin, a small ceramic bowl with rolled oats, and fresh parsley sprigs. A small linen napkin in soft rose peeks under the tray.',
  composition: 'Tray centered-left at ~45% of the frame, sweet potato and salmon arranged on the lower third, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['paw-print', 'sparkle', 'confetti'],
  notes: 'Featured image auto-générée pour l\'article recette-friandises-saumon-patate-douce-chien le 2026-05-19.',
}

const ART_COMPRENDRE_ETIQUETTE_PATEE_CHIEN_V2: ImageSlot = {
  id: 'art-comprendre-etiquette-patee-chien-v2',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media flat-lay still-life on warm cream linen: a small open round metal can of unbranded wet dog food with rich glossy brown pâté texture visible from above, a shallow off-white ceramic dog bowl beside it holding a smooth portion of brown wet food, a small wooden spoon, and a few fresh ingredients (a small piece of pink raw beef, a few green peas, a parsley sprig, two cooked carrot slices). Style: mixed-media editorial — photo lifestyle combined with subtle hand-drawn gouache decorations in flat color, pill rose and amber accents, contour #1A1109.',
  composition: 'Can and bowl centered-left at ~45% of the frame, ingredients arranged on the lower third, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['paw-print', 'sparkle'],
  notes: 'Featured image auto-générée pour l\'article comprendre-etiquette-patee-chien le 2026-05-21.',
}

const ART_CHIEN_PEUT_MANGER_COURGETTE: ImageSlot = {
  id: 'art-chien-peut-manger-courgette',
  group: 'articles',
  ratio: '3:2',
  tone: 'green',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media still-life on warm cream linen: a shallow off-white ceramic dog bowl filled with neatly cut bright-green zucchini rounds, a whole long green zucchini lying horizontally beside the bowl with one end sliced into rounds, a small wooden cutting board with zucchini cubes, a halved zucchini showing tender pale-green seeds, and a few fresh basil and parsley leaves scattered. Style: mixed-media editorial — photo lifestyle combined with subtle hand-drawn gouache decorations, contour #1A1109, palette dominated by cream #FAFAF8 with pill-green #C2F0D5 accents and a hint of amber #FFE8B5.',
  composition: 'Bowl and zucchini centered-left at ~50% of the frame, ingredients arranged on the lower third, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['paw-print', 'sparkle'],
  notes: 'Featured image auto-générée pour l\'article chien-peut-manger-courgette le 2026-05-24.',
}

const ART_OMEGA_3_CHIEN_COMPARATIF_SOURCES_V4: ImageSlot = {
  id: 'art-omega-3-chien-comparatif-sources-v4',
  group: 'articles',
  ratio: '3:2',
  tone: 'green',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media flat-lay still-life on warm cream linen: four omega-3 sources for dogs in a soft diagonal — a small amber glass dropper bottle of golden salmon oil with a wooden spoon and a single drop, a small clear glass jar of soft ruby-red krill oil softgel capsules, a small white ceramic ramekin with deep-green microalgae powder and a tiny dried green algae leaf, an open round metal tin of small whole silver sardines with one sardine resting on the linen. A halved lemon wedge and a sprig of fresh dill garnish the composition. Style: mixed-media editorial — photo lifestyle combined with subtle hand-drawn gouache decorations in flat color, contour #1A1109. Palette: cream #FAFAF8 dominant, pill-green #C2F0D5 on the algae, soft amber #FFE8B5 highlights on the salmon oil and sardine tin, gentle rose #FFD6E3 hint on a small linen napkin.',
  composition: 'Items centered-left in a diagonal flow at ~50% of the frame, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['sparkle', 'paw-print'],
  notes: 'Featured image auto-générée pour l\'article omega-3-chien-comparatif-sources le 2026-05-25.',
}

const ART_AVIS_FRANKLIN_LIGHT_DINDE_PATATE_DOUCE_EPINARDS: ImageSlot = {
  id: 'art-avis-franklin-light-dinde-patate-douce-epinards',
  group: 'articles',
  ratio: '3:2',
  tone: 'amber',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media flat-lay still-life on warm cream linen: a shallow off-white ceramic dog bowl filled with crunchy light-amber kibble, a few kibble pieces scattered around. Next to it, fresh ingredients evoking the recipe — a small piece of cooked turkey breast sliced pale pink, a halved roasted sweet potato showing bright orange flesh, a small bunch of fresh dark-green spinach leaves arranged loosely, a small wooden scoop with a few kibble pieces, and a tiny linen napkin in soft blue tucked under the bowl. Style: mixed-media editorial — photo lifestyle combined with subtle hand-drawn gouache decorations, contour #1A1109. Palette: cream #FAFAF8 dominant, pill-green #C2F0D5 on the spinach, soft amber #FFE8B5 on the kibble and sweet potato, gentle blue #C8DCFF hint on the napkin.',
  composition: 'Bowl and ingredients centered-left at ~50% of the frame, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['sparkle', 'paw-print'],
  notes: 'Featured image auto-générée pour l\'article avis-franklin-light-dinde-patate-douce-epinards le 2026-05-25.',
}

const ART_AVIS_DOG_CHEF_CROQUETTES_CANARD_FRAIS: ImageSlot = {
  id: 'art-avis-dog-chef-croquettes-canard-frais',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media flat-lay still-life on warm cream linen: a shallow off-white ceramic dog bowl filled with crunchy reddish-brown duck kibble, a few kibble pieces scattered around. Next to it, fresh ingredients evoking the recipe — a small piece of fresh raw duck breast (skin side up, pinkish-red), a halved roasted sweet potato showing bright orange flesh, a small handful of green peas, a few buckwheat grains, a small wooden cutting board, a tiny linen napkin in soft rose tucked under the bowl. A small sprig of fresh nettle leaves and a few cranberries as accents. Style: mixed-media editorial — photo lifestyle combined with subtle hand-drawn gouache decorations, contour #1A1109. Palette: cream #FAFAF8 dominant, soft amber #FFE8B5 on the kibble and sweet potato, gentle rose #FFD6E3 on the napkin and duck meat, pill-green #C2F0D5 on the peas and nettle.',
  composition: 'Bowl and ingredients centered-left at ~50% of the frame, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['sparkle', 'paw-print'],
  notes: 'Featured image auto-générée pour l\'article avis-dog-chef-croquettes-canard-frais le 2026-05-25.',
}

const ART_AVIS_FIDELIS_MENUS_FRAIS_CHIEN_BOCAUX_V2: ImageSlot = {
  id: 'art-avis-fidelis-menus-frais-chien-bocaux-v2',
  group: 'articles',
  ratio: '3:2',
  tone: 'rose',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media flat-lay still-life on warm cream linen: a signature clear glass mason jar with metal clip lid, filled with chunky fresh dog meal showing pink-white cooked turkey, bright orange sweet potato cubes, green peas, dark green spinach leaves — jar slightly tilted to reveal colorful contents. Beside it, a shallow off-white ceramic dog bowl with a scoop of the meal, a small wooden spoon, a halved sweet potato, a few peas and spinach leaves. A tiny soft-rose linen napkin. Style: mixed-media editorial — photo lifestyle combined with subtle hand-drawn gouache decorations, contour #1A1109. Palette: cream #FAFAF8 dominant, gentle rose #FFD6E3 on the napkin, soft amber #FFE8B5 on the sweet potato and meal, pill-green #C2F0D5 on the peas and spinach.',
  composition: 'Glass jar and bowl centered-left at ~50% of the frame, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['sparkle', 'paw-print'],
  notes: 'Featured image auto-générée pour l\'article avis-fidelis-menus-frais-chien-bocaux le 2026-05-25.',
}

const ART_AVIS_DOGFY_DIET_REPAS_FRAIS_CHIEN: ImageSlot = {
  id: 'art-avis-dogfy-diet-repas-frais-chien',
  group: 'articles',
  ratio: '3:2',
  tone: 'amber',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media flat-lay still-life on warm cream linen: a small open vacuum-sealed portion sachet of fresh cooked dog food revealing chunky pieces of cooked pink-white chicken breast, bright orange carrot rounds and cubes, small green peas, and a hint of dark green pumpkin. Beside the sachet, a shallow off-white ceramic dog bowl with a generous scoop of the colorful fresh meal, a small wooden spoon, a halved fresh carrot, a small bunch of fresh parsley, and a tiny linen napkin in soft amber. Style: mixed-media editorial — photo lifestyle combined with subtle hand-drawn gouache decorations, contour #1A1109. Palette: cream #FAFAF8 dominant, soft amber #FFE8B5 on the carrot and napkin, gentle rose #FFD6E3 hint on the chicken meat, pill-green #C2F0D5 on the peas and parsley.',
  composition: 'Sachet and bowl centered-left at ~50% of the frame, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['sparkle', 'paw-print'],
  notes: 'Featured image auto-générée pour l\'article avis-dogfy-diet-repas-frais-chien le 2026-05-25.',
}

const ART_CHIEN_BARBECUE_SECURITE_ALIMENTS_EVITER: ImageSlot = {
  id: 'art-chien-barbecue-securite-aliments-eviter',
  group: 'articles',
  ratio: '3:2',
  tone: 'green',
  imageReady: true,
  ext: 'jpeg',
  subject:
    'Editorial mixed-media flat-lay still-life on warm cream linen: a shallow off-white ceramic dog bowl filled with a safe portion of plain grilled chicken pieces (light golden, unseasoned, no skin), garnished with a single fresh parsley sprig. Arranged in a soft diagonal arc around the bowl on the lower-right third: a single wooden barbecue skewer with a small piece of meat, one chipolata-style grilled sausage, a small grilled rib bone, a small whole brown onion, a tiny ceramic ramekin of dark barbecue sauce, and a halved garlic clove. Style: mixed-media editorial — photo lifestyle combined with subtle hand-drawn gouache decorations in flat color, contour #1A1109. Palette: cream #FAFAF8 dominant, pill-green #C2F0D5 accents on the parsley and paw-print decoration, soft amber #FFE8B5 highlights on the grilled chicken and rib bone, very subtle rose #FFD6E3 hint on a small linen napkin tucked under the bowl.',
  composition: 'Bowl centered-left at ~45% of the frame, unsafe items arranged in a soft diagonal arc on the lower-right third, 40%+ clean cream negative space on the upper-right for editorial title overlay. Rule-of-thirds, soft natural daylight from upper-left, shallow depth of field, soft creamy bokeh.',
  decorations: ['paw-print', 'sparkle'],
  notes: 'Featured image auto-générée pour l\'article chien-barbecue-securite-aliments-eviter le 2026-05-27.',
}

// ============================================================
// GROUPE D — SOCIAL / OG (1 slot)
// ============================================================

const OG_DEFAULT: ImageSlot = {
  id: 'og-default',
  group: 'social',
  ratio: '1.91:1',
  tone: 'cream',
  imageReady: true,
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
  // Breed fallback
  BREED_GENERIC,
  // Breed photos batch 2 (36)
  ...NEW_BREED_PHOTOS,
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
  // Featured per-article (1+, auto-générés par la tâche planifiée)
  ART_RECETTE_BOUILLON_OS_MAISON_CHIEN,
  ART_CHIEN_PEUT_MANGER_BEURRE_DE_CACAHUETE,
  ART_TAPIS_DE_LECHAGE_CHIEN_GUIDE_UTILISATION_V2,
  ART_MYCOTOXINES_CROQUETTES_CHIEN_RISQUES_PREVENTION_V2,
  ART_RECETTE_FRIANDISES_SAUMON_PATATE_DOUCE_CHIEN,
  ART_COMPRENDRE_ETIQUETTE_PATEE_CHIEN_V2,
  ART_CHIEN_PEUT_MANGER_COURGETTE,
  ART_OMEGA_3_CHIEN_COMPARATIF_SOURCES_V4,
  ART_AVIS_FRANKLIN_LIGHT_DINDE_PATATE_DOUCE_EPINARDS,
  ART_AVIS_DOG_CHEF_CROQUETTES_CANARD_FRAIS,
  ART_AVIS_FIDELIS_MENUS_FRAIS_CHIEN_BOCAUX_V2,
  ART_AVIS_DOGFY_DIET_REPAS_FRAIS_CHIEN,
  ART_CHIEN_BARBECUE_SECURITE_ALIMENTS_EVITER,
  // Social (1)
  OG_DEFAULT,
] as const

export function getSlotById(id: string): ImageSlot | undefined {
  return imageSlots.find((s) => s.id === id)
}

export function getSlotsByGroup(group: ImageGroup): readonly ImageSlot[] {
  return imageSlots.filter((s) => s.group === group)
}

/**
 * Construit le chemin public d'une image à partir d'un slot.
 * Respecte le champ optionnel `slot.ext` (par défaut `webp`).
 *
 * Ex: { id: 'breed-akita-inu', group: 'breeds', ext: 'jpeg' }
 *  → '/images/breeds/breed-akita-inu.jpeg'
 */
export function getSlotPath(slot: ImageSlot): string {
  const ext = slot.ext ?? 'webp'
  return `/images/${slot.group}/${slot.id}.${ext}`
}
