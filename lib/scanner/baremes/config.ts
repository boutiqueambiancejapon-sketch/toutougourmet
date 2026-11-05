// @cdc scanner — interrupteur des quatre barèmes. Faux : ancien barème, ancien prompt, aucune note
// ne change, même après une fusion. L'activer demande une relecture : voir DECISIONS.md, 2026-11-05.

export const BAREMES_ACTIFS: boolean = false

/** Enregistrée avec l'analyse : son changement fait recalculer les fiches à la lecture. */
export const BAREMES_VERSION = 'baremes-2.0'
