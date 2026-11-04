import type { TaskState, TaskStatus } from '@/lib/server/dashboard-tasks'

// @cdc tableau de bord — briques de la section « Serveur » : jauge simple (une teinte, une
// seule couleur d'alerte doublée d'un texte) et liste des tâches planifiées.

export const NA = 'non disponible'

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Paris',
})

/** « lun. 2 nov., 17:20 (il y a 3 min) » — heure de Paris. */
export function when(iso: string | null, now: number): string {
  if (!iso) return NA
  const t = Date.parse(iso)
  const mins = Math.round((t - now) / 60_000)
  const abs = Math.abs(mins)
  const span = abs < 60 ? `${abs} min` : abs < 48 * 60 ? `${Math.round(abs / 60)} h` : `${Math.round(abs / 1440)} j`
  const rel = abs < 1 ? 'maintenant' : mins < 0 ? `il y a ${span}` : `dans ${span}`
  return `${dateFmt.format(t)} (${rel})`
}

interface MeterProps {
  label: string
  /** Part de 0 à 1 (peut dépasser 1 pour la charge processeur), null = non disponible. */
  ratio: number | null
  value: string
  detail: string
  alert: boolean
}

export function Meter({ label, ratio, value, detail, alert }: MeterProps) {
  const width = ratio === null ? 0 : Math.min(Math.max(ratio, 0.02), 1) * 100
  return (
    <div className="rounded-box border border-line bg-paper px-3 py-2.5" title={`${label} : ${value}, ${detail}`}>
      <dt className="text-sm leading-snug text-ink-2">{label}</dt>
      <dd className="m-0 font-display text-2xl font-black tabular-nums text-ink">{ratio === null ? '—' : value}</dd>
      <dd className="m-0 mt-1 h-2 rounded-pill bg-cream-2" aria-hidden="true">
        {ratio !== null && <div className={`h-2 rounded-pill ${alert ? 'bg-rose-ink' : 'bg-orange'}`} style={{ width: `${width}%` }} />}
      </dd>
      <dd className="m-0 mt-1 text-xs text-ink-2">
        {ratio === null ? NA : detail}
        {alert && <strong className="ml-1 font-semibold text-rose-ink">· au-dessus du seuil</strong>}
      </dd>
    </div>
  )
}

const STATE: Record<TaskState, { label: string; className: string }> = {
  ok: { label: '✓ Réussie', className: 'bg-green-bg text-green-ink' },
  running: { label: '… En cours', className: 'bg-blue-bg text-blue-ink' },
  failed: { label: '✗ Échec', className: 'bg-rose-bg text-rose-ink' },
  stopped: { label: '✗ Arrêtée', className: 'bg-rose-bg text-rose-ink' },
  unknown: { label: 'État non disponible', className: 'bg-cream-2 text-ink-2' },
}

const shortWhen = (iso: string | null, now: number): string => {
  if (!iso) return NA
  const full = when(iso, now)
  return /\(([^)]+)\)/.exec(full)?.[1] ?? full
}

const FIRST: TaskState[] = ['failed', 'stopped', 'unknown']

export function TaskList({ tasks, now }: { tasks: TaskStatus[]; now: number }) {
  const sorted = [...tasks].sort((a, b) => Number(FIRST.includes(b.state)) - Number(FIRST.includes(a.state)))
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
      {sorted.map((t) => {
        const s = STATE[t.state]
        return (
          <li key={t.unit} className="py-2.5 first:pt-0 last:pb-0" title={`Dernier passage : ${when(t.last, now)}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="m-0 min-w-0 text-sm font-semibold text-ink">{t.label}</p>
              <span className={`shrink-0 whitespace-nowrap rounded-pill px-2 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>
            </div>
            <p className="m-0 text-xs text-ink-2">
              {t.rhythm} · dernier {shortWhen(t.last, now)} · prochain {t.next ? shortWhen(t.next, now) : (t.nextHint ?? NA)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

/** Alertes du serveur en tête d'onglet : la même règle que la ligne d'état de l'accueil. */
export function ServerAlerts({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) {
    return <p className="m-0 mt-4 rounded-box bg-green-bg px-3 py-2.5 text-sm font-semibold text-green-ink">Rien à signaler sur le serveur.</p>
  }
  return (
    <ul role="alert" className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
      {alerts.map((a) => (
        <li key={a} className="rounded-box bg-rose-bg px-3 py-2.5 text-sm font-semibold text-rose-ink">
          {a}
        </li>
      ))}
    </ul>
  )
}
