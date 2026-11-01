import type { Locale } from './config'

// @cdc i18n — textes d'interface partagés entre les langues. Le texte propre à
// une page reste dans la page. Chaque langue doit fournir toutes les clés.

export interface Dictionary {
  common: {
    skipLink: string
  }
  nav: {
    home: string
    /** Libellé du lien vers l'autre langue, écrit dans la langue cible. */
    otherLocale: string
  }
  footer: {
    tagline: string
    rights: string
    legal: string
  }
  article: {
    tldrTitle: string
    sizeTable: {
      weight: string
      breeds: string
      amount: string
      detail: string
      frequency: string
    }
    whatToDo: {
      title: string
    }
    poisonCenters: {
      title: string
      intro: string
      call: string
      empty: string
    }
  }
}

const fr: Dictionary = {
  common: {
    skipLink: 'Aller au contenu principal',
  },
  nav: {
    home: 'Accueil',
    otherLocale: 'English version',
  },
  footer: {
    tagline: "Guides d'alimentation pour chiens, avec leurs sources.",
    rights: 'Tous droits réservés',
    legal: 'Mentions légales',
  },
  article: {
    tldrTitle: "L'essentiel",
    sizeTable: {
      weight: 'Gabarit',
      breeds: 'Exemples de races',
      amount: 'Quantité',
      detail: 'Équivalent',
      frequency: 'Fréquence',
    },
    whatToDo: {
      title: 'Les étapes',
    },
    poisonCenters: {
      title: 'Centres antipoison vétérinaires',
      intro: "Prépare le poids du chien, ce qu'il a avalé, la quantité et l'heure : on te les demandera.",
      call: 'Appeler',
      empty: 'Appelle ton vétérinaire ou le vétérinaire de garde.',
    },
  },
}

const en: Dictionary = {
  common: {
    skipLink: 'Skip to main content',
  },
  nav: {
    home: 'Home',
    otherLocale: 'Version française',
  },
  footer: {
    tagline: 'Dog nutrition guides, with their sources.',
    rights: 'All rights reserved',
    legal: 'Legal notice (in French)',
  },
  article: {
    tldrTitle: 'Key points',
    sizeTable: {
      weight: 'Size',
      breeds: 'Breed examples',
      amount: 'Amount',
      detail: 'Equivalent',
      frequency: 'How often',
    },
    whatToDo: {
      title: 'Steps',
    },
    poisonCenters: {
      title: 'Animal poison helplines',
      intro: 'Have your dog’s weight, what it ate, how much and when ready: you will be asked.',
      call: 'Call',
      empty: 'Call your vet or the nearest emergency vet.',
    },
  },
}

const dictionaries: Record<Locale, Dictionary> = { fr, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
