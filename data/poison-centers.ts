import type { Locale } from '@/lib/i18n/config'

// @cdc seo-geo §2.7 — numéros affichés dans les sections « Que faire si… ».
// Mêmes numéros que ceux cités dans les articles (CNITV et CAPAE-Ouest).
// Horaires affichés seulement quand ils sont confirmés.

export interface PoisonCenter {
  /** Sigle affiché en gros. */
  name: string
  fullName: string
  city: string
  /** Numéro tel qu'il s'écrit dans le pays. */
  phone: string
  /** Numéro au format international pour le lien tel:. */
  tel: string
  hours?: string
  /** Précision affichée sous le centre (service payant, etc.). */
  note?: string
  /** Article devant le nom dans une phrase (« appelle la Pet Poison Helpline »), « le » par défaut. */
  article?: 'le' | 'la'
}

export const POISON_CENTERS: Record<Locale, PoisonCenter[]> = {
  fr: [
    {
      name: 'CNITV',
      fullName: "Centre national d'informations toxicologiques vétérinaires",
      city: 'Lyon',
      phone: '04 78 87 10 40',
      tel: '+33478871040',
      hours: '24\u00a0h/24',
    },
    {
      name: 'CAPAE-Ouest',
      fullName: "Centre antipoison animal et environnemental de l'Ouest",
      city: 'Nantes',
      phone: '02 40 68 77 40',
      tel: '+33240687740',
    },
  ],
  // Lot 8 : centres du pays visé par l'édition anglaise.
  en: [],
}

// @cdc urgences — numéros selon le pays du visiteur (vérifiés le 2026-11-03).
// Belgique : Centre Antipoisons belge, 24 h/24, répond aussi pour les animaux (poisoncentre.be).
// Canada : le Centre antipoison du Québec ne traite pas les animaux ; Pet Poison Helpline,
// service payant (environ 89 $ par cas, petpoisonhelpline.com), ou urgence vétérinaire 24 h.
export type PoisonCountry = 'FR' | 'BE' | 'CA'

export const POISON_COUNTRIES: { code: PoisonCountry; label: string; centers: PoisonCenter[]; advice?: string }[] = [
  { code: 'FR', label: 'France', centers: POISON_CENTERS.fr },
  {
    code: 'BE',
    label: 'Belgique',
    centers: [
      {
        name: 'Centre Antipoisons',
        fullName: 'Centre Antipoisons belge, aussi pour les animaux',
        city: 'Bruxelles',
        phone: '070 245 245',
        tel: '+3270245245',
        hours: '24\u00a0h/24',
      },
    ],
  },
  {
    code: 'CA',
    label: 'Canada',
    centers: [
      {
        name: 'Pet Poison Helpline',
        fullName: 'Centre antipoison vétérinaire pour le Canada et les États-Unis',
        city: 'Canada',
        phone: '1 855 764-7661',
        tel: '+18557647661',
        hours: '24\u00a0h/24',
        note: 'Service payant, environ 89\u00a0$ par cas.',
        article: 'la',
      },
    ],
    advice: "Le Centre antipoison du Québec ne traite pas les animaux. Appelle aussi ton vétérinaire ou une urgence vétérinaire 24\u00a0h.",
  },
]

export const isPoisonCountry = (c: unknown): c is PoisonCountry => c === 'FR' || c === 'BE' || c === 'CA'
