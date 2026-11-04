import { redirect } from 'next/navigation'
import { openTab, type TabPageProps } from '@/lib/dashboard/tab-page'
import { tabHref } from '@/lib/dashboard/tabs'

// @cdc tableau de bord — ancienne adresse de l'onglet, gardée pour les favoris.

export const dynamic = 'force-dynamic'

export default async function VisitorsMoved(props: TabPageProps) {
  const period = await openTab(props)
  redirect(tabHref('trafic', period.key, '', '/direct'))
}
