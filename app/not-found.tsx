import { SiteHeader } from '@/components/layout/v2/SiteHeader'
import { SiteFooter } from '@/components/layout/v2/SiteFooter'
import { TabBar } from '@/components/layout/v2/TabBar'
import { SiteDocument } from '@/components/layout/SiteDocument'
import type { Metadata } from 'next'
import { NotFoundFr } from '@/components/layout/NotFoundFr'

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: "Cette adresse ne mène à aucune page de Toutou Gourmet : nos outils, Milo et les produits les mieux notés du moment.",
  robots: { index: false },
}

// 404 des adresses qui ne correspondent à aucune route. Le layout racine est neutre
// (pas de <html>), cette page rend donc le document français complet, comme en V1.
export default function GlobalNotFound() {
  return (
    <SiteDocument
      locale="fr"
      header={<SiteHeader />}
      footer={
        <>
          <SiteFooter />
          <TabBar />
        </>
      }
    >
      <NotFoundFr />
    </SiteDocument>
  )
}
