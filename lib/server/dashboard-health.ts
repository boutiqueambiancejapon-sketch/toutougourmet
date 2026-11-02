import { BACKUP_MAX_AGE_HOURS, getBackupStatus, type BackupStatus } from './dashboard-backup'
import { getHostStats, type HostStats } from './dashboard-host'
import { getTaskStatuses, type TaskStatus } from './dashboard-tasks'

// @cdc tableau de bord — section « Serveur » : mesures + alertes du bandeau en haut de page.
// Lu à l'ouverture de la page, sans sondage.

export const LIMITS = { loadPerCore: 0.8, memoryFree: 0.15, diskFree: 0.15 } as const

export interface ServerHealth {
  host: HostStats
  tasks: TaskStatus[]
  backup: BackupStatus
  alerts: string[]
  /** Instant de lecture (ms) : sert de référence aux durées affichées. */
  now: number
}

const pct = (n: number) => `${Math.round(n * 100)} %`

function alertsOf({ host, tasks, backup }: Pick<ServerHealth, 'host' | 'tasks' | 'backup'>): string[] {
  const out: string[] = []
  if (host.load && host.load[2] / host.cores > LIMITS.loadPerCore) {
    out.push(`Processeur chargé : ${pct(host.load[2] / host.cores)} des cœurs en moyenne sur 15 minutes.`)
  }
  if (host.memory && 1 - host.memory.used / host.memory.total < LIMITS.memoryFree) {
    out.push(`Mémoire presque pleine : ${pct(1 - host.memory.used / host.memory.total)} disponible.`)
  }
  if (host.disk && 1 - host.disk.used / host.disk.total < LIMITS.diskFree) {
    out.push(`Disque presque plein : ${pct(1 - host.disk.used / host.disk.total)} libre.`)
  }
  for (const t of tasks) {
    if (t.state === 'failed') out.push(`${t.label} : le dernier passage a échoué.`)
    if (t.state === 'stopped') out.push(`${t.label} : la tâche planifiée est arrêtée.`)
  }
  if (backup.readable && backup.latest === null) out.push('Aucune sauvegarde de la base trouvée.')
  if (backup.ageHours !== null && backup.ageHours > BACKUP_MAX_AGE_HOURS) {
    out.push(`Dernière sauvegarde de la base vieille de ${Math.floor(backup.ageHours)} heures.`)
  }
  return out
}

export async function getServerHealth(): Promise<ServerHealth> {
  const [host, tasks, backup] = await Promise.all([getHostStats(), getTaskStatuses(), getBackupStatus()])
  return { host, tasks, backup, alerts: alertsOf({ host, tasks, backup }), now: Date.now() }
}
