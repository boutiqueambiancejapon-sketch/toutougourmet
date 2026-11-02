import Link from 'next/link'
import { ScoreBadge } from '@/components/scanner/ScoreBadge'
import { betterKibbleOffer } from '@/lib/account-offers'
import type { ScanSummary } from '@/lib/server/scanner'
import { PARTNER_NOTICE } from './OfferCard'

// @cdc lot 6 — « Mes analyses » dans /compte : historique du scanner, du plus récent au plus ancien.
// Premium : historique complet et, sous une croquette notée sous 55, une alternative partenaire
// avec sa raison (lib/account-offers.ts). Compte gratuit : 20 dernières analyses.

export const LOW_SCORE = 55

interface ScanHistoryListProps {
  scans: ScanSummary[]
  used: number
  limit: number
  premium: boolean
}

export function ScanHistoryList({ scans, used, limit, premium }: ScanHistoryListProps) {
  const alt = betterKibbleOffer()
  const hasLow = scans.some((s) => s.score !== null && s.score < LOW_SCORE)
  return (
    <section aria-labelledby="mes-analyses" className="flex flex-col gap-3">
      <h2 id="mes-analyses" className="m-0 font-display text-2xl font-black text-ink">
        Mes analyses
      </h2>
      {scans.length > 0 ? (
        <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
          {scans.map((s, i) => (
            <li key={`${s.slug}-${i}`} className="flex flex-col gap-1 py-3">
              <Link href={`/croquettes/${s.slug}`} className="group flex min-h-11 items-center gap-3 text-ink no-underline">
                <ScoreBadge score={s.score} />
                <span className="flex min-w-0 grow flex-col">
                  <span className="truncate font-semibold group-hover:underline">{[s.brand, s.product].filter(Boolean).join(' · ') || 'Produit sans nom lisible'}</span>
                  <span className="text-sm text-ink-2">
                    {s.at.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })}
                  </span>
                </span>
              </Link>
              {s.score !== null && s.score < LOW_SCORE ? (
                premium ? (
                  <p data-cta="account-alternative" className="m-0 text-sm leading-relaxed text-ink-2">
                    <a href={alt.url} rel="sponsored noopener" target="_blank" className="font-semibold text-orange-ink underline underline-offset-2">
                      Voir une meilleure alternative
                    </a>
                    {` : ${alt.brand}${alt.discount ? ` (${alt.discount})` : ''}. ${alt.reason}`}
                  </p>
                ) : (
                  <p className="m-0 text-sm text-ink-2">
                    <Link href="/premium" className="font-semibold text-orange-ink underline underline-offset-2">
                      Voir une meilleure alternative
                    </Link>{' '}
                    avec Premium, gratuit pendant le lancement.
                  </p>
                )
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-base leading-relaxed text-ink-2">Pas encore d&apos;analyse. Prends en photo l&apos;étiquette de ses croquettes pour obtenir leur note.</p>
      )}
      {premium && hasLow ? <p className="m-0 text-xs text-ink-2">{PARTNER_NOTICE}</p> : null}
      <p className="m-0 text-sm text-ink-2">
        {`Analyses par photo ce mois-ci : ${used} sur ${limit}.`}
        {premium ? null : (
          <>
            {' '}
            <a href="#premium" className="font-semibold text-orange-ink underline underline-offset-2">
              Passe Premium, c&apos;est gratuit pendant le lancement
            </a>
            .
          </>
        )}
      </p>
      <Link
        href="/scanner"
        className="inline-flex min-h-12 items-center justify-center self-start rounded-control border-2 border-ink px-5 text-[15px] font-semibold text-ink no-underline"
      >
        Scanner une étiquette
      </Link>
    </section>
  )
}
