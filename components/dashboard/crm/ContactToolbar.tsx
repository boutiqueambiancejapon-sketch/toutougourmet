import Link from 'next/link'
import { IconClose, IconDownload, IconSearch } from '@/components/icons'
import { CONTACT_FILTERS, type ContactFilter } from '@/lib/dashboard/crm'
import { CONTACTS_PATH, EXPORT_PATH, SEARCH_MAX } from '@/lib/dashboard/subscriber-search'

// @cdc tableau de bord — recherche (POST, jamais dans l'URL), filtres défilants et export CSV.

type FormAction = (form: FormData) => Promise<void>

const btn = 'inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-pill px-3 text-sm font-semibold'

export function filterHref(filter: ContactFilter, page = 1): string {
  const params = new URLSearchParams()
  if (filter !== 'tous') params.set('filtre', filter)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${CONTACTS_PATH}?${qs}` : CONTACTS_PATH
}

export function ContactToolbar({ filter, query, search, clear }: { filter: ContactFilter; query: string; search: FormAction; clear: FormAction }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <form key={query} action={search} role="search" className="flex gap-2">
        <input type="hidden" name="filtre" value={filter} />
        <label htmlFor="recherche-contact" className="sr-only">
          Chercher une adresse ou un chien
        </label>
        <input
          id="recherche-contact"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={SEARCH_MAX}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Adresse ou nom du chien"
          className="min-h-11 min-w-0 flex-1 rounded-pill border border-line-2 bg-paper px-4 text-base text-ink"
        />
        <button type="submit" className={`${btn} bg-ink text-cream`}>
          <IconSearch className="size-4" />
          Chercher
        </button>
      </form>
      {query ? (
        <form action={clear} className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <input type="hidden" name="filtre" value={filter} />
          <span className="min-w-0 break-all">
            Recherche : <strong className="text-ink">{query}</strong>
          </span>
          <button type="submit" className={`${btn} min-h-9 border border-line-2 bg-paper px-2.5 text-ink`}>
            <IconClose className="size-3.5" />
            Effacer
          </button>
        </form>
      ) : null}
      <nav aria-label="Filtrer les contacts" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="m-0 flex list-none gap-1.5 p-0 text-sm">
          {CONTACT_FILTERS.map((f) => (
            <li key={f.key} className="shrink-0">
              <Link
                href={filterHref(f.key)}
                aria-current={f.key === filter ? 'true' : undefined}
                className={`inline-flex min-h-10 items-center whitespace-nowrap rounded-pill border px-3 font-semibold no-underline ${f.key === filter ? 'border-ink bg-ink text-cream' : 'border-line bg-paper text-ink'}`}
              >
                {f.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <a href={`${EXPORT_PATH}?liste=envois`} download className={`${btn} self-start border border-line-2 bg-paper text-ink no-underline`}>
        <IconDownload className="size-4" />
        Exporter en CSV
      </a>
    </div>
  )
}
