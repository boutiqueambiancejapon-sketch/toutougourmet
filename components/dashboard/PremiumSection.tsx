import type { Period } from '@/lib/dashboard/period'
import type { PremiumCounts, PremiumData } from '@/lib/server/dashboard-premium'
import { Empty, SectionTitle } from './Panel'

// @cdc tableau de bord — « Premium payant » (onglet Conversions) : paiements commencés → abonnements
// → fins d'abonnement, total et par formule, plus les abonnés actifs aujourd'hui.

const nf = new Intl.NumberFormat('fr-FR')

const INTERVALS: Record<string, string> = { month: 'Mensuel', year: 'Annuel', inconnu: 'Formule inconnue' }

const STEPS: { key: keyof PremiumCounts; label: string }[] = [
  { key: 'started', label: 'Paiements commencés' },
  { key: 'subscribed', label: 'Abonnements' },
  { key: 'canceled', label: 'Fins d’abonnement' },
]

function Tiles({ counts }: { counts: PremiumCounts }) {
  return (
    <dl className="m-0 grid grid-cols-3 gap-2">
      {STEPS.map((s) => (
        <div key={s.key} className="flex flex-col rounded-box bg-cream-2 p-3">
          <dt className="text-xs font-semibold text-ink-2">{s.label}</dt>
          <dd className="m-0 font-display text-2xl font-black tabular-nums text-ink">{nf.format(counts[s.key])}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PremiumSection({ data, period }: { data: PremiumData; period: Period }) {
  const any = data.total.started + data.total.subscribed + data.total.canceled > 0
  const now = data.activeNow === null ? 'migration 0009 pas encore appliquée' : `${nf.format(data.activeNow)} abonné${data.activeNow > 1 ? 's' : ''} payant${data.activeNow > 1 ? 's' : ''}`
  return (
    <>
      <SectionTitle id="premium" title="Premium payant" intro={`Sur ${period.long} : paiements commencés sur Stripe, abonnements devenus actifs, abonnements terminés. Comptés par le serveur.`} />
      <section aria-label="Premium payant" className="mt-4 flex flex-col gap-4 rounded-card border border-line bg-paper p-4 md:p-5">
        <p className="m-0 text-sm text-ink-2">
          Aujourd&apos;hui : <span className="font-semibold text-ink">{now}</span>, {nf.format(data.launchNow)} Premium gratuit{data.launchNow > 1 ? 's' : ''} du lancement.
        </p>
        {any ? (
          <>
            <Tiles counts={data.total} />
            {data.byInterval.map((row) => (
              <div key={row.interval} className="flex flex-col gap-2">
                <h3 className="m-0 text-sm font-semibold text-ink">{INTERVALS[row.interval] ?? row.interval}</h3>
                <Tiles counts={row.counts} />
              </div>
            ))}
          </>
        ) : (
          <Empty>Aucun paiement Premium sur la période.</Empty>
        )}
      </section>
    </>
  )
}
