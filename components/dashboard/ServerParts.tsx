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
    <div className="rounded-card border border-line bg-paper p-4" title={`${label} : ${value}, ${detail}`}>
      <dt className="text-sm font-semibold text-ink-2">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-black tabular-nums text-ink">{ratio === null ? '—' : value}</dd>
      <dd className="mt-2 h-2 rounded-pill bg-cream-2" aria-hidden="true">
        {ratio !== null && <div className={`h-2 rounded-pill ${alert ? 'bg-rose-ink' : 'bg-orange'}`} style={{ width: `${width}%` }} />}
      </dd>
      <dd className="mt-2 text-xs text-ink-2">
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

export function TaskList({ tasks, now }: { tasks: TaskStatus[]; now: number }) {
  return (
    <ul className="flex flex-col divide-y divide-line">
      {tasks.map((t) => {
        const s = STATE[t.state]
        return (
          <li key={t.unit} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-ink">
                {t.label} <span className="text-sm font-normal text-ink-2">· {t.rhythm}</span>
              </p>
              <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${s.className}`}>{s.label}</span>
            </div>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 text-xs text-ink-2">
              <dt>Dernier passage</dt>
              <dd className="tabular-nums">{when(t.last, now)}</dd>
              <dt>Prochain passage</dt>
              <dd className="tabular-nums">{t.next ? when(t.next, now) : (t.nextHint ?? NA)}</dd>
            </dl>
          </li>
        )
      })}
    </ul>
  )
}
