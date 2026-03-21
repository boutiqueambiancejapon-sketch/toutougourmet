// @cdc affiliation — sticky CTA par slug d'article
// Priorité : lien affilié de la marque reviewée > Dog Chef fallback

export interface StickyCtaConfig {
  brandName: string
  url: string
  label: string   // texte principal du sticky
  badge?: string  // texte du pill (ex: "-35%", "Maxi Zoo")
  code?: string
}

export const DOG_CHEF_CTA: StickyCtaConfig = {
  brandName: 'Dog Chef',
  url: 'https://www.dogchef.com/fr/code/WZU7090',
  label: 'repas frais personnalisés',
  badge: '-35%',
  code: 'WZU7090',
}

/** Map slug article → config sticky. Si absent → fallback Dog Chef. */
export const STICKY_CTA_BY_SLUG: Record<string, StickyCtaConfig> = {
  'avis-royal-canin': {
    brandName: 'Royal Canin',
    url: 'https://tidd.ly/3PnVz4E',
    label: 'disponible chez Maxi Zoo',
    badge: 'Maxi Zoo',
  },
  'avis-hills-science-diet': {
    brandName: "Hill's Science Diet",
    url: 'https://tidd.ly/3NhWGCf',
    label: 'disponible chez Maxi Zoo',
    badge: 'Maxi Zoo',
  },
  'avis-purina-pro-plan': {
    brandName: 'Purina Pro Plan',
    url: 'https://tidd.ly/4rQdPRJ',
    label: 'disponible chez Maxi Zoo',
    badge: 'Maxi Zoo',
  },
  'avis-orijen': {
    brandName: 'Orijen',
    url: 'https://tidd.ly/47iHVFT',
    label: 'disponible chez Maxi Zoo',
    badge: 'Maxi Zoo',
  },
  'avis-acana': {
    brandName: 'Acana',
    url: 'https://tidd.ly/41iaXC3',
    label: 'disponible chez Maxi Zoo',
    badge: 'Maxi Zoo',
  },
  'avis-wolfsblut': {
    brandName: 'Wolfsblut',
    url: 'https://tidd.ly/47ep2Uy',
    label: 'disponible chez Maxi Zoo',
    badge: 'Maxi Zoo',
  },
  'avis-happy-dog': {
    brandName: 'Happy Dog',
    url: 'https://tidd.ly/4bWG1gJ',
    label: 'disponible chez Maxi Zoo',
    badge: 'Maxi Zoo',
  },
}
