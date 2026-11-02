import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { Incident } from './checks'

// @cdc alertes — anti-spam et envoi ntfy. Le fichier d'état garde les incidents déjà signalés :
// une notification à l'apparition, une autre quand l'incident disparaît, rien entre les deux.
// Tout ce qui change pendant un passage part dans un seul message. NTFY_TOPIC est un secret :
// il n'apparaît dans aucun journal, aucune erreur, aucun message.

export const DASHBOARD_URL = 'https://dashboard.toutou-gourmet.com/tableau-de-bord'

export interface AlertState {
  incidents: Record<string, { since: string; line: string; resolved: string }>
  /** Instant (horloge de la base) jusqu'où les signalements du scanner ont été comptés */
  reportsSince?: string
}

export interface NtfyMessage {
  title: string
  message: string
  /** 4 = haute (site en panne), 3 = normale */
  priority: 3 | 4
  tags: string[]
  click: string
}

export function readState(file: string): AlertState {
  if (!existsSync(file)) return { incidents: {} }
  try {
    const s = JSON.parse(readFileSync(file, 'utf-8')) as Partial<AlertState>
    return { incidents: s.incidents ?? {}, reportsSince: s.reportsSince }
  } catch {
    return { incidents: {} }
  }
}

export function writeState(file: string, state: AlertState): void {
  mkdirSync(dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o640 })
  renameSync(tmp, file)
}

export interface Diff {
  opened: Incident[]
  closed: AlertState['incidents'][string][]
  ongoing: number
}

export function diffIncidents(state: AlertState, current: Incident[]): Diff {
  const keys = new Set(current.map((i) => i.key))
  return {
    opened: current.filter((i) => !state.incidents[i.key]),
    closed: Object.entries(state.incidents).filter(([k]) => !keys.has(k)).map(([, v]) => v),
    ongoing: current.filter((i) => state.incidents[i.key]).length,
  }
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/** Un message pour tout le passage, ou null s'il n'y a rien de neuf. */
export function composeMessage(diff: Diff, reports: number): NtfyMessage | null {
  const { opened, closed, ongoing } = diff
  if (opened.length === 0 && closed.length === 0 && reports === 0) return null
  const urgent = opened.some((i) => i.urgent)
  const lines = opened.map((i) => `- ${i.line}`)
  if (reports > 0) lines.push(`- ${plural(reports, 'nouveau signalement', 'nouveaux signalements')} d'erreur sur une fiche croquette, à traiter.`)
  if (closed.length > 0) {
    if (lines.length > 0) lines.push('')
    lines.push(closed.length > 1 ? 'Réglés :' : 'Réglé :', ...closed.map((c) => `- ${c.resolved}`))
  }
  if (ongoing > 0) lines.push('', `${plural(ongoing, 'incident toujours en cours', 'incidents toujours en cours')}.`)

  let title = 'Toutou Gourmet : réglé'
  let tags = ['white_check_mark']
  if (urgent) {
    title = 'Toutou Gourmet : site en panne'
    tags = ['rotating_light']
  } else if (opened.length > 0) {
    title = `Toutou Gourmet : ${plural(opened.length + (reports > 0 ? 1 : 0), 'alerte', 'alertes')}`
    tags = ['warning']
  } else if (reports > 0) {
    title = 'Toutou Gourmet : signalement à traiter'
    tags = ['memo']
  }
  return { title, message: lines.join('\n'), priority: urgent ? 4 : 3, tags, click: DASHBOARD_URL }
}

/** Publication JSON (accents sûrs, contrairement aux en-têtes HTTP). */
export async function sendNtfy(msg: NtfyMessage): Promise<void> {
  const server = (process.env.NTFY_SERVER || 'https://ntfy.sh').replace(/\/+$/, '')
  const topic = process.env.NTFY_TOPIC
  if (!topic) throw new Error('NTFY_TOPIC absent')
  const res = await fetch(server, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ topic, ...msg }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })
  await res.body?.cancel()
  if (!res.ok) throw new Error(`ntfy a répondu ${res.status}`)
}

export function printMessage(msg: NtfyMessage): void {
  console.log(`[alertes] titre    : ${msg.title}`)
  console.log(`[alertes] priorité : ${msg.priority} · tags : ${msg.tags.join(', ')} · lien : ${msg.click}`)
  console.log(msg.message.replace(/^/gm, '           '))
}
