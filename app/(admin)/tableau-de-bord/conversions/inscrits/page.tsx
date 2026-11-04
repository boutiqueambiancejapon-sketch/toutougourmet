import { notFound, redirect } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { CONTACTS_PATH } from '@/lib/dashboard/subscriber-search'

// @cdc tableau de bord — ancienne adresse des inscrits, gardée pour les favoris. L'export CSV reste à côté.

export const dynamic = 'force-dynamic'

export default async function SubscribersMoved() {
  if (!(await dashboardAllowed())) notFound()
  redirect(CONTACTS_PATH)
}
