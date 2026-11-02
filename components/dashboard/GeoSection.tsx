import type { GeoData } from '@/lib/server/dashboard-geo'
import type { Period } from '@/lib/dashboard/period'
import { countryName } from '@/lib/dashboard/country'
import { BarList } from './BarList'
import { Panel, SectionTitle } from './Panel'

// @cdc tableau de bord — section « Pays » : pays déduit de l'adresse IP au moment de la visite
// (base locale DB-IP), l'adresse n'est pas gardée. Une seule série par liste, une seule teinte.

export function GeoSection({ data, period }: { data: GeoData; period: Period }) {
  return (
    <>
      <SectionTitle
        id="pays"
        title="Pays"
        intro={`Sur ${period.long}. Le pays vient de l’adresse IP lue au moment de la visite, puis l’adresse est oubliée. « Inconnu » regroupe les visites d’avant le relevé du pays et les adresses non reconnues.`}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel title="Pages vues par pays" hint="Pages affichées dans un navigateur, part du total." wide>
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
      </div>
    </>
  )
}
