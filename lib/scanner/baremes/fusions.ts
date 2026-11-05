// @cdc scanner — fiches fusionnées par scripts/activer-baremes.ts : l'ancienne adresse redirige vers la
// fiche gardée. Sans effet tant que l'ancienne fiche existe en base : la fiche trouvée passe avant.

export const FUSIONS: { ancien: string; garde: string }[] = [
  { ancien: 'ultra-premium-direct-patee-pour-chien-agneau', garde: 'ultra-premium-direct-patee-chien-sans-cereales-agneau' },
  { ancien: 'ultra-premium-direct-patee-pour-chien-poulet-dinde', garde: 'ultra-premium-direct-patee-chien-sans-cereales-poulet-dinde' },
]

/** Adresse de la fiche gardée, ou null si cette adresse n'a pas été fusionnée. */
export const ficheGardee = (slug: string): string | null => FUSIONS.find((f) => f.ancien === slug)?.garde ?? null

/** Réponse de redirection pour une route de fiche (PDF, image). Null si rien à rediriger. */
export function redirectionFusion(slug: string, fichier: string): Response | null {
  const garde = ficheGardee(slug)
  return garde ? new Response(null, { status: 308, headers: { Location: `/croquettes/${garde}/${fichier}` } }) : null
}
