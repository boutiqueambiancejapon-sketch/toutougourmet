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
]

/** Résout un slot additionnel par id (fallback de `getSlotById`). */
export function getExtraSlotById(id: string): ImageSlot | undefined {
  return EXTRA_IMAGE_SLOTS.find((s) => s.id === id)
}
