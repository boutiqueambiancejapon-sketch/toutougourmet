import type { ReactNode } from 'react'
import type { Period } from '@/lib/dashboard/period'
import type { SignupFunnelRow, SignupsData } from '@/lib/server/dashboard-signups'
import { signupPlaceLabel } from '@/lib/signup-places'
import { Empty, SectionTitle } from './Panel'

// @cdc tableau de bord — « Inscriptions » (maquette CRO 4) : comptes créés sur la période, écart
// avec la période d'avant, barres par emplacement d'origine, et pour chacun le parcours
// vues → clics → inscrits → confirmés.

const nf = new Intl.NumberFormat('fr-FR')

function deltaText(current: number, previous: number, period: Period): { text: string; up: boolean } {
  const diff = current - previous
  if (diff === 0) return { text: `Autant que ${period.previous.replace(/^aux /, 'les ')}`, up: false }
  return { text: `${diff > 0 ? '+' : '−'}${nf.format(Math.abs(diff))} par rapport ${period.previous}`, up: diff > 0 }
}

function Funnel({ row }: { row: SignupFunnelRow }) {
  const steps = [
    [row.views, row.views > 1 ? 'vues' : 'vue'],
    [row.clicks, row.clicks > 1 ? 'clics' : 'clic'],
    [row.created, row.created > 1 ? 'inscrits' : 'inscrit'],
    [row.verified, row.verified > 1 ? 'confirmés' : 'confirmé'],
    [row.dogs, row.dogs > 1 ? 'avec un chien' : 'avec un chien'],
    [row.returns, row.returns > 1 ? 'retours' : 'retour'],
  ] as const
  return (
    <p className="m-0 mt-1 text-xs text-ink-2">
      {steps.map(([n, label], i) => (
        <span key={label}>
          {i > 0 ? <span aria-hidden="true"> → </span> : null}
          <span className="sr-only">{i > 0 ? ', ' : ''}</span>
          <span className="font-semibold tabular-nums text-ink">{nf.format(n)}</span> {label}
        </span>
      ))}
    </p>
  )
}

/** children : panneaux des inscriptions à la lettre et au guide, rangés sous les comptes. */
export function SignupsSection({ data, period, children }: { data: SignupsData; period: Period; children?: ReactNode }) {
  const { current, previous } = data.total
  const delta = deltaText(current, previous, period)
  const max = Math.max(1, ...data.byPlace.map((r) => r.created))
  const withResult = data.byPlace.filter((r) => r.created > 0)
  const withoutResult = data.byPlace.filter((r) => r.created === 0)
  return (
    <>
      <SectionTitle id="inscriptions" title="Inscriptions" intro={`Sur ${period.long} : comptes créés selon l’invitation d’où vient chaque visiteur, puis inscriptions à la lettre et au guide.`} />
      <section aria-label="Inscriptions par emplacement" className="mt-4 rounded-card border border-line bg-paper p-4 md:p-5">
        <p className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-4xl font-black tabular-nums text-ink">{nf.format(current)}</span>
          <span className={`text-sm font-semibold ${delta.up ? 'text-green-ink' : 'text-ink-2'}`}>{delta.text}</span>
        </p>
        {withResult.length === 0 ? (
          <div className="mt-4">
            <Empty>Aucun compte créé sur la période.</Empty>
          </div>
        ) : (
          <ol className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
            {withResult.map((row) => (
              <li key={row.place} className="border-b border-line pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 text-ink">{signupPlaceLabel(row.place)}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink">{nf.format(row.created)}</span>
                </div>
                <div className="mt-1 h-2 rounded-pill bg-cream-2" aria-hidden="true">
                  <div className="h-2 rounded-pill bg-orange" style={{ width: `${Math.max((row.created / max) * 100, 2)}%` }} />
                </div>
                <Funnel row={row} />
              </li>
            ))}
          </ol>
        )}
        {withoutResult.length > 0 ? (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-ink-2">Voir les {withoutResult.length} emplacements sans compte créé</summary>
            <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
              {withoutResult.map((row) => (
                <li key={row.place}>
                  <span className="text-ink">{signupPlaceLabel(row.place)}</span>
                  <Funnel row={row} />
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        <p className="m-0 mt-4 text-xs text-ink-2">
          Pour chaque emplacement : combien de personnes ont vu l’invitation, cliqué, créé leur compte, puis confirmé leur
          e-mail (compté le jour de la confirmation).
        </p>
      </section>
      {children ? <div className="mt-3 grid gap-3 md:grid-cols-2">{children}</div> : null}
    </>
  )
}
