// @cdc affiliation — sticky CTA par slug d'article
// Priorité : double (VS articles) > single (avis) > Dog Chef fallback

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

export interface StickyCtaDoubleConfig {
  eyebrow?: string
  brandA: { label: string; href: string }
  brandB: { label: string; href: string }
}

/** VS articles : double sticky avec les deux marques côte à côte. */
export const STICKY_CTA_DOUBLE_BY_SLUG: Record<string, StickyCtaDoubleConfig> = {
  'dog-chef-vs-royal-canin': {
    eyebrow: 'Comparer les deux',
    brandA: { label: 'Essayer Dog Chef (-35%)', href: 'https://www.dogchef.com/fr/code/WZU7090' },
    brandB: { label: 'Royal Canin chez Maxi Zoo', href: 'https://tidd.ly/3PnVz4E' },
  },
  'elmut-vs-edgard-cooper': {
    eyebrow: 'Comparer les deux',
    brandA: { label: 'Essayer Elmut (-40%)', href: 'https://c3po.link/QWMW4k6mbU' },
    brandB: { label: 'Edgard & Cooper chez Maxi Zoo', href: 'https://tidd.ly/40MJXuf' },
  },
  'eukanuba-vs-royal-canin': {
    eyebrow: 'Comparer les deux',
    brandA: { label: 'Royal Canin chez Maxi Zoo', href: 'https://tidd.ly/3PnVz4E' },
    brandB: { label: 'Eukanuba chez Maxi Zoo', href: 'https://tidd.ly/4rPSibE' },
  },
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
  // VS articles — une seule marque a un lien affilié
  'just-russel-vs-royal-canin': {
    brandName: 'Royal Canin',
    url: 'https://tidd.ly/3PnVz4E',
    label: 'disponible chez Maxi Zoo',
    badge: 'Maxi Zoo',
  },
  'just-russel-vs-elmut': {
    brandName: 'Elmut',
    url: 'https://c3po.link/QWMW4k6mbU',
    label: 'repas frais qualité humaine',
    badge: '-40%',
  },
}
