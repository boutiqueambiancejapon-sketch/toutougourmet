import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SiteDocument } from '@/components/layout/SiteDocument'

// @cdc i18n — français à la racine : le groupe (fr) n'apparaît pas dans l'URL,
// les adresses V1 ne changent pas.
export default function FrenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteDocument locale="fr" header={<Header />} footer={<Footer />}>
      {children}
    </SiteDocument>
  )
}
