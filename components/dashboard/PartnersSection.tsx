import type { PartnerData, Row } from '@/lib/server/dashboard-queries'
import { clickPlaceLabel, emailPlaceLabel } from '@/lib/dashboard/place-labels'
import { BarList } from './BarList'
import { Panel, SectionTitle } from './Panel'

// @cdc tableau de bord — onglet Conversions : clics partenaires au détail (marque, emplacement,
// page de départ), puis panneaux des inscriptions à la lettre et au guide. Emplacements en clair
// (lib/dashboard/place-labels.ts) : panneau du guide, haut d'article, e-mail de résultat d'outil…

const named = (rows: Row[], label: (raw: string) => string): Row[] => rows.map((r) => ({ ...r, label: label(r.label) }))

export function PartnersSection({ data }: { data: PartnerData }) {
  return (
    <>
      <SectionTitle id="partenaires" title="Clics partenaires" intro="Chaque clic sur un lien de marque, compté au départ vers le site partenaire." />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel title="Par marque">
          <BarList rows={data.clicksByBrand} empty="Aucun clic partenaire sur la période." />
        </Panel>
        <Panel title="Par emplacement" hint="Bouton, encart ou tableau d’où part le clic.">
          <BarList rows={named(data.clicksByPlace, clickPlaceLabel)} empty="Aucun emplacement à classer pour l’instant." />
        </Panel>
        <Panel title="Pages qui envoient le plus de clics" wide>
          <BarList rows={data.clicksByPage} empty="Aucune page n’a encore envoyé de clic." />
        </Panel>
      </div>
    </>
  )
}

export function EmailSignupPanels({ data }: { data: PartnerData }) {
  return (
    <>
      <Panel title="Inscriptions à la lettre par source" hint="« Guide · … » : inscription au guide PDF, selon l’encart (panneau, haut ou fin d’article…).">
        <BarList rows={named(data.signupsByPlace, emailPlaceLabel)} empty="Aucune inscription sur la période." />
      </Panel>
      <Panel title="Le guide de la gamelle" hint="Téléchargements : clics sur « Télécharger le PDF » du site (le lien de l’e-mail n’est pas compté).">
        <BarList rows={data.guide} empty="Aucune inscription au guide sur la période." />
      </Panel>
    </>
  )
}
