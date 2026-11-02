import type { ServerHealth } from '@/lib/server/dashboard-health'
import { LIMITS } from '@/lib/server/dashboard-health'
import { BACKUP_MAX_AGE_HOURS } from '@/lib/server/dashboard-backup'
import { Panel, SectionTitle } from './Panel'
import { Meter, NA, TaskList, when } from './ServerParts'

// @cdc tableau de bord — section « Serveur » : machine, tâches planifiées, sauvegarde.
// Rendu serveur, lu à l'ouverture de la page. Aucun chemin ni variable d'environnement affiché.

const pf = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })
const df = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

function bytes(n: number): string {
  const units = ['o', 'Ko', 'Mo', 'Go', 'To']
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: i >= 2 ? 1 : 0 }).format(n)} ${units[i]}`
}

function duration(seconds: number): string {
  const d = Math.floor(seconds / 86_400)
  const h = Math.floor((seconds % 86_400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d} j ${h} h`
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

export function ServerSection({ health }: { health: ServerHealth }) {
  const { host, tasks, backup, now } = health
  const load = host.load ? host.load[2] / host.cores : null
  const mem = host.memory ? host.memory.used / host.memory.total : null
  const disk = host.disk ? host.disk.used / host.disk.total : null
  const backupOld = backup.ageHours !== null && backup.ageHours > BACKUP_MAX_AGE_HOURS

  return (
    <>
      <SectionTitle id="serveur" title="Serveur" intro="Lu à l’ouverture de la page. Rechargez pour mettre à jour." />
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Meter
          label="Processeur (15 min)"
          ratio={load}
          value={load === null ? NA : pf.format(load)}
          detail={host.load ? `Charge ${host.load.map((n) => df.format(n)).join(' · ')} sur ${host.cores} cœurs (1, 5, 15 min)` : NA}
          alert={load !== null && load > LIMITS.loadPerCore}
        />
        <Meter
          label="Mémoire utilisée"
          ratio={mem}
          value={mem === null ? NA : pf.format(mem)}
          detail={host.memory ? `${bytes(host.memory.total - host.memory.used)} disponibles sur ${bytes(host.memory.total)}` : NA}
          alert={mem !== null && 1 - mem < LIMITS.memoryFree}
        />
        <Meter
          label="Disque utilisé"
          ratio={disk}
          value={disk === null ? NA : pf.format(disk)}
          detail={host.disk ? `${bytes(host.disk.total - host.disk.used)} libres sur ${bytes(host.disk.total)}` : NA}
          alert={disk !== null && 1 - disk < LIMITS.diskFree}
        />
        <div className="rounded-card border border-line bg-paper p-4">
          <dt className="text-sm font-semibold text-ink-2">Allumé depuis</dt>
          <dd className="mt-1 font-display text-3xl font-black tabular-nums text-ink">
            {host.uptimeSeconds === null ? '—' : duration(host.uptimeSeconds)}
          </dd>
          <dd className="mt-2 text-xs text-ink-2">
            {host.uptimeSeconds === null ? NA : `Démarré ${when(new Date(now - host.uptimeSeconds * 1000).toISOString(), now)}`}
          </dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="Tâches planifiées" hint="État du dernier passage, heure de Paris.">
          <TaskList tasks={tasks} now={now} />
        </Panel>
        <Panel title="Sauvegarde de la base" hint={`Une copie par nuit, alerte au-delà de ${BACKUP_MAX_AGE_HOURS} heures.`}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
            <dt className="text-ink-2">Dernière copie</dt>
            <dd className={`tabular-nums ${backupOld ? 'font-semibold text-rose-ink' : 'text-ink'}`}>
              {!backup.readable ? NA : backup.latest ? when(backup.latest, now) : 'aucune trouvée'}
              {backupOld && ' · trop ancienne'}
            </dd>
            <dt className="text-ink-2">Taille</dt>
            <dd className="tabular-nums text-ink">{backup.size === null ? NA : bytes(backup.size)}</dd>
            <dt className="text-ink-2">Copie hors du serveur</dt>
            <dd className={backup.offsite ? 'text-ink' : 'font-semibold text-amber-ink'}>
              {backup.offsite ? 'configurée' : 'non configurée'}
            </dd>
          </dl>
        </Panel>
      </div>
    </>
  )
}
