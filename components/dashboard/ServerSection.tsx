import type { ServerHealth } from '@/lib/server/dashboard-health'
import { LIMITS } from '@/lib/server/dashboard-health'
import { BACKUP_MAX_AGE_HOURS } from '@/lib/server/dashboard-backup'
import { Panel, SectionTitle } from './Panel'
import { Meter, NA, ServerAlerts, TaskList, when } from './ServerParts'

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
      <ServerAlerts alerts={health.alertItems.filter((a) => a.tab === 'serveur').map((a) => a.text)} />
      <SectionTitle id="machine" title="La machine" intro="Lu à l’ouverture de la page. Rechargez pour mettre à jour." />
      <dl className="m-0 mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Meter
          label="Processeur"
          ratio={load}
          value={load === null ? NA : pf.format(load)}
          detail={host.load ? `Sur 15 min, ${host.cores} cœurs (${df.format(host.load[2])})` : NA}
          alert={load !== null && load > LIMITS.loadPerCore}
        />
        <Meter
          label="Mémoire utilisée"
          ratio={mem}
          value={mem === null ? NA : pf.format(mem)}
          detail={host.memory ? `${bytes(host.memory.total - host.memory.used)} libres` : NA}
          alert={mem !== null && 1 - mem < LIMITS.memoryFree}
        />
        <Meter
          label="Disque utilisé"
          ratio={disk}
          value={disk === null ? NA : pf.format(disk)}
          detail={host.disk ? `${bytes(host.disk.total - host.disk.used)} libres` : NA}
          alert={disk !== null && 1 - disk < LIMITS.diskFree}
        />
        <div className="rounded-box border border-line bg-paper px-3 py-2.5">
          <dt className="text-sm leading-snug text-ink-2">Allumé depuis</dt>
          <dd className="m-0 font-display text-2xl font-black tabular-nums text-ink">
            {host.uptimeSeconds === null ? '—' : duration(host.uptimeSeconds)}
          </dd>
          <dd className="m-0 mt-1 text-xs text-ink-2">
            {host.uptimeSeconds === null ? NA : 'Depuis le dernier démarrage'}
          </dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="Toutes les tâches" hint="Celles qui posent problème passent en tête.">
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
              {backup.offsite ? 'configurée' : 'aucune : une panne de la machine emporterait aussi les copies'}
            </dd>
          </dl>
        </Panel>
      </div>
    </>
  )
}
