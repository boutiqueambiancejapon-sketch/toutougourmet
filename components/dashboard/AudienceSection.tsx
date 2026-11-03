import type { Period } from '@/lib/dashboard/period'
import type { VisitorsData } from '@/lib/server/dashboard-tabs'
import { BarList } from './BarList'
import { GeoPanels } from './GeoPanels'
import { Panel, SectionTitle } from './Panel'
import { StatTile } from './StatTile'

// @cdc tableau de bord — onglet Visiteurs, blocs « Sur la période » et « Outils et recherches » :
// pages lues, provenances, pays, puis ce que les lecteurs font avec les outils du site.

export function AudienceSection({ data, period }: { data: VisitorsData; period: Period }) {
  const { audience, geo } = data
  return (
    <>
      <SectionTitle id="periode" title="Sur la période" intro={`Sur ${period.long}, par rapport ${period.previous}.`} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <dl className="m-0 md:col-span-2">
          <StatTile label="Pages vues dans un navigateur" kpi={audience.pageViews} />
        </dl>
        <Panel title="Pages les plus vues" hint="Identifiants de chien ou de fiche remplacés par [id].">
          <BarList rows={audience.topPages} empty="Aucune page vue sur la période." />
        </Panel>
        <Panel title="D’où ils arrivent" hint="Site d’où vient la visite. « Accès direct ou inconnu » : adresse tapée, application ou origine masquée.">
          <BarList rows={audience.referrers} empty="Aucune provenance sur la période." />
        </Panel>
        <GeoPanels data={geo} />
      </div>
    </>
  )
}

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
