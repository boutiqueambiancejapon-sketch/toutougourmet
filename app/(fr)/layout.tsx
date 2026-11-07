import { SiteHeader } from '@/components/layout/v2/SiteHeader'
import { SiteFooter } from '@/components/layout/v2/SiteFooter'
import { TabBar } from '@/components/layout/v2/TabBar'
import { SiteDocument } from '@/components/layout/SiteDocument'
import { GuidePopup } from '@/components/guide/GuidePopup'
import { MiloFenetre } from '@/components/assistant/MiloFenetre'
import { bookSummary } from '@/lib/guide/book'

// @cdc i18n — français à la racine : le groupe (fr) n'apparaît pas dans l'URL,
// les adresses V1 ne changent pas. En-tête, pied de page et barre d'onglets V2,
// masqués à l'impression (fiche aliments dangereux, pages imprimées par les lecteurs).
// Panneau du guide (components/guide/GuidePopup.tsx) : pages françaises seulement.
export default function FrenchLayout({ children }: { children: React.ReactNode }) {
  const { foodCount, recipeCount } = bookSummary()
  return (
    <SiteDocument
      locale="fr"
      header={
        <div className="contents print:hidden">
          <SiteHeader />
        </div>
      }
      footer={
        <div className="contents print:hidden">
          <SiteFooter />
          <TabBar />
          <GuidePopup foodCount={foodCount} recipeCount={recipeCount} />
          <MiloFenetre />
        </div>
      }
    >
      {children}
    </SiteDocument>
  )
}
