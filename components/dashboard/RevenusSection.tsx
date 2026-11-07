import { TAUX_CLIENT, VALEUR_CLIENT } from '@/data/partner-values'
import { clickPlaceLabel } from '@/lib/dashboard/place-labels'
import type { RevenusData } from '@/lib/server/dashboard-revenus'
import { BarList } from './BarList'
import { Panel, SectionTitle } from './Panel'

// @cdc tableau de bord — revenus estimés par page, emplacement et marque (onglet Conversions).

const nf = new Intl.NumberFormat('fr-FR')
const regle = Object.keys(VALEUR_CLIENT).map((m) => `${m} : ${VALEUR_CLIENT[m]} € le client, 1 clic sur ${Math.round(1 / (TAUX_CLIENT[m] ?? 1))} devient client`).join(' · ')

export function RevenusSection({ data, titles }: { data: RevenusData; titles: Map<string, string> }) {
  return (
    <>
      <SectionTitle id="revenus" title="Revenus estimés" intro={`Estimation à partir des clics, pas un relevé des partenaires. ${regle} (observé en novembre 2026, à recaler). Maxi Zoo et les autres marques ne sont pas encore chiffrés.`} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel title="Sur la période" hint={`${nf.format(data.clicsValorises)} clics chiffrés · ${nf.format(data.clicsSansValeur)} clics sans valeur connue`}>
          <p className="m-0 font-display text-4xl font-black tabular-nums text-ink">{`≈ ${nf.format(data.total)} €`}</p>
        </Panel>
        <Panel title="Par marque">
          <BarList rows={data.parMarque} unit=" €" empty="Aucun clic chiffré sur la période." />
        </Panel>
        <Panel title="Par emplacement" hint="Bouton, encadré ou tableau d’où part le clic.">
          <BarList rows={data.parPlace.map((r) => ({ ...r, label: clickPlaceLabel(r.label) }))} unit=" €" empty="Aucun emplacement chiffré." />
        </Panel>
        <Panel title="Pages qui rapportent le plus">
          <BarList rows={data.parPage.map((r) => ({ ...r, label: titles.get(r.label.replace(/\/$/, '')) ?? r.label }))} unit=" €" empty="Aucune page chiffrée." />
        </Panel>
      </div>
    </>
  )
}
