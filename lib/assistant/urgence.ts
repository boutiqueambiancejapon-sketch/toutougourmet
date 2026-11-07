// @cdc assistant — centres antipoison vétérinaires, affichés seulement quand Milo juge la situation urgente
// (décision du propriétaire du 2026-11-07 : d'abord des questions, la recommandation si c'est vraiment grave).

export const CENTRES_ANTIPOISON = [
  { nom: 'CNITV (Lyon)', tel: '04 78 87 10 40' },
  { nom: 'CAPAE-Ouest (Nantes)', tel: '02 40 68 77 40' },
]

export type Gravite = 'aucune' | 'veterinaire' | 'urgence'
