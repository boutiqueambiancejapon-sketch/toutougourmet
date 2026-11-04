import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

// @cdc tableau de bord — état des tâches planifiées. `systemctl show` lit les propriétés par
// D-Bus sans privilège : liste d'unités fixe, execFile sans shell, délai court.

const run = promisify(execFile)

export const TASKS = [
  // Minuteur relatif (1 min après la fin du passage précédent) : systemd ne publie pas d'heure fixe.
  { unit: 'toutou-ingest', label: 'Lecture des journaux', rhythm: 'chaque minute', nextHint: '1 min après la fin du passage précédent' },
  { unit: 'toutou-deploy', label: 'Mise en ligne', rhythm: 'toutes les heures' },
  { unit: 'toutou-seo-rewrite', label: 'Tâche de nuit', rhythm: 'chaque nuit' },
  { unit: 'toutou-tone', label: 'Réécriture des articles', rhythm: 'la nuit, de 1 h à 8 h' },
  { unit: 'site-articles', label: 'Articles des autres sites', rhythm: 'chaque nuit' },
  { unit: 'site-covers', label: 'Images des autres sites', rhythm: 'chaque nuit' },
  { unit: 'toutou-welcome', label: 'E-mails de Milo', rhythm: 'chaque matin' },
  { unit: 'toutou-maxizoo', label: 'Fiches Maxi Zoo', rhythm: 'chaque nuit' },
  { unit: 'toutou-alerts', label: 'Alertes', rhythm: 'régulièrement', nextHint: 'après le passage précédent' },
  { unit: 'toutou-weekly', label: 'Résumé hebdomadaire', rhythm: 'chaque semaine' },
  { unit: 'toutou-opff-import', label: 'Import Open Pet Food Facts', rhythm: 'chaque semaine' },
  { unit: 'toutou-purge', label: 'Purge des données', rhythm: 'chaque semaine' },
  { unit: 'toutou-geoip', label: 'Base des pays', rhythm: 'chaque mois' },
] as const

export type TaskState = 'ok' | 'running' | 'failed' | 'stopped' | 'unknown'

export interface TaskStatus {
  unit: string
  label: string
  rhythm: string
  /** Texte affiché quand systemd ne donne pas d'heure de prochain passage. */
  nextHint?: string
  state: TaskState
  /** Dates ISO, null si jamais lancée ou non disponible. */
  last: string | null
  next: string | null
}

type Props = Record<string, string>

/** `--timestamp=unix` donne « @1793639927 » ; vide ou absent → null. */
function toIso(value: string | undefined): string | null {
  const m = value ? /^@(\d+)$/.exec(value.trim()) : null
  return m && m[1] !== '0' ? new Date(Number(m[1]) * 1000).toISOString() : null
}

/** Lancement manuel (systemctl start) : le minuteur ne le voit pas, le service si. */
function latest(a: string | null, b: string | null): string | null {
  if (!a || !b) return a ?? b
  return a > b ? a : b
}

function stateOf(timer: Props | undefined, service: Props | undefined): TaskState {
  if (timer?.LoadState !== 'loaded' || service?.LoadState !== 'loaded') return 'unknown'
  if (service.ActiveState === 'failed' || (service.Result && service.Result !== 'success')) return 'failed'
  if (service.ActiveState === 'activating' || service.ActiveState === 'active') return 'running'
  if (timer.ActiveState !== 'active') return 'stopped'
  return 'ok'
}

async function showUnits(): Promise<Map<string, Props> | null> {
  const units = TASKS.flatMap((t) => [`${t.unit}.timer`, `${t.unit}.service`])
  try {
    const { stdout } = await run(
      'systemctl',
      ['show', '--timestamp=unix', '-p', 'Id,LoadState,ActiveState,Result,LastTriggerUSec,NextElapseUSecRealtime,ExecMainStartTimestamp', ...units],
      { timeout: 3000, maxBuffer: 64 * 1024, env: { NODE_ENV: process.env.NODE_ENV, PATH: '/usr/bin:/bin', LANG: 'C' } },
    )
    const map = new Map<string, Props>()
    for (const block of stdout.split(/\n\s*\n/)) {
      const props: Props = {}
      for (const line of block.split('\n')) {
        const i = line.indexOf('=')
        if (i > 0) props[line.slice(0, i)] = line.slice(i + 1)
      }
      // Unité inconnue : systemd répond quand même, avec LoadState=not-found (→ « non disponible »).
      if (props.Id) map.set(props.Id, props)
    }
    return map
  } catch {
    return null
  }
}

export async function getTaskStatuses(): Promise<TaskStatus[]> {
  const map = await showUnits()
  return TASKS.map((t) => {
    const timer = map?.get(`${t.unit}.timer`)
    const service = map?.get(`${t.unit}.service`)
    return {
      unit: t.unit,
      label: t.label,
      rhythm: t.rhythm,
      nextHint: 'nextHint' in t ? t.nextHint : undefined,
      state: stateOf(timer, service),
      last: latest(toIso(timer?.LastTriggerUSec), toIso(service?.ExecMainStartTimestamp)),
      next: toIso(timer?.NextElapseUSecRealtime),
    }
  })
}
