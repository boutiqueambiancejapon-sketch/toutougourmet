import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { parsePeriod } from '@/lib/dashboard/period'
import { parseList, parsePage, readSearch } from '@/lib/dashboard/subscriber-search'
import { ACCOUNTS_PAGE_SIZE, listAccounts } from '@/lib/server/dashboard-accounts'
import { TRACKING_PAGE_SIZE, listEmailTracking } from '@/lib/server/dashboard-email-tracking'
import { listSubscribers, PAGE_SIZE } from '@/lib/server/dashboard-subscribers'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { AccountList } from '@/components/dashboard/subscribers/AccountList'
import { LetterList } from '@/components/dashboard/subscribers/LetterList'
import { ListSummary } from '@/components/dashboard/subscribers/ListSummary'
import { Pager } from '@/components/dashboard/subscribers/Pager'
import { SubscribersToolbar } from '@/components/dashboard/subscribers/SubscribersToolbar'
import { TrackingList } from '@/components/dashboard/subscribers/TrackingList'
import { clearSearch, searchSubscribers } from './actions'

// @cdc tableau de bord — adresses inscrites (lettre Brevo, comptes du site), sous-page de
// Conversions. Identifiants revérifiés ici (guard.ts), jamais indexée, jamais en cache.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Adresses inscrites — Tableau de bord' },
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  searchParams: Promise<{ liste?: string | string[]; page?: string | string[] }>
}

async function LetterBlock({ page, query }: { page: number; query: string }) {
  const result = await listSubscribers(page, query)
  return (
    <>
      {result.ok ? <ListSummary total={result.total} matched={result.matched} query={query} noun="inscrit" source="Liste Brevo de la lettre, lue en direct." /> : null}
      <section aria-label="Inscrits à la lettre" className="mt-3 rounded-card border border-line bg-paper px-4 py-1 md:px-5">
        <LetterList result={result} query={query} />
      </section>
      {result.ok ? <Pager list="lettre" page={page} count={result.matched} size={PAGE_SIZE} /> : null}
    </>
  )
}

async function AccountsBlock({ page, query }: { page: number; query: string }) {
  const result = await listAccounts(page, query)
  return (
    <>
      {result.ok ? <ListSummary total={result.total} matched={result.matched} query={query} noun="compte" source="Comptes créés sur le site." /> : null}
      <section aria-label="Comptes créés" className="mt-3 rounded-card border border-line bg-paper px-4 py-1 md:px-5">
        <AccountList result={result} query={query} />
      </section>
      {result.ok ? <Pager list="comptes" page={page} count={result.matched} size={ACCOUNTS_PAGE_SIZE} /> : null}
    </>
  )
}

async function TrackingBlock({ page, query }: { page: number; query: string }) {
  const result = await listEmailTracking(page, query)
  return (
    <>
      {result.ok ? <ListSummary total={result.total} matched={result.matched} query={query} noun="adresse" source="Liste Brevo, comptes du site et journal des envois." /> : null}
      <section aria-label="E-mails reçus par adresse" className="mt-3 rounded-card border border-line bg-paper px-4 py-1 md:px-5">
        <TrackingList result={result} query={query} />
      </section>
      {result.ok ? <Pager list="envois" page={page} count={result.matched} size={TRACKING_PAGE_SIZE} /> : null}
    </>
  )
}

export default async function SubscribersPage({ searchParams }: PageProps) {
  if (!(await dashboardAllowed())) notFound()
  const sp = await searchParams
  const list = parseList(sp.liste)
  const page = parsePage(sp.page)
  const query = await readSearch()
  return (
    <DashboardShell
      period={parsePeriod(undefined).key}
      current="conversions"
      title="Adresses inscrites"
      intro="Inscrits à la lettre, comptes créés et e-mails reçus par chaque adresse, les plus récents d’abord. Touche une adresse pour la lire en entier."
    >
      <SubscribersToolbar list={list} query={query} search={searchSubscribers} clear={clearSearch} />
      {list === 'comptes' ? <AccountsBlock page={page} query={query} /> : list === 'envois' ? <TrackingBlock page={page} query={query} /> : <LetterBlock page={page} query={query} />}
    </DashboardShell>
  )
}
