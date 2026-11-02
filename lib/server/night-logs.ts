import { promises as fs } from 'node:fs'
import path from 'node:path'

// @cdc alertes — comptes rendus de la tâche de nuit (deploy/seo-rewrite.sh), copiés à la fin de
// chaque passage dans SEO_LOGS_DIR (défaut /var/lib/toutou-seo-logs, groupe toutou), un fichier
// AAAA-MM-JJ.log par nuit. Seules les lignes écrites par le script comptent (en début de ligne),
// pas le texte libre des sessions Claude qui peut contenir n'importe quel symbole.

export type NightStatus = 'pushed' | 'nothing' | 'failed' | 'incomplete' | 'missing'

export interface NightRun {
  /** Date civile du passage (AAAA-MM-JJ, heure de Paris) */
  date: string
  status: NightStatus
}

const FAILED = [/^✗/m, /^claude \(.*\) a terminé avec une erreur/m]
const PUSHED = /^✓ Poussé sur v2/m
const NOTHING = /^Aucun commit/m

export const nightLogsDir = (): string => process.env.SEO_LOGS_DIR || '/var/lib/toutou-seo-logs'

/** Classe un compte rendu : un échec l'emporte sur tout le reste. */
export function classifyNightLog(text: string): Exclude<NightStatus, 'missing'> {
  if (FAILED.some((re) => re.test(text))) return 'failed'
  if (PUSHED.test(text)) return 'pushed'
  if (NOTHING.test(text)) return 'nothing'
  return 'incomplete'
}

export async function readNightRun(date: string): Promise<NightRun> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`date invalide : ${date}`)
  try {
    const text = await fs.readFile(path.join(nightLogsDir(), `${date}.log`), 'utf-8')
    return { date, status: classifyNightLog(text) }
  } catch {
    return { date, status: 'missing' }
  }
}

export const NIGHT_LABELS: Record<NightStatus, string> = {
  pushed: 'réussie, poussée sur v2',
  nothing: 'réussie, rien à pousser',
  failed: 'échec',
  incomplete: 'compte rendu incomplet',
  missing: 'compte rendu absent',
}

export const nightOk = (s: NightStatus): boolean => s === 'pushed' || s === 'nothing'
