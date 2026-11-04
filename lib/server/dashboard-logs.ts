import { promises as fs } from 'node:fs'
import path from 'node:path'

// @cdc tableau de bord — comptes rendus de la tâche de nuit (deploy/seo-rewrite.sh écrit un
// fichier YYYY-MM-DD.log par nuit). Dossier fourni par DASHBOARD_LOG_DIR, rien en dur.

export type NightStatus = 'ok' | 'idle' | 'error' | 'unknown'

export interface NightLog {
  date: string
  status: NightStatus
  tail: string[]
  /** Phrase courte tirée de la ligne finale du script */
  summary: string
  /** Lignes « À vérifier » du compte rendu */
  checks: string[]
}

const FILE = /^\d{4}-\d{2}-\d{2}\.log$/
const TAIL = 12
const MAX_CHECKS = 4

const strip = (line: string): string => line.replace(/\*\*/g, '').replace(/`/g, '').trim()

/** Résumé sans appel d'IA : nombre d'articles de la ligne « Poussé », sinon le statut seul. */
export function nightSummary(text: string, status: NightStatus): string {
  if (status === 'error') return 'La tâche a échoué, compte rendu à lire.'
  if (status === 'idle') return 'Rien à publier cette nuit-là.'
  if (status === 'unknown') return 'En cours, ou arrêtée avant la fin.'
  const pushed = [...text.matchAll(/^✓ Poussé.*$/gm)].map((m) => m[0])
  const counted = pushed.map((l) => /(\d+) articles?/.exec(l)).filter((m) => m !== null)
  const total = counted.reduce((sum, m) => sum + Number(m[1]), 0)
  return total > 0 ? `${total} article${total > 1 ? 's' : ''} retouché${total > 1 ? 's' : ''}, publié${total > 1 ? 's' : ''}.` : 'Modifications publiées.'
}

export function nightChecks(text: string): string[] {
  return text
    .split('\n')
    .map(strip)
    .filter((l) => /^[-*\s]*à vérifier/i.test(l))
    .map((l) => l.replace(/^[-*\s]*à vérifier[^:]*:\s*/i, ''))
    .filter(Boolean)
    .slice(0, MAX_CHECKS)
}

/** Les marqueurs viennent de deploy/seo-rewrite.sh. */
function statusOf(text: string): NightStatus {
  if (/^✗ /m.test(text) || /a terminé avec une erreur/.test(text)) return 'error'
  if (/^✓ /m.test(text)) return 'ok'
  if (/^Aucun commit/m.test(text)) return 'idle'
  return 'unknown'
}

export function nightLogDir(): string | null {
  return process.env.DASHBOARD_LOG_DIR || null
}

export async function getNightLogs(limit = 7): Promise<NightLog[]> {
  const dir = nightLogDir()
  if (!dir) return []
  let names: string[]
  try {
    names = (await fs.readdir(dir)).filter((n) => FILE.test(n)).sort().reverse().slice(0, limit)
  } catch {
    return []
  }
  return Promise.all(
    names.map(async (name) => {
      const text = await fs.readFile(path.join(dir, name), 'utf-8').catch(() => '')
      const lines = text.split('\n').map((l) => l.trimEnd()).filter(Boolean)
      const status = statusOf(text)
      return { date: name.slice(0, 10), status, tail: lines.slice(-TAIL), summary: nightSummary(text, status), checks: nightChecks(text) }
    }),
  )
}

export interface ToneProgress {
  done: number
  total: number
}

/** Avancée de la réécriture, lue dans la file versionnée : à jour à chaque mise en ligne. */
export async function getToneProgress(): Promise<ToneProgress | null> {
  try {
    const text = await fs.readFile(path.join(process.cwd(), 'docs/tone-v2-queue.md'), 'utf-8')
    const done = (text.match(/^- \[x\] /gm) ?? []).length
    const left = (text.match(/^- \[ \] /gm) ?? []).length
    return done + left > 0 ? { done, total: done + left } : null
  } catch {
    return null
  }
}
