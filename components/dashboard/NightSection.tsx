import type { NightLog, NightStatus } from '@/lib/server/dashboard-logs'
import { Empty, SectionTitle } from './Panel'

// @cdc tableau de bord — comptes rendus de la tâche de nuit (nouvel article + réécritures).
// Le statut s'affiche en texte, la pastille n'en est que le rappel.

const STATUS: Record<NightStatus, { label: string; className: string }> = {
  ok: { label: 'Réussie, poussée sur v2', className: 'bg-green-bg text-green-ink' },
  idle: { label: 'Terminée, rien à pousser', className: 'bg-blue-bg text-blue-ink' },
  error: { label: 'Échec', className: 'bg-rose-bg text-rose-ink' },
  unknown: { label: 'En cours ou interrompue', className: 'bg-amber-bg text-amber-ink' },
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

export function NightSection({ logs, configured }: { logs: NightLog[]; configured: boolean }) {
  return (
    <>
      <SectionTitle id="nuit" title="Tâche de nuit" intro="Les 7 derniers comptes rendus, dernières lignes de chaque nuit." />
      <div className="mt-4 flex flex-col gap-3">
        {!configured && <Empty>Dossier des comptes rendus non renseigné : poser DASHBOARD_LOG_DIR dans l’environnement du site.</Empty>}
        {configured && logs.length === 0 && <Empty>Aucun compte rendu trouvé dans le dossier.</Empty>}
        {logs.map((log) => {
          const s = STATUS[log.status]
          return (
            <article key={log.date} className="rounded-card border border-line bg-paper p-4">
              <header className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ink first-letter:uppercase">
                  <time dateTime={log.date}>{dateFmt.format(new Date(`${log.date}T00:00:00Z`))}</time>
                </h3>
                <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${s.className}`}>{s.label}</span>
              </header>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-box bg-cream px-3 py-2 font-body text-xs leading-relaxed text-ink-2">
                {log.tail.join('\n')}
              </pre>
            </article>
          )
        })}
      </div>
    </>
  )
}
