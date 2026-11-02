import type { LiveData, LiveEvent } from '@/lib/server/dashboard-live'

// @cdc tableau de bord — morceaux d'affichage de la vue « En direct ».

const LABELS: Record<string, string> = {
  Pageview: 'Page vue',
  'Affiliate Click': 'Clic partenaire',
  'Tool Result': 'Outil utilisé',
  'Newsletter Signup': 'Inscription newsletter',
  'Food Search': 'Recherche',
  'Quiz Complete': 'Quiz terminé',
  'Account Signup': 'Compte créé',
}

const KIND: Record<string, string> = { ai_training: 'entraînement', ai_search: 'moteur IA', ai_user: 'lecture en direct' }

const time = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'medium', timeZone: 'Europe/Paris' })

export function MinuteBars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values)
  return (
    <div>
      <div className="flex h-16 items-end gap-[3px]" role="img" aria-label="Pages vues par minute sur les 30 dernières minutes">
        {values.map((v, i) => (
          <span
            key={i}
            title={`il y a ${29 - i} min : ${v}`}
            className={`flex-1 rounded-t-sm ${v ? 'bg-orange' : 'bg-line'}`}
            style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
          />
        ))}
      </div>
      <p className="mt-1 flex justify-between text-xs text-ink-2">
        <span>il y a 30 min</span>
        <span>maintenant</span>
      </p>
    </div>
  )
}

export function MiniList({ rows, empty }: { rows: LiveData['pages']; empty: string }) {
  if (!rows.length) return <p className="text-sm text-ink-2">{empty}</p>
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {rows.map((r) => (
        <li key={r.label} className="flex justify-between gap-3">
          <span className="min-w-0 break-words [overflow-wrap:anywhere] text-ink">{r.label}</span>
          <span className="shrink-0 font-semibold tabular-nums text-ink">{r.value}</span>
        </li>
      ))}
    </ul>
  )
}

export function Feed({ items }: { items: LiveEvent[] }) {
  if (!items.length) return <p className="text-sm text-ink-2">Aucune activité pour l&apos;instant.</p>
  return (
    <ol className="flex flex-col divide-y divide-line text-sm">
      {items.map((e, i) => (
        <li key={`${e.ts}-${i}`} className="flex gap-3 py-1.5">
          <time className="w-[4.5rem] shrink-0 tabular-nums text-ink-2">{time.format(new Date(e.ts))}</time>
          <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
            <span className={e.name === 'Pageview' ? 'text-ink' : 'font-semibold text-orange-ink'}>{LABELS[e.name] ?? e.name}</span>
            {e.detail ? <span className="text-ink"> · {e.detail}</span> : null}
            <span className="block text-xs text-ink-2">
              {e.page}
              {e.ref && !e.ref.endsWith('toutou-gourmet.com') ? ` · depuis ${e.ref}` : ''}
              {e.device ? ` · ${e.device === 'mobile' ? 'mobile' : e.device === 'tablet' ? 'tablette' : 'ordinateur'}` : ''}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function Bots({ items }: { items: LiveData['bots'] }) {
  if (!items.length) return <p className="text-sm text-ink-2">Aucun robot d&apos;IA sur les 30 dernières minutes.</p>
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {items.map((b, i) => (
        <li key={`${b.ts}-${i}`} className="flex gap-3">
          <time className="w-[4.5rem] shrink-0 tabular-nums text-ink-2">{time.format(new Date(b.ts))}</time>
          <span className="min-w-0 [overflow-wrap:anywhere]">
            <span className="font-semibold text-ink">{b.label}</span>
            <span className="text-ink-2"> ({KIND[b.kind] ?? b.kind}) {b.path}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
