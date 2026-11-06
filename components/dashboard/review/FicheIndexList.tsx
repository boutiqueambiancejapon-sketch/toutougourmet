import Link from 'next/link'
import { basculerIndex } from '@/app/(admin)/tableau-de-bord/fiches/actions'
import { TYPE_LABEL, type LigneIndex } from '@/lib/server/dashboard-fiche-index'

// @cdc tableau de bord — lignes de la vue des fiches : état pour Google et bouton pour ouvrir ou retirer une fiche.

const sansMarque = (nom: string, marque: string): string => (nom.startsWith(`${marque} `) ? nom.slice(marque.length + 1) : nom)

export function FicheIndexList({ lignes }: { lignes: LigneIndex[] }) {
  return (
    <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
      {lignes.map((l) => (
        <li key={l.id} className="flex flex-col gap-2 rounded-card border border-line bg-paper p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link href={`/tableau-de-bord/fiches/${l.id}`} className="font-semibold text-ink underline underline-offset-2">{`${l.marque} · ${sansMarque(l.nom, l.marque)}`}</Link>
            <p className="m-0 mt-1 text-sm text-ink-2">
              {`${l.score ?? '?'}/100 · ${TYPE_LABEL[l.type]}${l.formats > 1 ? ` · ${l.formats} formats` : ''}${l.pageMere ? '' : ' · sans page mère'} · `}
              <a href={`https://www.toutou-gourmet.com${l.adresse}`} target="_blank" rel="noopener" className="underline underline-offset-2">voir la page</a>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`whitespace-nowrap rounded-pill px-2 py-0.5 text-xs font-semibold ${l.indexee ? 'bg-green-bg text-green-ink' : 'bg-cream text-ink-2'}`}>{l.indexee ? 'Indexée' : 'Noindex'}</span>
            {l.blocage && !l.indexee ? (
              <span className="text-xs text-ink-2">{l.blocage}</span>
            ) : (
              <form action={basculerIndex.bind(null, l.id, !l.indexee)}>
                <button type="submit" className={`min-h-11 whitespace-nowrap rounded-box px-3 text-sm font-semibold ${l.indexee ? 'border border-line bg-paper text-ink' : 'bg-orange text-paper'}`}>
                  {l.indexee ? 'Retirer de Google' : 'Ouvrir à Google'}
                </button>
              </form>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
