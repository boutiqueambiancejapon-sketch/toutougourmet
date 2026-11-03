// @cdc fiche de garde — « Jamais, même un peu » : aliments classés « danger » dans les guides
// du site (frontmatter verdict: danger, rubrique urgences), réduits à ceux qu'un gardien a sous
// la main. Chaque entrée renvoie à son guide urgence. Les « restes de table » s'ajoutent : pas
// un poison, mais la cause la plus courante de diarrhée pendant une garde.

export interface ForbiddenFood {
  label: string
  /** Guide urgence du site, null pour les restes de table */
  href: string | null
}

export const FORBIDDEN_FOODS: ForbiddenFood[] = [
  { label: 'Chocolat', href: '/chien/urgences/chien-mange-chocolat-urgence' },
  { label: 'Raisin, raisins secs', href: '/chien/urgences/chien-mange-raisin-urgence' },
  { label: 'Oignon, ail, poireau', href: '/chien/urgences/chien-mange-ail-oignon-urgence' },
  { label: 'Xylitol (chewing-gum, bonbons sans sucre)', href: '/chien/urgences/chien-mange-xylitol-urgence' },
  { label: 'Os cuits', href: '/chien/urgences/chien-mange-os-cuit-urgence' },
  { label: 'Noix de macadamia', href: '/chien/urgences/chien-mange-noix-macadamia-urgence' },
  { label: 'Café, thé', href: '/chien/urgences/chien-mange-cafe-urgence' },
  { label: 'Restes de table', href: null },
]

export const FORBIDDEN_LIST_HREF = '/chien/urgences/aliments-toxiques-chien-liste-complete'
