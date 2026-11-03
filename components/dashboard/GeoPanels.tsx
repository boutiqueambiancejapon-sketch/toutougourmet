import type { GeoData } from '@/lib/server/dashboard-geo'
import { countryName } from '@/lib/dashboard/country'
import { BarList } from './BarList'
import { Panel } from './Panel'

// @cdc tableau de bord — panneaux « Pays » (onglet Visiteurs) : pays déduit de l'adresse IP au moment
// de la visite (base locale DB-IP), l'adresse n'est pas gardée. Une seule série par liste, une seule teinte.

export function GeoPanels({ data }: { data: GeoData }) {
  return (
    <>
      <Panel
        title="Pages vues par pays"
        hint="Pays lu sur l’adresse IP au moment de la visite, puis l’adresse est oubliée. « Inconnu » : visites d’avant le relevé du pays et adresses non reconnues."
        wide
      >
        <BarList rows={data.views} total={data.viewsTotal} format={countryName} empty="Aucune page vue sur la période." />
      </Panel>
      <Panel title="Clics partenaires par pays">
        <BarList rows={data.clicks} format={countryName} empty="Aucun clic partenaire sur la période." />
      </Panel>
      <Panel title="Inscriptions par pays">
        <BarList rows={data.signups} format={countryName} empty="Aucune inscription sur la période." />
      </Panel>
      <Panel title="Résultats d’outils par pays" wide>
        <BarList rows={data.tools} format={countryName} empty="Aucun outil utilisé sur la période." />
      </Panel>
    </>
  )
}
