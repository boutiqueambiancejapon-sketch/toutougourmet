import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { Panel } from '@/components/compte/espace/Panel'
import { ScanQuota } from '@/components/compte/espace/StatTiles'
import { btnPrimary, linkInline } from '@/components/compte/espace/ui'
import { ScanHistoryList } from '@/components/compte/ScanHistoryList'
import { IconScan } from '@/components/icons'
import { getSessionUser } from '@/lib/server/auth'
import { getMembership } from '@/lib/server/membership'
import { listUserScans, usedThisMonth } from '@/lib/server/scanner'
import { monthlyScanLimit } from '@/lib/scanner/config'

// Historique des scans : 20 dernières analyses en gratuit, historique complet avec Premium.
const FREE_HISTORY = 20
const PREMIUM_HISTORY = 1000

export const metadata: Metadata = { title: 'Mes scans' }

export default async function ScansPage() {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion?retour=/compte/scans')
  const [membership, used] = await Promise.all([getMembership(user.id), usedThisMonth(user.id)])
  const premium = membership?.plan === 'premium'
  const limit = monthlyScanLimit(premium ? 'premium' : 'free')
  const scans = await listUserScans(user.id, premium ? PREMIUM_HISTORY : FREE_HISTORY)
  return (
    <>
      <PageHeading
        title="Mes scans"
        lead={<p>Un sac retrouvé par son code-barres ne compte jamais. Seules les analyses d&apos;étiquette par photo entrent dans le quota du mois.</p>}
        action={
          <Link href="/scanner" className={btnPrimary}>
            <IconScan className="size-5" />
            Scanner un sac
          </Link>
        }
      />
      <ScanQuota used={used} limit={limit} />
      {premium ? null : (
        <p className="m-0 text-base text-ink-2">
          {`Premium passe le quota à ${monthlyScanLimit('premium')} analyses par mois et garde tout l'historique. `}
          <Link href="/compte#premium" className={linkInline}>
            Activer Premium
          </Link>
        </p>
      )}
      <Panel id="historique" title="Historique des analyses">
        <ScanHistoryList scans={scans} premium={premium} />
      </Panel>
    </>
  )
}
