import { promises as fs } from 'node:fs'
import path from 'node:path'

// @cdc tableau de bord — comptes rendus de la tâche de nuit (deploy/seo-rewrite.sh écrit un
// fichier YYYY-MM-DD.log par nuit). Dossier fourni par DASHBOARD_LOG_DIR, rien en dur.

export type NightStatus = 'ok' | 'idle' | 'error' | 'unknown'

export interface NightLog {
  date: string
  status: NightStatus
  tail: string[]
}

const FILE = /^\d{4}-\d{2}-\d{2}\.log$/
const TAIL = 6

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
      return { date: name.slice(0, 10), status: statusOf(text), tail: lines.slice(-TAIL) }
    }),
  )
}
