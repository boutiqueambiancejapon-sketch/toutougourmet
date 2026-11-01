import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SiteDocument } from '@/components/layout/SiteDocument'
import { NotFoundFr } from '@/components/layout/NotFoundFr'

// 404 des adresses qui ne correspondent à aucune route. Le layout racine est neutre
// (pas de <html>), cette page rend donc le document français complet, comme en V1.
export default function GlobalNotFound() {
  return (
    <SiteDocument locale="fr" header={<Header />} footer={<Footer />}>
      <NotFoundFr />
    </SiteDocument>
  )
}
