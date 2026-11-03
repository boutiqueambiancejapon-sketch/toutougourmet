import Link from 'next/link'
import { IconClose, IconDownload, IconSearch } from '@/components/icons'
import { listHref, SEARCH_MAX, SEARCH_PATH, type ListKind } from '@/lib/dashboard/subscriber-search'

// @cdc tableau de bord — en tête des inscrits : choix de la liste, recherche par adresse (POST,
// jamais dans l'URL) et export CSV. Chaque bouton tient sur une ligne à 320 px.

type FormAction = (form: FormData) => Promise<void>

interface ToolbarProps {
  list: ListKind
  query: string
  search: FormAction
  clear: FormAction
}

const LISTS: { kind: ListKind; label: string }[] = [
  { kind: 'lettre', label: 'Lettre' },
  { kind: 'comptes', label: 'Comptes' },
]

const btn = 'inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-pill px-3 text-sm font-semibold'

export function SubscribersToolbar({ list, query, search, clear }: ToolbarProps) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Liste affichée" className="flex gap-0.5 rounded-pill bg-cream-2 p-0.5">
          {LISTS.map((l) => (
            <Link
              key={l.kind}
              href={listHref(l.kind)}
              aria-current={l.kind === list ? 'page' : undefined}
              className={`${btn} min-w-24 no-underline ${l.kind === list ? 'bg-ink text-cream' : 'text-ink-2 hover:text-ink'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <a href={`${SEARCH_PATH}/export?liste=${list}`} download className={`${btn} border border-line-2 bg-paper text-ink no-underline`}>
          <IconDownload className="size-4" />
          Exporter en CSV
        </a>
      </div>
      <form key={query} action={search} role="search" className="flex gap-2">
        <input type="hidden" name="liste" value={list} />
        <label htmlFor="recherche-adresse" className="sr-only">
          Chercher une adresse
        </label>
        <input
          id="recherche-adresse"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={SEARCH_MAX}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Chercher une adresse"
          className="min-h-11 min-w-0 flex-1 rounded-pill border border-line-2 bg-paper px-4 text-base text-ink"
        />
        <button type="submit" className={`${btn} bg-ink text-cream`}>
          <IconSearch className="size-4" />
          Chercher
        </button>
      </form>
      {query ? (
        <form action={clear} className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <input type="hidden" name="liste" value={list} />
          <span className="min-w-0 break-all">
            Recherche : <strong className="text-ink">{query}</strong>
          </span>
          <button type="submit" className={`${btn} min-h-9 border border-line-2 bg-paper px-2.5 text-ink`}>
            <IconClose className="size-3.5" />
            Effacer
          </button>
        </form>
      ) : null}
    </div>
  )
}
