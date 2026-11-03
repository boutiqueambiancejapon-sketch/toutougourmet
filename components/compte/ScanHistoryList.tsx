import Link from 'next/link'
import { IconChevron } from '@/components/icons'
import { ScoreBadge } from '@/components/scanner/ScoreBadge'
import { betterKibbleOffer } from '@/lib/account-offers'
import type { ScanSummary } from '@/lib/server/scanner'
import { PARTNER_NOTICE } from './OfferCard'

// @cdc lot 6 — historique du scanner dans l'espace compte, du plus récent au plus ancien.
// Sous une croquette notée sous 55 : une alternative partenaire (tous les comptes). Premium : historique complet
// avec sa raison (lib/account-offers.ts). Compte gratuit : 20 dernières analyses.

export const LOW_SCORE = 55

const dateFr = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

export function ScanRows({ scans }: { scans: ScanSummary[] }) {
  const alt = betterKibbleOffer()
  const hasLow = scans.some((s) => s.score !== null && s.score < LOW_SCORE)
  return (
    <>
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {scans.map((s, i) => (
          <li key={`${s.slug}-${i}`} className="m-0 flex flex-col gap-2 rounded-box border border-line bg-paper p-3">
            <Link href={`/croquettes/${s.slug}`} className="group flex min-h-11 items-center gap-3 text-ink no-underline">
              <ScoreBadge score={s.score} />
              <span className="flex min-w-0 grow flex-col">
                <span className="truncate font-semibold group-hover:underline">{[s.brand, s.product].filter(Boolean).join(' · ') || 'Produit sans nom lisible'}</span>
                <span className="text-sm text-ink-2">{dateFr(s.at)}</span>
              </span>
              <IconChevron className="size-4 text-ink-2" />
            </Link>
            {s.score !== null && s.score < LOW_SCORE ? (
              <p data-cta="account-alternative" className="m-0 rounded-control bg-amber-bg px-3 py-2 text-sm leading-relaxed text-ink-2">
                <a href={alt.url} rel="sponsored noopener" target="_blank" className="font-semibold text-orange-ink underline underline-offset-2">
                  Voir une meilleure alternative
                </a>
                {` : ${alt.brand}${alt.discount ? ` (${alt.discount})` : ''}. ${alt.reason}`}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {hasLow ? <p className="m-0 text-xs text-ink-2">{PARTNER_NOTICE}</p> : null}
    </>
  )
}

export function ScanHistoryList({ scans, premium }: { scans: ScanSummary[]; premium: boolean }) {
  if (scans.length === 0) {
    return <p className="m-0 text-base leading-relaxed text-ink-2">Pas encore d&apos;analyse. Prends en photo l&apos;étiquette de ses croquettes pour obtenir leur note.</p>
  }
  return (
    <>
      <ScanRows scans={scans} />
      <p className="m-0 text-sm text-ink-2">
        {premium ? 'Premium garde toutes tes analyses.' : 'Le compte gratuit garde tes 20 dernières analyses, Premium les garde toutes.'}
      </p>
    </>
  )
}
