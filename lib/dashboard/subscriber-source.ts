// @cdc tableau de bord — libellé lisible de l'attribut Brevo SOURCE (envoyé par /api/contact).
// Valeurs connues : « guide » (GuideOffer), le nom court d'un outil (KeepResult), le modèle vierge
// de fiche de garde, l'encart lettre (accueil, blog, fin d'article) qui envoie son ancien _subject.
// Une valeur inconnue s'affiche telle quelle, coupée à 40 caractères.

const LABELS: Record<string, string> = {
  guide: 'Guide PDF',
  'fiche-garde-vierge': 'Fiche de garde vierge',
  'Nouvelle inscription newsletter': 'Encart lettre (accueil, blog, article)',
  site: 'Site, sans précision',
  ration: 'Outil ration',
  'bien-nourri': 'Bilan bien nourri',
  age: 'Outil âge',
  budget: 'Outil budget',
  cout: 'Comparateur de coût',
  'etat-corporel': 'Outil état corporel',
  quiz: 'Quiz',
}

export function subscriberSourceLabel(source: string | null | undefined): string {
  const raw = (source ?? '').trim().replace(/^outil-/, '')
  if (!raw) return 'Non renseignée'
  if (Object.hasOwn(LABELS, raw)) return LABELS[raw]
  if (raw.startsWith('Résultat ')) return 'Résultat d’outil'
  return raw.length > 40 ? `${raw.slice(0, 39)}…` : raw
}
