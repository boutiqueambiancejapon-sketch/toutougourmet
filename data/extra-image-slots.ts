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
    decorations: ['food-bowl', 'sparkle', 'paw-print'],
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
  {
    id: 'art-donner-comprime-chien-refuse-medicament',
    group: 'articles',
    ratio: '3:2',
    tone: 'green',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'An editorial lifestyle scene on a warm cream surface: a small pale cheese cube and a soft dog treat with a single round white tablet tucked inside it held by out-of-focus fingertips, a tiny ceramic dish holding one white pill, and a friendly light-coated dog leaning its head in from the right with a calm curious expression to sniff the treat, warm natural daylight from the upper-left.',
    composition:
      'Full-bleed: the photographic scene fills the entire frame edge-to-edge, treat and dog on rule-of-thirds, shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['food-bowl', 'sparkle'],
    notes:
      "Featured image auto-générée pour l'article donner-comprime-chien-refuse-medicament le 2026-07-19. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-nourriture-braque-allemand',
    group: 'articles',
    ratio: '3:2',
    tone: 'amber',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'A chest-up editorial portrait of a German Shorthaired Pointer (Braque allemand, Deutsch Kurzhaar), short dense liver-and-white ticked roan coat on the body, solid liver-brown head, long soft floppy brown ears, warm amber-brown eyes, brown nose, lean athletic chest, calm friendly inquisitive expression, warm cream studio backdrop, soft natural daylight from the upper-left.',
    composition:
      'Full-bleed: the dog and the warm cream studio scene fill the entire frame edge-to-edge, dog framed head-shoulders slightly off-centre per rule-of-thirds, shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin.',
    decorations: ['party-hat'],
    notes:
      "Featured image auto-générée pour l'article nourriture-braque-allemand le 2026-07-20. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-chien-peut-manger-jambon',
    group: 'articles',
    ratio: '3:2',
    tone: 'rose',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'An editorial lifestyle food-photography scene on a warm cream linen tablecloth: a few folded slices of cooked pink white ham beside a small empty cream ceramic dog bowl, and a friendly beige-and-white dog leaning its head in from the right, curious, looking down at the ham, warm natural daylight from the upper-left.',
    composition:
      'Full-bleed: the photographic scene fills the entire frame edge-to-edge, ham and bowl slightly off-centre per rule-of-thirds, shallow depth of field with warm cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['food-bowl', 'paw-print', 'sparkle'],
    notes:
      "Featured image auto-générée pour l'article chien-peut-manger-jambon le 2026-07-21. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-collagene-chien-bienfaits-dosage',
    group: 'articles',
    ratio: '3:2',
    tone: 'rose',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'An editorial lifestyle scene on a warm cream surface about a joint-support collagen supplement for dogs: a small pale ceramic dish holding a heap of fine cream-coloured collagen powder with a wooden measuring scoop beside it, a small cream dog bowl nearby, and a friendly light-golden-coated dog leaning its head in from the right with a calm curious expression to sniff the powder, warm natural daylight from the upper-left.',
    composition:
      'Full-bleed: the photographic cream-surface scene fills the entire frame edge-to-edge, dish of powder and scoop slightly off-centre per rule-of-thirds, dog head entering from the right, shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['food-bowl', 'sparkle', 'paw-print'],
    notes:
      "Featured image auto-générée pour l'article collagene-chien-bienfaits-dosage le 2026-07-26. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-alimentation-poisson-chien-guide',
    group: 'articles',
    ratio: '3:2',
    tone: 'rose',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'Editorial mixed-media lifestyle photo on a warm cream linen surface: a fresh cooked salmon fillet on a light wooden board, flaked slightly to show texture, with fresh dill and lemon wedges beside it, a small empty pale ceramic dog bowl nearby, and a friendly curious light-golden-coated dog leaning its head in from the right, sniffing toward the fish. Mixed-media editorial style: lifestyle photo with subtle hand-drawn gouache decorations, contour #1A1109. Palette: cream #FAFAF8 dominant, soft rose #FFD6E3 accent, hints of blue #C8DCFF and amber #FFE8B5 on confetti, small drawn paw-print and sparkle.',
    composition:
      'Full-bleed: the fish, board, bowl and dog fill the entire frame edge-to-edge, touching all four borders; subject slightly off-centre per rule-of-thirds; shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank cream band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['paw-print', 'sparkle', 'confetti'],
    notes:
      "Featured image auto-générée pour l'article alimentation-poisson-chien-guide le 2026-08-03. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-meilleure-gamelle-anti-glouton-chien',
    group: 'articles',
    ratio: '3:2',
    tone: 'rose',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'Editorial mixed-media lifestyle photo: a happy golden retriever eating from a textured slow-feeder dog bowl with maze ridges, snout lowered close to the bowl, kibble scattered on a warm sunlit wooden floor. Mixed-media editorial style: photorealistic dog and bowl with subtle hand-drawn gouache decorations layered on top, contour #1A1109. Palette: cream #FAFAF8 dominant background bokeh, amber #FFE8B5 confetti burst, rose #FFD6E3 paw print, small orange #E8622A sparkle accent.',
    composition:
      'Full-bleed: the dog, the slow-feeder bowl and the sunlit wooden floor fill the entire frame edge-to-edge, touching all four borders; dog and bowl slightly off-centre per rule-of-thirds; shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank cream band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['confetti', 'paw-print', 'sparkle'],
    notes:
      "Featured image auto-générée pour l'article meilleure-gamelle-anti-glouton-chien le 2026-08-04. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-chien-mange-noix-macadamia-urgence',
    group: 'articles',
    ratio: '3:2',
    tone: 'rose',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'Editorial mixed-media lifestyle photo shot from a slightly elevated angle on a wooden kitchen table: a small ceramic bowl of whole macadamia nuts, shells cracked open with pale cream kernels visible, sits close to camera, and just behind it a curious golden-coated dog leans in with head tilted, nose close to the bowl, alert but not eating. Mixed-media editorial style: photorealistic dog and bowl with hand-drawn gouache decorations layered on top, contour #1A1109. Palette: cream #FAFAF8 dominant background bokeh, rose #FFD6E3 paw print, small orange #E8622A sparkle as a gentle alert accent.',
    composition:
      'Full-bleed: the dog, the bowl of nuts and the wooden table fill the entire frame edge-to-edge, touching all four borders; bowl and dog slightly off-centre per rule-of-thirds; shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank cream band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['sparkle', 'paw-print'],
    notes:
      "Featured image auto-générée pour l'article chien-mange-noix-macadamia-urgence le 2026-08-09. Catégorie Urgences & Intoxications — ton rose + accent orange. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-nourriture-setter-irlandais',
    group: 'articles',
    ratio: '3:2',
    tone: 'amber',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'A chest-up editorial portrait of an Irish Setter dog, glossy mahogany-red silky coat, long feathered drooping ears, elegant narrow head with a long refined muzzle, dark almond-shaped eyes, black nose, calm friendly inquisitive expression, warm cream studio backdrop, soft natural daylight from the upper-left, gentle catch-light in the eyes, slight 3/4 angle.',
    composition:
      'Full-bleed: the dog and the warm cream studio scene fill the entire frame edge-to-edge, dog framed head-shoulders slightly off-centre per rule-of-thirds, shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin.',
    decorations: ['party-hat'],
    notes:
      "Featured image auto-générée pour l'article nourriture-setter-irlandais le 2026-08-10. Portrait race unique (règle Race), pas de fallback breed générique. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-alimentation-chien-sportif-avant-apres-effort',
    group: 'articles',
    ratio: '3:2',
    tone: 'blue',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'Editorial mixed-media lifestyle photo on a rustic light wood table: homemade oat-and-chicken recovery bites for an active dog, stacked and scattered, next to rolled oats, a halved sweet potato, shredded cooked chicken, a cracked egg, a small ceramic jug of oil, and a softly coiled dog leash in the background suggesting sport and activity. Mixed-media editorial style: photorealistic food scene with hand-drawn gouache decorations layered on top, contour #1A1109. Palette: cream #FAFAF8 dominant background bokeh, blue #C8DCFF pill, rose #FFD6E3 paw print, green #C2F0D5 running-dog silhouette, small orange #E8622A sparkle accent.',
    composition:
      'Full-bleed: the food, ingredients and leash fill the entire frame edge-to-edge, touching all four borders; subject slightly off-centre per rule-of-thirds; shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank cream band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['paw-print', 'sparkle', 'confetti'],
    notes:
      "Featured image auto-générée pour l'article alimentation-chien-sportif-avant-apres-effort le 2026-08-12. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-nourriture-bull-terrier',
    group: 'articles',
    ratio: '3:2',
    tone: 'amber',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'A chest-up editorial portrait of a Bull Terrier dog, distinctive long egg-shaped downward-sloping head profile, small deep-set dark triangular eyes set close together, small thin erect ears carried close together, short glossy pure-white coat, black nose, calm friendly inquisitive expression, warm cream studio backdrop, soft natural daylight from the upper-left, gentle catch-light in the eyes, slight 3/4 angle.',
    composition:
      'Full-bleed: the dog and the warm cream studio scene fill the entire frame edge-to-edge, dog framed head-shoulders slightly off-centre per rule-of-thirds, shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin.',
    decorations: ['paw-print'],
    notes:
      "Featured image auto-générée pour l'article nourriture-bull-terrier le 2026-08-15. Portrait race unique (règle Race), pas de fallback breed générique. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-recette-biscuits-pomme-cannelle-chien',
    group: 'articles',
    ratio: '3:2',
    tone: 'rose',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'Editorial mixed-media lifestyle photo shot from a slightly elevated angle on a warm rustic light wood table: a small baking tray of freshly baked round dog biscuits in a warm golden-oat color, next to a halved red apple showing its core removed, a cinnamon stick, a scattering of rolled oats, and a cracked egg, and leaning in from the right a friendly curious light-golden-coated dog with head tilted, nose close to the tray, calm and inquisitive. Mixed-media editorial style: photorealistic lifestyle photo base combined with subtle hand-drawn gouache decorations layered on top, contour #1A1109. Palette: cream #FAFAF8 dominant background bokeh, amber #FFE8B5 on the biscuits and oats, soft rose #FFD6E3 paw-print accent, small orange #E8622A sparkle accent, hint of green #C2F0D5 on a small drawn leaf.',
    composition:
      'Full-bleed: the tray, apple, ingredients and dog fill the entire frame edge-to-edge, touching all four borders; subject slightly off-centre per rule-of-thirds; shallow depth of field with soft warm cream photographic bokeh spread across the whole frame; no reserved blank cream band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['paw-print', 'sparkle', 'confetti'],
    notes:
      "Featured image auto-générée pour l'article recette-biscuits-pomme-cannelle-chien le 2026-08-16. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-alimentation-chien-grande-race-adulte-guide',
    group: 'articles',
    ratio: '3:2',
    tone: 'rose',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'Editorial mixed-media lifestyle photo in a sunlit warm cream kitchen: a large adult German-Shepherd-type dog with tan-and-black coat standing beside a large round cream ceramic bowl generously filled with kibble, calm attentive expression, natural daylight from the upper-left, soft film grain, shallow depth of field. Mixed-media editorial style: photorealistic dog and bowl with hand-drawn gouache decorations layered on top, contour #1A1109. Palette: cream #FAFAF8 dominant background bokeh, amber #FFE8B5 drawn bone near the bowl, small orange #E8622A sparkle accent above the bowl.',
    composition:
      'Full-bleed: the dog, the bowl and the sunlit kitchen scene fill the entire frame edge-to-edge, touching all four borders; dog slightly off-centre per rule-of-thirds, bowl in the lower third; shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank cream band, column or text margin; composed to survive a centred 16:9 / 4:3 / square crop.',
    decorations: ['bone', 'sparkle'],
    notes:
      "Featured image auto-générée pour l'article alimentation-chien-grande-race-adulte-guide le 2026-08-17. Slot déclaré hors manifest principal (taille du fichier).",
  },
  {
    id: 'art-nourriture-braque-hongrois',
    group: 'articles',
    ratio: '3:2',
    tone: 'amber',
    imageReady: true,
    ext: 'jpeg',
    subject:
      'A chest-up editorial portrait of a Vizsla (Braque Hongrois), sleek short golden-rust copper coat, lean elegant athletic build, refined long muzzle, medium-set rounded drop ears held close to the head, warm amber-hazel eyes, calm friendly inquisitive expression, warm cream studio backdrop, soft natural daylight from the upper-left, gentle catch-light in the eyes, slight 3/4 angle.',
    composition:
      'Full-bleed: the dog and the warm cream studio scene fill the entire frame edge-to-edge, dog framed head-shoulders slightly off-centre per rule-of-thirds, shallow depth of field with soft cream photographic bokeh spread across the whole frame; no reserved blank band, column or text margin.',
    decorations: ['party-hat'],
    notes:
      "Featured image auto-générée pour l'article nourriture-braque-hongrois le 2026-08-18. Portrait race unique (règle Race), pas de fallback breed générique. Slot déclaré hors manifest principal (taille du fichier).",
  },
]

/** Résout un slot additionnel par id (fallback de `getSlotById`). */
export function getExtraSlotById(id: string): ImageSlot | undefined {
  return EXTRA_IMAGE_SLOTS.find((s) => s.id === id)
}
