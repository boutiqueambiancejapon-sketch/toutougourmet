export const affiliateLinks = {
  franklin: {
    url: 'https://c3po.link/Q3xbJhfapn',
    label: 'Franklin Pet Food',
    offer: "-30% sur la 1ère commande en abonnement",
    code: null,
  },
  elmut: {
    url: 'https://c3po.link/QWMW4k6mbU',
    label: 'Elmut',
    offer: "-40% sur la 1ère commande via notre lien",
    code: null,
  },
  pettyWell: {
    url: 'https://c3po.link/QHutadCFex',
    label: 'Petty Well',
    offer: "-34% sur la 1ère box",
    code: null,
  },
  dogChef: {
    url: 'https://www.dogchef.com/fr/code/WZU7090',
    label: 'Dog Chef',
    offer: "-35% sur la box d'essai",
    code: 'WZU7090',
  },
} as const

export type BrandKey = keyof typeof affiliateLinks
