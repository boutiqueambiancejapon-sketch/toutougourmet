import type { Metadata } from 'next'
import Link from 'next/link'
import { contactsOf, filterContacts, parseFilter } from '@/lib/dashboard/crm'
import { parsePage, readSearch } from '@/lib/dashboard/subscriber-search'
import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { nextForRow, planOptions } from '@/lib/server/dashboard-crm'
import { loadContactRows } from '@/lib/server/dashboard-email-tracking'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ContactList } from '@/components/dashboard/crm/ContactList'
import { ContactToolbar, filterHref } from '@/components/dashboard/crm/ContactToolbar'
import { CrmNav } from '@/components/dashboard/crm/CrmNav'
import { clearContactSearch, searchContacts } from './actions'

// @cdc tableau de bord — tous les contacts : lettre et comptes dans une seule liste, plus récents d'abord.

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: { absolute: 'Contacts — Tableau de bord' }, robots: { index: false, follow: false, nocache: true } }

const SIZE = 50
const pager = 'inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border border-line-2 bg-paper px-4 text-sm font-semibold text-ink no-underline'

type Props = { searchParams: Promise<{ periode?: string | string[]; filtre?: string | string[]; page?: string | string[] }> } & TabPageProps

export default async function ContactsPage(props: Props) {
  const period = await openTab(props)
  const sp = await props.searchParams
  const filter = parseFilter(sp.filtre)
  const page = parsePage(sp.page)
  const query = await readSearch()
  const res = await loadContactRows()
  const all = res.ok ? contactsOf(res.rows) : []
  const hits = filterContacts(all, filter, query)
  const options = planOptions()
  const items = hits.slice((page - 1) * SIZE, page * SIZE).map((row) => ({ row, next: nextForRow(row, options) }))
  const notice = !res.ok ? READ_FAILED : res.notices.includes('list-incomplete') ? 'La liste Brevo ou les comptes ne sont pas lisibles en entier pour le moment : des contacts peuvent manquer.' : null
  return (
    <DashboardShell period={period.key} current="crm" sub="/contacts" notice={notice}>
      <CrmNav period={period.key} current="/contacts" />
      <ContactToolbar filter={filter} query={query} search={searchContacts} clear={clearContactSearch} />
      <p className="m-0 mt-3 text-xs text-ink-2">
        {hits.length} {hits.length > 1 ? 'contacts' : 'contact'} sur {all.length}. Seules les adresses de test déclarées sur le serveur sont retirées.
      </p>
      <section aria-label="Contacts" className="mt-2 rounded-card border border-line bg-paper px-4 py-1 md:px-5">
        <ContactList items={items} query={query} />
      </section>
      {hits.length > SIZE ? (
        <nav aria-label="Pages de contacts" className="mt-3 flex justify-between gap-2">
          {page > 1 ? <Link href={filterHref(filter, page - 1)} className={pager}>Précédents</Link> : <span />}
          {page * SIZE < hits.length ? <Link href={filterHref(filter, page + 1)} className={pager}>Suivants</Link> : null}
        </nav>
      ) : null}
    </DashboardShell>
  )
}
