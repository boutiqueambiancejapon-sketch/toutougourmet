// @cdc marques — FAQ sans doublon des sections de la page (signalé par le propriétaire le 2026-11-07 sur Dog Chef) :
// une question qui porte sur le même sujet qu'un intertitre est retirée de la FAQ et de son JSON-LD.

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const SUJETS: [string, RegExp][] = [
  ['avis-negatifs', /avis negatifs/],
  ['veterinaires', /veterinaires?/],
  ['prix', /\b(prix|coute|coutent|cout)\b/],
  ['concurrents', /concurrent|alternative/],
  ['fabrication', /\b(fabrique|fabriquee?s?|cuisine|produit|origine)\b/],
  ['conservation', /conserv/],
]

const sujetsDe = (texte: string): string[] => SUJETS.filter(([, re]) => re.test(fold(texte))).map(([k]) => k)

/** Prix « selon la taille » : des montants par gabarit que la section prix n'a pas, la question reste. */
const sujetsQuestion = (q: string): string[] => sujetsDe(q).filter((k) => k !== 'prix' || !/taille|gabarit|poids/.test(fold(q)))

export function sansDoublons<T extends { q: string }>(faqs: T[], intertitres: string[]): T[] {
  const traites = new Set(intertitres.flatMap(sujetsDe))
  return faqs.filter((f) => !sujetsQuestion(f.q).some((k) => traites.has(k)))
}
