// Contrôle IA des fiches du scanner, sans photo : envoie à Gemini le JSON de chaque fiche à contrôler
// et enregistre son jugement dans app.food_check. Idempotent : une fiche déjà contrôlée, sans
// changement, n'est pas renvoyée ; un arrêt se reprend au lancement suivant. Appelé après l'import du
// dimanche (deploy/toutou-opff-import.service). Le script n'écrit rien d'autre : `reviewed` reste
// réservé à la relecture humaine.
//
// Lancer depuis la racine du site, variables de /srv/toutou/shared/.env chargées :
//   node_modules/.bin/tsx scripts/check-fiches-ai.ts                 (300 appels au plus)
//   … --dry             aucun appel ni écriture : nombre de fiches et coût estimé
//   … --limit=20        20 appels au plus dans ce passage (300 reste le maximum)
//   … --recheck-doubt   renvoie aussi les fiches en doute
// Variables : DATABASE_URL, GEMINI_API_KEY, GEMINI_CHECK_MODEL (facultatif).

import { FICHE_CHECK_INSTRUCTIONS, FICHE_CHECK_SCHEMA, ficheCheckMessage, MAX_CALLS_PER_RUN } from '../lib/scanner/fiche-check'
import { runFicheCheck } from '../lib/scanner/fiche-check-run'
import { geminiJson, redactGeminiKey } from '../lib/scanner/providers/gemini'
import { getDb } from '../lib/server/drizzle'
import { ficheCheckStore } from '../lib/server/fiche-check'

const CALL_TIMEOUT_MS = 30_000

const args = process.argv.slice(2)
const known = /^--(dry|recheck-doubt|limit=\d+)$/
const unknown = args.filter((a) => !known.test(a))
const limitArg = args.find((a) => a.startsWith('--limit='))?.slice('--limit='.length)

async function main(): Promise<number> {
  if (unknown.length > 0) {
    console.error(`[check] option inconnue : ${unknown.join(' ')}`)
    return 2
  }
  const dry = args.includes('--dry')
  const db = getDb()
  if (!db) throw new Error('DATABASE_URL manquant')
  if (!dry && !process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY manquant')
  const summary = await runFicheCheck({
    store: ficheCheckStore(db, { recheckDoubt: args.includes('--recheck-doubt') }),
    dry,
    limit: limitArg ? Number(limitArg) : MAX_CALLS_PER_RUN,
    redact: redactGeminiKey,
    judge: (input) =>
      geminiJson({
        system: FICHE_CHECK_INSTRUCTIONS,
        message: ficheCheckMessage(input),
        schema: FICHE_CHECK_SCHEMA,
        model: process.env.GEMINI_CHECK_MODEL,
        maxOutputTokens: 512,
        signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
      }),
  })
  return summary.stopped ? 1 : 0
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    console.error('[check] échec :', redactGeminiKey(err instanceof Error ? err.message : String(err)))
    process.exit(1)
  })
