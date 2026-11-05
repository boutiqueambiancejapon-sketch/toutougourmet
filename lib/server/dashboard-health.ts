import { BACKUP_MAX_AGE_HOURS, getBackupStatus, type BackupStatus } from './dashboard-backup'
import { getHostStats, type HostStats } from './dashboard-host'
import { getTaskStatuses, type TaskStatus } from './dashboard-tasks'

// @cdc tableau de bord — section « Serveur » : mesures + alertes du bandeau en haut de page.
// Lu à l'ouverture de la page, sans sondage.

export const LIMITS = { loadPerCore: 0.8, memoryFree: 0.15, diskFree: 0.15 } as const

/** Alerte et onglet du tableau de bord qui en montre le détail. */
export interface HealthAlert {
  text: string
  tab: 'serveur' | 'contenu'
}

export interface ServerHealth {
  host: HostStats
  tasks: TaskStatus[]
  backup: BackupStatus
  alerts: string[]
  /** Les mêmes alertes, avec l'onglet où les lire. */
  alertItems: HealthAlert[]
  /** Instant de lecture (ms) : sert de référence aux durées affichées. */
  now: number
}

const pct = (n: number) => `${Math.round(n * 100)} %`

function alertsOf({ host, tasks, backup }: Pick<ServerHealth, 'host' | 'tasks' | 'backup'>): HealthAlert[] {
  const out: HealthAlert[] = []
  const push = (text: string, tab: HealthAlert['tab'] = 'serveur') => out.push({ text, tab })
  if (host.load && host.load[2] / host.cores > LIMITS.loadPerCore) {
    push(`Processeur chargé : ${pct(host.load[2] / host.cores)} des cœurs en moyenne sur 15 minutes.`)
  }
  if (host.memory && 1 - host.memory.used / host.memory.total < LIMITS.memoryFree) {
    push(`Mémoire presque pleine : ${pct(1 - host.memory.used / host.memory.total)} disponible.`)
  }
  if (host.disk && 1 - host.disk.used / host.disk.total < LIMITS.diskFree) {
    push(`Disque presque plein : ${pct(1 - host.disk.used / host.disk.total)} libre.`)
  }
  for (const t of tasks) {
    // La tâche de nuit se lit dans l'onglet Contenu, les autres dans Serveur.
    const tab = t.unit === 'toutou-seo-rewrite' || t.unit.startsWith('toutou-article') ? 'contenu' : 'serveur'
    if (t.state === 'failed') push(`${t.label} : le dernier passage a échoué.`, tab)
    if (t.state === 'stopped') push(`${t.label} : la tâche planifiée est arrêtée.`, tab)
  }
  if (backup.readable && backup.latest === null) push('Aucune sauvegarde de la base trouvée.')
  if (backup.ageHours !== null && backup.ageHours > BACKUP_MAX_AGE_HOURS) {
    push(`Dernière sauvegarde de la base vieille de ${Math.floor(backup.ageHours)} heures.`)
  }
  return out
}

export async function getServerHealth(): Promise<ServerHealth> {
  const [host, tasks, backup] = await Promise.all([getHostStats(), getTaskStatuses(), getBackupStatus()])
  const alertItems = alertsOf({ host, tasks, backup })
  return { host, tasks, backup, alerts: alertItems.map((a) => a.text), alertItems, now: Date.now() }
}
