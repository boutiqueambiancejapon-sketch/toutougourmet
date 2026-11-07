// @cdc mesure — emplacements des invitations à créer un compte (CRO compte, maquette 2026-11).
// Chaque invitation porte un `place` : vue et clic mesurés dans le navigateur (track), puis
// l'emplacement suit le visiteur jusqu'à l'inscription par ?source= dans l'URL d'inscription.
// Le serveur le relit au moment de créer le compte (lib/server/signup-source.ts).

export const SIGNUP_PLACES = {
  header: 'Bouton en haut',
  'tool-ration': 'Après la ration',
  'tool-poids': 'Après le poids',
  'tool-bilan': 'Après le bilan',
  'tool-age': 'Après l’âge',
  'tool-scanner': 'Scanner',
  'fiche-chien': 'Fiche : vérifier pour mon chien',
  'fiche-favori': 'Fiche : enregistrer cet aliment',
  'fiche-garde': 'Fiche de garde',
  'article-poids': 'Fin d’article (poids)',
  'article-croquettes': 'Fin d’article (croquettes)',
  'article-aliments': 'Fin d’article (aliments)',
  'tool-email': 'E-mail de résultat d’outil',
  'email-j4': 'E-mail de bienvenue, jour 4',
} as const

export type SignupPlace = keyof typeof SIGNUP_PLACES

/** Inscription sans emplacement connu (lien direct, ancienne invitation, page connexion…). */
export const OTHER_PLACE = 'autre'

export function isSignupPlace(value: unknown): value is SignupPlace {
  return typeof value === 'string' && Object.hasOwn(SIGNUP_PLACES, value)
}

export function signupPlaceLabel(place: string): string {
  return isSignupPlace(place) ? SIGNUP_PLACES[place] : 'Autre ou direct'
}

/** URL d'inscription : page de retour + emplacement d'origine. */
export function signupHref(place: SignupPlace, retour: string): string {
  return `/compte/inscription?retour=${encodeURIComponent(retour)}&source=${place}`
}
