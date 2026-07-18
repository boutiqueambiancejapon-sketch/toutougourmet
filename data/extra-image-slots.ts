import type { ImageSlot } from '@/data/images-manifest'

/**
 * Slots d'image additionnels, déclarés hors du manifest principal
 * `data/images-manifest.ts`.
 *
 * Ce fichier existe parce que le manifest principal est devenu trop volumineux
 * pour être réécrit intégralement via l'API GitHub (limite de taille) par la
 * tâche planifiée `toutougourmet-daily-article`. Les nouveaux slots featured
 * générés par cette tâche sont donc ajoutés ici, en append sûr, plutôt qu'en
 * réécrivant le gros fichier.
 *
 * `getSlotById` du composant Illustration consulte ce registre en second
 * recours (après `data/images-manifest.ts`). La structure d'un slot est
 * strictement identique à celle d'un `ImageSlot` du manifest.
 */
export const EXTRA_IMAGE_SLOTS: readonly ImageSlot[] = [
  {
    id: 'art-nourriture-berger-blanc-suisse',
    group: 'articles',
    ratio: '3:2',
    tone: 'amber',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'A chest-up editorial portrait of a White Swiss Shepherd (Berger Blanc Suisse), pure white medium-length coat, large erect pointed ears, black nose, dark almond eyes, calm friendly inquisitive expression, warm cream studio backdrop, soft natural daylight from the upper-left.',
    composition:
      'Full-bleed: the dog and the warm cream studio scene fill the entire frame edge-to-edge, dog framed head-shoulders slightly off-centre per rule-of-thirds, shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin.',
    decorations: ['party-hat'],
    notes:
      "Featured image auto-générée pour l'article nourriture-berger-blanc-suisse le 2026-07-15. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-chien-peut-manger-noix-de-coco',
    group: 'articles',
    ratio: '3:2',
    tone: 'rose',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'An editorial lifestyle scene: a fresh coconut split in half showing white flesh, with a few pieces of coconut meat and light shavings on a pale cream surface next to a small ceramic dog bowl, and a friendly golden-coated dog head leaning in from the right to sniff the coconut, warm natural daylight from the upper-left.',
    composition:
      'Full-bleed: the photographic scene fills the entire frame edge-to-edge, cream tones from real photographic bokeh spread across the whole frame; no reserved blank band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['dog-bowl', 'sparkle', 'paw-print'],
    notes:
      "Featured image auto-générée pour l'article chien-peut-manger-noix-de-coco le 2026-07-16. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-nourriture-dogue-de-bordeaux',
    group: 'articles',
    ratio: '3:2',
    tone: 'amber',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'A chest-up editorial portrait of a Dogue de Bordeaux (French Mastiff), massive brachycephalic head with deep symmetrical wrinkles, short fawn-to-mahogany self-coloured coat, brown mask and brown nose, hazel eyes set wide, loose pendulous jowls and small drooping ears, powerful neck, calm friendly inquisitive expression, warm cream studio backdrop, soft natural daylight from the upper-left.',
    composition:
      'Full-bleed: the dog and the warm cream studio scene fill the entire frame edge-to-edge, dog framed head-shoulders slightly off-centre per rule-of-thirds, shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin.',
    decorations: ['paw-print'],
    notes:
      "Featured image auto-générée pour l'article nourriture-dogue-de-bordeaux le 2026-07-17. Race brachycéphale, empreinte de patte au lieu du chapeau. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-avis-butternut-box',
    group: 'articles',
    ratio: '3:2',
    tone: 'blue',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'An editorial lifestyle food-photography scene: a pale ceramic dog bowl filled with gently cooked fresh dog food (minced meat with visible diced carrots, green beans and peas, light steam), a few fresh ingredients beside it (carrot, green beans, rosemary sprig), and a friendly curious dog head leaning in from the right to sniff the bowl, warm natural daylight from the upper-left.',
    composition:
      'Full-bleed: the photographic scene fills the entire frame edge-to-edge, bowl slightly off-centre per rule-of-thirds, shallow depth of field with warm cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['sparkle', 'paw-print'],
    notes:
      "Featured image auto-générée pour l'article avis-butternut-box le 2026-07-18. Slot déclaré hors manifest principal (taille du fichier).",
  },
]

/** Résout un slot additionnel par id (fallback de `getSlotById`). */
export function getExtraSlotById(id: string): ImageSlot | undefined {
  return EXTRA_IMAGE_SLOTS.find((s) => s.id === id)
}
