import { SiteHeader } from '@/components/layout/v2/SiteHeader'
import { SiteFooter } from '@/components/layout/v2/SiteFooter'
import { TabBar } from '@/components/layout/v2/TabBar'
import { SiteDocument } from '@/components/layout/SiteDocument'
import { NotFoundFr } from '@/components/layout/NotFoundFr'

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
