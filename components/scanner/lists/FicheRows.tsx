import Link from 'next/link'
import { ficheMeta, type ListFiche } from '@/lib/scanner/fiche-lists'
import { ScoreBadge } from '../ScoreBadge'

// @cdc scanner — lignes d'une liste de fiches : note, marque, produit, date honnête et origine de
// la note. Le lien mène à la fiche (noindex tant qu'elle n'est pas relue), rendu serveur.

export function FicheRows({ items, ranked = false, showNoun = false }: { items: ListFiche[]; ranked?: boolean; showNoun?: boolean }) {
  const now = new Date()
  const Tag = ranked ? 'ol' : 'ul'
  return (
    <Tag role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
      {items.map((f, i) => (
        <li key={f.slug}>
          <Link href={`/croquettes/${f.slug}`} className="group flex min-h-16 items-center gap-3 py-3 text-ink no-underline">
            {ranked ? <span className="w-5 shrink-0 text-right font-display font-black text-ink-2">{i + 1}</span> : null}
            <ScoreBadge score={f.score} />
            <span className="flex min-w-0 grow flex-col">
              <span className="truncate font-semibold group-hover:underline">{f.brand ?? 'Marque illisible'}</span>
              <span className="truncate text-[15px] text-ink-2">{f.product ?? 'Produit sans nom lisible'}</span>
              <span className="text-xs leading-snug text-ink-2">{ficheMeta(f, { now, showNoun })}</span>
            </span>
          </Link>
        </li>
      ))}
    </Tag>
  )
}
