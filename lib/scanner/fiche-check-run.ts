import type { FicheCheckStatus } from '@/db/schema/scanner'
import { costUsd, ESTIMATED_OUTPUT_TOKENS, estimateTokens, FICHE_CHECK_INSTRUCTIONS, ficheCheckMessage, MAX_CALLS_PER_RUN, parseFicheVerdict, type FicheCheckInput } from './fiche-check'

// @cdc scanner — boucle d'un passage du contrôle IA, sans base ni réseau : le magasin et le modèle
// sont injectés (tests : modèle simulé). Chaque résultat est écrit tout de suite : un arrêt perd au
// plus l'appel en cours, et le passage suivant reprend là. Le journal ne contient ni clé, ni texte
// d'étiquette. Aucune écriture autre que la ligne de contrôle.

export interface PendingFiche {
  id: string
  input: FicheCheckInput
  /** md5(extracted::text) lu en même temps que la fiche */
  contentHash: string
}

export interface JudgeReply {
  text: string
  inputTokens: number
  outputTokens: number
  model: string
}

export type FicheJudge = (input: FicheCheckInput) => Promise<JudgeReply>

export interface FicheCheckRow {
  foodAnalysisId: string
  status: FicheCheckStatus
  reason: string
  model: string
  contentHash: string
  inputTokens: number
  outputTokens: number
}

export interface FicheCheckStore {
  /** Fiches à contrôler, les vrais scans d'abord ; `limit` au plus */
  pending: (limit: number) => Promise<PendingFiche[]>
  /** Nombre total à contrôler, au-delà de `limit` */
  pendingCount: () => Promise<number>
  save: (row: FicheCheckRow) => Promise<void>
}

export interface RunOptions {
  store: FicheCheckStore
  judge: FicheJudge
  dry?: boolean
  limit?: number
  /** Pause entre deux appels (ms) */
  pauseMs?: number
  /** Arrêt du passage après autant d'échecs d'appel à la suite */
  maxConsecutiveErrors?: number
  log?: (line: string) => void
  /** Retire la clé de tout message d'erreur avant le journal */
  redact?: (message: string) => string
}

export interface RunSummary {
  pending: number
  calls: number
  byStatus: Record<FicheCheckStatus, number>
  invalid: number
  errors: number
  inputTokens: number
  outputTokens: number
  costUsd: number
  stopped: boolean
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function runFicheCheck({ store, judge, dry = false, limit = MAX_CALLS_PER_RUN, pauseMs = 250, maxConsecutiveErrors = 5, log = console.log, redact = (m) => m }: RunOptions): Promise<RunSummary> {
  const cap = Math.max(0, Math.min(Number.isFinite(limit) ? limit : MAX_CALLS_PER_RUN, MAX_CALLS_PER_RUN))
  const total = await store.pendingCount()
  const fiches = await store.pending(cap)
  const summary: RunSummary = { pending: total, calls: 0, byStatus: { ok: 0, doubt: 0, rejected: 0 }, invalid: 0, errors: 0, inputTokens: 0, outputTokens: 0, costUsd: 0, stopped: false }
  log(`[check] ${total} fiches à contrôler, ${fiches.length} dans ce passage (plafond ${MAX_CALLS_PER_RUN})`)

  if (dry) {
    const system = estimateTokens(FICHE_CHECK_INSTRUCTIONS)
    summary.inputTokens = fiches.reduce((sum, f) => sum + system + estimateTokens(ficheCheckMessage(f.input)), 0)
    summary.outputTokens = fiches.length * ESTIMATED_OUTPUT_TOKENS
    summary.costUsd = costUsd(summary.inputTokens, summary.outputTokens)
    log(`[check] --dry : aucun appel, rien d'écrit. Estimation sans réflexion du modèle : ${summary.inputTokens} jetons en entrée, ${summary.outputTokens} en sortie, ${summary.costUsd.toFixed(4)} $`)
    return summary
  }

  let streak = 0
  for (const fiche of fiches) {
    summary.calls++
    try {
      const reply = await judge(fiche.input)
      const verdict = parseFicheVerdict(reply.text, fiche.input)
      await store.save({ foodAnalysisId: fiche.id, status: verdict.status, reason: verdict.reason, model: reply.model, contentHash: fiche.contentHash, inputTokens: reply.inputTokens, outputTokens: reply.outputTokens })
      summary.byStatus[verdict.status]++
      if (!verdict.valid) summary.invalid++
      summary.inputTokens += reply.inputTokens
      summary.outputTokens += reply.outputTokens
      log(`[check] ${fiche.id} ${verdict.status}${verdict.valid ? '' : ' (réponse illisible)'} jetons entrée=${reply.inputTokens} sortie=${reply.outputTokens}`)
      streak = 0
    } catch (err) {
      summary.errors++
      streak++
      // Rien d'écrit : la fiche reste à contrôler, le passage suivant la reprend.
      log(`[check] ${fiche.id} échec d'appel : ${redact(err instanceof Error ? err.message : String(err)).slice(0, 200)}`)
      if (streak >= maxConsecutiveErrors) {
        summary.stopped = true
        log(`[check] arrêt après ${streak} échecs à la suite`)
        break
      }
    }
    if (pauseMs > 0) await wait(pauseMs)
  }
  summary.costUsd = costUsd(summary.inputTokens, summary.outputTokens)
  log(`[check] appels=${summary.calls} ok=${summary.byStatus.ok} doubt=${summary.byStatus.doubt} rejected=${summary.byStatus.rejected} illisibles=${summary.invalid} echecs=${summary.errors} jetons entrée=${summary.inputTokens} sortie=${summary.outputTokens} coût=${summary.costUsd.toFixed(4)} $`)
  return summary
}
