import type { ToneProgress } from '@/lib/server/dashboard-logs'

// @cdc tableau de bord — haut de l'onglet Contenu : ce qui attend le propriétaire, puis l'avancée
// de la réécriture des articles (docs/tone-v2-queue.md).

const nf = new Intl.NumberFormat('fr-FR')

function plural(n: number, one: string, many: string): string {
  return `${nf.format(n)} ${n > 1 ? many : one}`
}

export function ContentTodo({ messages, review, imported, checks }: { messages: number; review: number; imported: number | null; checks: number }) {
  const items = [
    messages ? { label: plural(messages, 'message à lire', 'messages à lire'), href: '#messages' } : null,
    review ? { label: plural(review, 'fiche à relire', 'fiches à relire'), href: '#relecture' } : null,
    checks ? { label: plural(checks, 'point à vérifier cette nuit', 'points à vérifier cette nuit'), href: '#nuit' } : null,
    imported ? { label: plural(imported, 'fiche importée à trier', 'fiches importées à trier'), href: '#importees' } : null,
  ].filter((i) => i !== null)
  if (items.length === 0) return <p className="m-0 mt-4 rounded-box bg-green-bg px-3 py-2.5 text-sm font-semibold text-green-ink">Rien n’attend de ta part.</p>
  return (
    <section aria-label="À traiter" className="mt-4 rounded-box bg-amber-bg px-3 py-2.5 text-sm text-ink">
      <p className="m-0 font-semibold">À traiter</p>
      <ul className="m-0 mt-1 list-none p-0">
        {items.map((i) => (
          <li key={i.href}>
            <a href={i.href} className="text-ink underline underline-offset-2">{i.label}</a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ToneCard({ progress }: { progress: ToneProgress | null }) {
  if (!progress) return null
  return (
    <section aria-label="Réécriture des articles" className="mt-3 rounded-card border border-line bg-paper p-4">
      <h2 className="m-0 font-display text-lg font-bold text-ink">Réécriture des articles</h2>
      <p className="m-0 mt-1 font-display text-3xl font-black tabular-nums text-ink">{nf.format(progress.done)} / {nf.format(progress.total)}</p>
      <div className="mt-2 h-2 rounded-pill bg-cream-2" aria-hidden="true">
        <div className="h-2 rounded-pill bg-orange" style={{ width: `${Math.max((progress.done / progress.total) * 100, 2)}%` }} />
      </div>
      <p className="m-0 mt-1 text-xs text-ink-2">Par lots, la nuit de 1 h à 8 h. Mis à jour à chaque mise en ligne.</p>
    </section>
  )
}
