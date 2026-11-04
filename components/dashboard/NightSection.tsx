import type { NightLog, NightStatus } from '@/lib/server/dashboard-logs'
import { Empty, SectionTitle } from './Panel'

// @cdc tableau de bord — comptes rendus de la tâche de nuit : statut, résumé, points à vérifier ;
// le texte brut reste à un toucher. Le statut s'affiche en texte, la pastille n'en est que le rappel.

const STATUS: Record<NightStatus, { label: string; className: string }> = {
  ok: { label: 'Réussie', className: 'bg-green-bg text-green-ink' },
  idle: { label: 'Rien à publier', className: 'bg-blue-bg text-blue-ink' },
  error: { label: 'Échec', className: 'bg-rose-bg text-rose-ink' },
  unknown: { label: 'En cours ou interrompue', className: 'bg-amber-bg text-amber-ink' },
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

export function NightSection({ logs, configured }: { logs: NightLog[]; configured: boolean }) {
  return (
    <>
      <SectionTitle id="nuit" title="Tâche de nuit" intro="Les 7 dernières nuits." />
      <div className="mt-4 flex flex-col gap-3">
        {!configured && <Empty>Dossier des comptes rendus non renseigné : poser DASHBOARD_LOG_DIR dans l’environnement du site.</Empty>}
        {configured && logs.length === 0 && <Empty>Aucun compte rendu trouvé dans le dossier.</Empty>}
        {logs.map((log) => {
          const s = STATUS[log.status]
          return (
            <article key={log.date} className="rounded-card border border-line bg-paper p-4">
              <header className="flex items-start justify-between gap-2">
                <h3 className="m-0 min-w-0 font-semibold text-ink first-letter:uppercase">
                  <time dateTime={log.date}>{dateFmt.format(new Date(`${log.date}T00:00:00Z`))}</time>
                </h3>
                <span className={`shrink-0 whitespace-nowrap rounded-pill px-2 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>
              </header>
              <p className="m-0 mt-1 text-sm text-ink-2">{log.summary}</p>
              {log.checks.length > 0 ? (
                <div className="mt-2 rounded-box bg-amber-bg px-3 py-2 text-sm text-ink">
                  <p className="m-0 font-semibold">À vérifier</p>
                  <ul className="m-0 mt-1 list-none p-0">
                    {log.checks.map((c) => (
                      <li key={c} className="break-words">{c}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-ink-2">Lire le compte rendu</summary>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-box bg-cream px-3 py-2 font-body text-xs leading-relaxed text-ink-2">{log.tail.join('\n')}</pre>
              </details>
            </article>
          )
        })}
      </div>
    </>
  )
}
