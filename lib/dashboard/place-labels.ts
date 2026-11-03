import { GUIDE_PLACES } from '@/lib/guide/config'
import { SIGNUP_PLACES } from '@/lib/signup-places'

// @cdc tableau de bord — emplacements en clair dans l'onglet Conversions : inscriptions (lettre,
// guide « guide · <place> », e-mail de résultat d'outil) et clics partenaires (data-cta).
// Un emplacement inconnu reste affiché tel quel.

const EMAIL_PLACES: Record<string, string> = {
  ...GUIDE_PLACES,
  'tool-email': 'E-mail de résultat d’outil',
  'tool-ration': 'Sous la ration (ancien encart)',
  'tool-etat-corporel': 'Sous le poids (ancien encart)',
  'tool-bien-nourri': 'Sous le bilan (ancien encart)',
  'tool-age': 'Sous l’âge (ancien encart)',
}

const CLICK_PLACES: Record<string, string> = {
  'brand-article': 'Bouton marque dans un article',
  'article-lien': 'Lien dans le texte d’un article',
  'article-texte': 'Autre lien dans un article',
  sticky: 'Bandeau collant',
  'brand-sticky': 'Bandeau collant (fiche marque)',
  'brand-duel-sticky': 'Bandeau collant (duel)',
  'mid-dog-chef': 'Encart du milieu (Dog Chef)',
  'race-compare': 'Comparatif race',
  'race-compare-choix': 'Comparatif race, notre choix',
  'account-offer': 'Offres du compte',
  'account-alternative': 'Alternative au scan (compte)',
  'tool-ration': 'Offre sous la ration',
  'tool-etat-corporel': 'Offre sous le poids',
  'tool-bien-nourri': 'Offre sous le bilan',
  'tool-budget': 'Offre du budget',
  'quiz-result': 'Résultat du quiz',
  'scan-alternative': 'Alternative sur une fiche croquettes',
  'brand-fiche': 'Fiche marque',
  autre: 'Autre emplacement',
}

/** « guide · popup » → « Guide · Panneau du guide » ; « tool-email » → « E-mail de résultat d’outil ». */
export function emailPlaceLabel(raw: string): string {
  const guide = raw.match(/^guide · (.+)$/)
  if (guide) return `Guide · ${EMAIL_PLACES[guide[1]] ?? guide[1]}`
  return EMAIL_PLACES[raw] ?? (raw in SIGNUP_PLACES ? SIGNUP_PLACES[raw as keyof typeof SIGNUP_PLACES] : raw)
}

export function clickPlaceLabel(raw: string): string {
  return CLICK_PLACES[raw] ?? raw
}
