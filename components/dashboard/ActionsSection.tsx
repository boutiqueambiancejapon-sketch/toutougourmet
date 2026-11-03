import type { SummaryData } from '@/lib/server/dashboard-queries'
import type { Period } from '@/lib/dashboard/period'
import { BarList } from './BarList'
import { Panel, SectionTitle } from './Panel'
import { StatTile } from './StatTile'

// @cdc tableau de bord — chiffres clés, clics partenaires et actions des lecteurs.

export function ActionsSection({ data, period }: { data: SummaryData; period: Period }) {
  const { kpis } = data
  return (
    <>
      <SectionTitle id="chiffres" title="Chiffres clés" intro={`Sur ${period.long}, par rapport ${period.previous}.`} />
      <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Pages vues" kpi={kpis.pageViews} />
        <StatTile label="Clics partenaires" kpi={kpis.affiliateClicks} />
        <StatTile label="Inscriptions newsletter" kpi={kpis.signups} />
        <StatTile label="Résultats d’outils" kpi={kpis.toolResults} />
      </dl>

      <SectionTitle id="partenaires" title="Clics partenaires" intro="Chaque clic sur un lien de marque, compté au départ vers le site partenaire." />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel title="Par marque">
          <BarList rows={data.clicksByBrand} empty="Aucun clic partenaire sur la période." />
        </Panel>
        <Panel title="Par emplacement" hint="Bouton, encart ou tableau d’où part le clic.">
          <BarList rows={data.clicksByPlace} empty="Aucun emplacement à classer pour l’instant." />
        </Panel>
        <Panel title="Pages qui envoient le plus de clics" wide>
          <BarList rows={data.clicksByPage} empty="Aucune page n’a encore envoyé de clic." />
        </Panel>
      </div>

      <SectionTitle id="lecteurs" title="Lecteurs" intro="Inscriptions à la newsletter, outils et recherches faites sur le site." />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel title="Inscriptions newsletter par source" hint="« guide · … » : inscription au guide PDF, selon l’encart.">
          <BarList rows={data.signupsByPlace} empty="Aucune inscription sur la période." />
        </Panel>
        <Panel title="Le guide de la gamelle" hint="Téléchargements : clics sur « Télécharger le PDF » du site (le lien de l’e-mail n’est pas compté).">
          <BarList rows={data.guide} empty="Aucune inscription au guide sur la période." />
        </Panel>
        <Panel title="Outils les plus utilisés" hint="Un résultat affiché compte pour une utilisation.">
          <BarList rows={data.tools} empty="Aucun outil utilisé sur la période." />
        </Panel>
        <Panel title="Aliments les plus cherchés">
          <BarList rows={data.foodSearches} empty="Aucune recherche d’aliment sur la période." />
        </Panel>
        <Panel title="Recherches sans réponse" hint="Aliments cherchés que la fiche ne connaît pas : des sujets d’article.">
          <BarList rows={data.foodMisses} empty="Toutes les recherches ont trouvé une fiche." />
        </Panel>
      </div>
    </>
  )
}
