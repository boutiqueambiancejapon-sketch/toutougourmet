// @cdc scanner — interrupteur des quatre barèmes. Faux : ancien barème, ancien prompt, aucune note
// ne change. Activé le 2026-11-05 sur décision du propriétaire : voir DECISIONS.md.

export const BAREMES_ACTIFS: boolean = true

/** Enregistrée avec l'analyse : son changement fait recalculer les fiches à la lecture. */
export const BAREMES_VERSION = 'baremes-2.0'
