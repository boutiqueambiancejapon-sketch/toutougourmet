import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { BACKUP_MAX_AGE_HOURS, getBackupStatus } from '../dashboard-backup'
import { getHostStats } from '../dashboard-host'
import { addDays, parisDate } from '@/lib/emails/schedule'
import { NIGHT_LABELS, nightOk, readNightRun } from '../night-logs'

// @cdc alertes — contrôles lancés toutes les 10 minutes par scripts/alerts.ts. Chaque contrôle
// rend des incidents : une clé stable (une alerte par clé tant qu'elle dure), une ligne courte
// sans donnée personnelle, et la ligne envoyée quand l'incident disparaît.

export interface Incident {
  key: string
  line: string
  /** Site en panne : notification en priorité haute */
  urgent: boolean
  resolved: string
}

const run = promisify(execFile)
export const LIMITS = { diskFree: 0.1, memoryFree: 0.1, loadPerCore: 1.5 } as const
const pct = (n: number) => `${Math.round(n * 100)} %`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function answers200(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(10_000), headers: { 'user-agent': 'toutou-alerts' } })
    await res.body?.cancel()
    return res.status === 200
  } catch {
    return false
  }
}

/** Deux essais de suite, à ALERTS_RETRY_MS d'écart (30 s) : un redémarrage du site ne déclenche rien. */
async function down(url: string): Promise<boolean> {
  if (await answers200(url)) return false
  await sleep(Number(process.env.ALERTS_RETRY_MS ?? 30_000))
  return !(await answers200(url))
}

export async function checkSites(): Promise<Incident[]> {
  const local = process.env.ALERTS_LOCAL_URL || 'http://127.0.0.1:3000/'
  const pub = process.env.ALERTS_PUBLIC_URL || 'https://www.toutou-gourmet.com/'
  const [localDown, publicDown] = await Promise.all([down(local), down(pub)])
  const out: Incident[] = []
  if (localDown) out.push({ key: 'site-local', urgent: true, line: 'Le site ne répond plus sur le serveur (toutou-web).', resolved: 'Le site répond de nouveau sur le serveur.' })
  else if (publicDown) out.push({ key: 'site-public', urgent: true, line: "Le site ne répond pas depuis Internet (Caddy, DNS ou certificat), alors qu'il tourne sur le serveur.", resolved: 'Le site répond de nouveau depuis Internet.' })
  return out
}

type Props = Record<string, string>

export async function checkUnits(): Promise<Incident[]> {
  const env = { NODE_ENV: process.env.NODE_ENV, PATH: '/usr/bin:/bin', LANG: 'C' }
  const opts = { timeout: 5000, maxBuffer: 256 * 1024, env }
  try {
    const list = await run('systemctl', ['list-units', 'toutou-*', '--all', '--plain', '--no-legend', '--no-pager'], opts)
    const units = list.stdout.split('\n').map((l) => l.trim().split(/\s+/)[0]).filter((u) => /^toutou-[\w.-]+$/.test(u))
    if (units.length === 0) return []
    const show = await run('systemctl', ['show', '-p', 'Id,LoadState,ActiveState,Result', ...units], opts)
    const failed: string[] = []
    for (const block of show.stdout.split(/\n\s*\n/)) {
      const p: Props = Object.fromEntries(block.split('\n').map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]))
      if (p.LoadState !== 'loaded') continue
      if (p.ActiveState === 'failed' || (p.Result && p.Result !== 'success')) failed.push(p.Id)
    }
    return failed.sort().map((u) => ({ key: `unit:${u}`, urgent: false, line: `${u} : en échec (journalctl -u ${u}).`, resolved: `${u} : de nouveau en ordre.` }))
  } catch {
    return [{ key: 'systemctl', urgent: false, line: "État des services illisible (systemctl n'a pas répondu).", resolved: 'État des services de nouveau lisible.' }]
  }
}

/** Heure de Paris (0-23) d'un instant. */
export function parisHour(now: Date): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: 'numeric', hourCycle: 'h23' }).format(now))
}

/** Avant 7 h, on juge encore la nuit précédente : l'incident dure jusqu'au contrôle suivant. */
export async function checkNight(now: Date): Promise<Incident[]> {
  const today = parisDate(now)
  const date = parisHour(now) >= 7 ? today : addDays(today, -1)
  const night = await readNightRun(date)
  if (nightOk(night.status)) return []
  const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))
  return [{ key: `night:${date}`, urgent: false, line: `Tâche de nuit du ${day} : ${NIGHT_LABELS[night.status]}.`, resolved: `Tâche de nuit du ${day} : passage suivant en ordre.` }]
}

export async function checkHost(): Promise<Incident[]> {
  const { disk, memory, load, cores } = await getHostStats()
  const out: Incident[] = []
  if (disk && 1 - disk.used / disk.total < LIMITS.diskFree) {
    out.push({ key: 'disk', urgent: false, line: `Disque presque plein : ${pct(1 - disk.used / disk.total)} libre.`, resolved: "Disque : de nouveau plus de 10 % d'espace libre." })
  }
  if (memory && 1 - memory.used / memory.total < LIMITS.memoryFree) {
    out.push({ key: 'memory', urgent: false, line: `Mémoire presque pleine : ${pct(1 - memory.used / memory.total)} disponible.`, resolved: 'Mémoire : de nouveau plus de 10 % disponible.' })
  }
  if (load && load[2] / cores > LIMITS.loadPerCore) {
    out.push({ key: 'load', urgent: false, line: `Processeur surchargé : ${pct(load[2] / cores)} des cœurs sur 15 minutes.`, resolved: 'Processeur : charge revenue sous 150 % des cœurs.' })
  }
  return out
}

export async function checkBackup(now: Date): Promise<Incident[]> {
  const b = await getBackupStatus(now.getTime())
  const resolved = 'Sauvegarde de la base : de nouveau à jour.'
  if (!b.readable) return [{ key: 'backup', urgent: false, line: 'Dossier des sauvegardes illisible.', resolved }]
  if (b.ageHours === null) return [{ key: 'backup', urgent: false, line: 'Aucune sauvegarde de la base trouvée.', resolved }]
  if (b.ageHours > BACKUP_MAX_AGE_HOURS) {
    return [{ key: 'backup', urgent: false, line: `Dernière sauvegarde de la base vieille de ${Math.floor(b.ageHours)} heures.`, resolved }]
  }
  return []
}
