import { redirect } from 'next/navigation'
import { openSeoPage, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { hrefOf } from '@/lib/seo-dash/nav'

// @cdc tableau de bord SEO — ancienne adresse (Robots IA), gardée pour les favoris : renvoi vers « Exploration ».

export const dynamic = 'force-dynamic'

export default async function Moved(props: SeoPageProps) {
  const { query } = await openSeoPage(props)
  redirect(hrefOf('exploration', query))
}
