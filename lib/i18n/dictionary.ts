/**
 * Chaînes d'interface par locale.
 *
 * @cdc i18n — le FR est la référence : toute chaîne listée ici reprend mot pour
 * mot ce qui était hardcodé dans les composants avant l'extraction, pour que le
 * rendu des 327 pages FR existantes soit strictement inchangé.
 */

import type { Locale } from './config'

export interface Dictionary {
  nav: { label: string; href: string }[]
  /** CTA principal du header — `null` quand la locale n'a pas encore l'outil visé */
  cta: { label: string; href: string } | null
  openMenu: string
  closeMenu: string
  mainNavLabel: string
  breadcrumbLabel: string
  readTime: string
  coverAltPrefix: string
  articleCtas: { label: string; href: string }[]
  /** Sidebar marques — masquée tant que les fiches marques ne sont pas traduites */
  showBrandsSidebar: boolean
  tldrTitle: string
  summarizeWith: string
  relatedTitle: string
  relatedLabel: string
  authorSectionLabel: string
  authorAllArticles: string
  brandsSidebarTitle: string
  brandsSidebarQuizTitle: string
  brandsSidebarQuizText: string
  newsletterTitle: string
  newsletterDescription: string
  footerTagline: string
  footerAffiliateNote: string
  footerAffiliateLink: string
  footerRights: string
  footerDisclosure: string
  footerDisclosureLink: string
  footerColumns: { title: string; links: { href: string; label: string }[] }[]
  languageSwitchLabel: string
  hubTitle: string
  hubDescription: string
  hubLatest: string
  hubEmpty: string
}

const fr: Dictionary = {
  nav: [
    { label: 'Guides', href: '/chien' },
    { label: 'Races', href: '/chien/race' },
    { label: 'Comparateur', href: '/comparateur' },
    { label: 'Marques', href: '/chien/marque' },
    { label: 'Outils', href: '/outils' },
    { label: 'Blog', href: '/blog' },
  ],
  cta: { label: 'Faire le quiz →', href: '/quiz' },
  openMenu: 'Ouvrir le menu',
  closeMenu: 'Fermer le menu',
  mainNavLabel: 'Navigation principale',
  breadcrumbLabel: "Fil d'Ariane",
  readTime: 'min de lecture',
  coverAltPrefix: 'Illustration de couverture',
  articleCtas: [
    { label: '→ Faire le quiz personnalisé', href: '/quiz' },
    { label: '→ Voir le comparateur complet', href: '/comparateur' },
  ],
  showBrandsSidebar: true,
  tldrTitle: 'En bref',
  summarizeWith: 'Résumer cet article avec :',
  relatedTitle: 'Continuer votre lecture…',
  relatedLabel: 'Articles similaires',
  authorSectionLabel: "À propos de l'auteur",
  authorAllArticles: 'Tous ses articles →',
  brandsSidebarTitle: 'Recommandées pour ce profil',
  brandsSidebarQuizTitle: 'Pas sûr(e) du bon choix ?',
  brandsSidebarQuizText:
    '2 min de quiz et on te recommande la marque la plus alignée avec ton animal.',
  newsletterTitle: 'Rejoins la meute 🐾',
  newsletterDescription: 'Comparatifs, promos et conseils nutrition — sans blabla, sans spam.',
  footerTagline:
    'Le comparateur fun et honnête de la bouffe premium pour chiens et chats en France.',
  footerAffiliateNote: 'Site indépendant monétisé par affiliation.',
  footerAffiliateLink: 'En savoir plus',
  footerRights: 'Tous droits réservés',
  footerDisclosure: 'Les liens de ce site peuvent être affiliés.',
  footerDisclosureLink: 'Disclosure complète',
  footerColumns: [
    {
      title: 'Les marques',
      links: [
        { href: '/marques/franklin', label: 'Franklin Pet Food' },
        { href: '/marques/elmut', label: 'Elmut' },
        { href: '/marques/petty-well', label: 'Petty Well' },
        { href: '/marques/dog-chef', label: 'Dog Chef' },
      ],
    },
    {
      title: 'Outils',
      links: [
        { href: '/quiz', label: 'Le quiz personnalisé' },
        { href: '/comparateur', label: 'Comparateur' },
        { href: '/outils', label: 'Calculateurs & Simulateurs' },
        { href: '/blog', label: 'Le blog' },
      ],
    },
    {
      title: 'Infos',
      links: [
        { href: '/a-propos', label: 'À propos' },
        { href: '/contact', label: 'Contact' },
        { href: '/mentions-legales', label: 'Mentions légales' },
        { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
        { href: '/plan-du-site', label: 'Plan du site' },
      ],
    },
  ],
  languageSwitchLabel: 'Nederlands (België)',
  hubTitle: 'Le blog',
  hubDescription: 'Nos guides nutrition pour chien.',
  hubLatest: 'Derniers articles',
  hubEmpty: 'Aucun article pour le moment.',
}

const nl: Dictionary = {
  nav: [
    { label: 'Gidsen', href: '/nl/hond' },
    { label: 'Blog', href: '/nl' },
  ],
  // Phase 1 NL = blog seul : pas de CTA vers le quiz, qui n'existe qu'en FR.
  cta: null,
  openMenu: 'Menu openen',
  closeMenu: 'Menu sluiten',
  mainNavLabel: 'Hoofdnavigatie',
  breadcrumbLabel: 'Kruimelpad',
  readTime: 'min leestijd',
  coverAltPrefix: 'Illustratie',
  // Phase 1 NL = blog seul : quiz et comparateur ne sont pas encore traduits.
  articleCtas: [],
  // Les fiches marques sont en FR : on n'envoie pas un lecteur NL dessus.
  showBrandsSidebar: false,
  tldrTitle: 'In het kort',
  summarizeWith: 'Vat dit artikel samen met:',
  relatedTitle: 'Lees ook…',
  relatedLabel: 'Gelijkaardige artikels',
  authorSectionLabel: 'Over de auteur',
  authorAllArticles: 'Alle artikels →',
  brandsSidebarTitle: 'Aangeraden voor dit profiel',
  brandsSidebarQuizTitle: 'Twijfel je nog ?',
  brandsSidebarQuizText:
    '2 minuten test en we tonen je het merk dat het best bij je hond past.',
  newsletterTitle: 'Doe mee met de roedel 🐾',
  newsletterDescription: 'Vergelijkingen, promo’s en voedingsadvies — geen spam, geen blabla.',
  footerTagline:
    'De eerlijke vergelijker van premium voeding voor honden en katten in België.',
  footerAffiliateNote: 'Onafhankelijke site, gefinancierd via affiliatie.',
  footerAffiliateLink: 'Meer weten',
  footerRights: 'Alle rechten voorbehouden',
  footerDisclosure: 'De links op deze site kunnen affiliatielinks zijn.',
  footerDisclosureLink: 'Volledige disclosure',
  footerColumns: [
    {
      title: 'Lezen',
      links: [
        { href: '/nl', label: 'Alle artikels' },
        { href: '/nl/hond/dagelijkse-voeding', label: 'Je hond goed voeden' },
        { href: '/nl/hond/gevaarlijke-voeding', label: 'Gevaarlijke voeding' },
      ],
    },
    {
      title: 'Info',
      links: [
        { href: '/a-propos', label: 'Over ons' },
        { href: '/contact', label: 'Contact' },
        { href: '/mentions-legales', label: 'Wettelijke vermeldingen' },
        { href: '/politique-de-confidentialite', label: 'Privacybeleid' },
      ],
    },
  ],
  languageSwitchLabel: 'Français',
  hubTitle: 'Hondenvoeding, eerlijk uitgelegd',
  hubDescription:
    'Onze voedingsgidsen voor honden, geschreven voor Belgische baasjes. Elke dag komen er artikels bij.',
  hubLatest: 'Recentste artikels',
  hubEmpty: 'Nog geen artikels.',
}

const DICTIONARIES: Record<Locale, Dictionary> = { fr, nl }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
