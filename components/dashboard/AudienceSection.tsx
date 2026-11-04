import type { VisitorsData } from '@/lib/server/dashboard-tabs'
import { BarList } from './BarList'
import { Panel, SectionTitle } from './Panel'
import { StatTile } from './StatTile'

// @cdc tableau de bord — Trafic, sous-page Pages : ce que les lecteurs font avec les outils du site.

export function ReaderToolsSection({ data }: { data: VisitorsData }) {
  const { audience } = data
  return (
    <>
      <SectionTitle id="outils" title="Outils et recherches" intro="Calculs et recherches faits par les lecteurs sur le site." />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <dl className="m-0 md:col-span-2">
          <StatTile label="Résultats d’outils affichés" kpi={audience.toolResults} />
        </dl>
        <Panel title="Outils les plus utilisés" hint="Un résultat affiché compte pour une utilisation.">
          <BarList rows={audience.tools} empty="Aucun outil utilisé sur la période." />
        </Panel>
        <Panel title="Aliments les plus cherchés">
          <BarList rows={audience.foodSearches} empty="Aucune recherche d’aliment sur la période." />
        </Panel>
        <Panel title="Recherches sans réponse" hint="Aliments cherchés que la fiche ne connaît pas : des sujets d’article." wide>
          <BarList rows={audience.foodMisses} empty="Toutes les recherches ont trouvé une fiche." />
        </Panel>
      </div>
    </>
  )
}
