import { SiteHeader } from '@/components/layout/v2/SiteHeader'
import { SiteFooter } from '@/components/layout/v2/SiteFooter'
import { TabBar } from '@/components/layout/v2/TabBar'
import { SiteDocument } from '@/components/layout/SiteDocument'

// @cdc i18n — français à la racine : le groupe (fr) n'apparaît pas dans l'URL,
// les adresses V1 ne changent pas. En-tête, pied de page et barre d'onglets V2.
export default function FrenchLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </SiteDocument>
  )
}
