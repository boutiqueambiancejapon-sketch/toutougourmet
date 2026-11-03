import Link from 'next/link'
import { RECENT_SCANS_MIN_DISTINCT, RECENT_SCANS_SHOWN } from '@/lib/scanner/config'
import { timeAgo } from '@/lib/scanner/time'
import { recentScans } from '@/lib/server/scanner'
import { ScoreBadge } from './ScoreBadge'

// @cdc lot 6 — « Derniers scans » sur /scanner : un produit par ligne (scans répétés regroupés),
// jamais rien sur la personne qui a scanné. Masqué tant qu'il y a moins de
// RECENT_SCANS_MIN_DISTINCT produits analysés (pas de liste maigre au démarrage).

export async function RecentScans() {
  const scans = await recentScans(RECENT_SCANS_SHOWN, RECENT_SCANS_MIN_DISTINCT).catch((err: unknown) => {
    console.error('[scanner] derniers scans indisponibles', err instanceof Error ? err.message : err)
    return []
  })
  if (scans.length === 0) return null
  const now = new Date()
  return (
    <section aria-labelledby="derniers-scans" className="flex flex-col gap-2">
      <h2 id="derniers-scans" className="m-0 font-display text-xl font-black text-ink">
        Derniers scans
      </h2>
      <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
        {scans.map((s) => (
          <li key={s.slug}>
            <Link href={`/croquettes/${s.slug}`} className="group flex min-h-16 items-center gap-3 py-3 text-ink no-underline">
              <ScoreBadge score={s.score} />
              <span className="flex min-w-0 grow flex-col">
                <span className="truncate font-semibold group-hover:underline">{s.brand ?? 'Marque illisible'}</span>
                <span className="truncate text-[15px] text-ink-2">{s.product ?? 'Produit sans nom lisible'}</span>
                <span className="text-xs text-ink-2">{`${timeAgo(s.at, now)} · ${s.kind === 'treat' ? 'friandise, ' : ''}analyse automatique`}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
