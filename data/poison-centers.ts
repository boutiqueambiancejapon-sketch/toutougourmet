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
