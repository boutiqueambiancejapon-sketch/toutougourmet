'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StickyBar, STICKY_BADGE, STICKY_BUTTON } from './StickyBar'
import { pickDynamicTier, type StickyCtaBadgeColor, type StickyCtaConfig } from './sticky-cta-types'

export type { StickyCtaBadgeColor, StickyCtaConfig, DynamicSocialProofConfig, DynamicSocialProofTier } from './sticky-cta-types'

// @cdc 04-pages — bandeau collant d'affiliation : une ligne sur mobile (marque + accroche
// tronquée + bouton), preuve sociale et sous-libellé à partir de md.
const BADGE_BG: Record<StickyCtaBadgeColor, string> = {
  rose: 'bg-rose',
  green: 'bg-green',
  blue: 'bg-blue',
  amber: 'bg-amber',
}

/** Colore les séquences de ★ en ambre, garde le reste tel quel. */
function colorizeStars(text: string) {
  return text.split(/(★+)/).map((part, i) =>
    /^★+$/.test(part) ? (
      <span key={i} className="text-amber">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

/** Compteurs de l'endpoint de preuve sociale (champs numériques seulement), null en cas d'échec. */
function useDynamicData(endpoint: string | undefined): Record<string, number> | null {
  const [data, setData] = useState<Record<string, number> | null>(null)
  useEffect(() => {
    if (!endpoint) return
    let cancelled = false
    fetch(endpoint, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: Record<string, unknown>) => {
        if (cancelled) return
        const cleaned: Record<string, number> = {}
        for (const [k, v] of Object.entries(d)) {
          if (typeof v === 'number') cleaned[k] = v
        }
        setData(cleaned)
      })
      .catch(() => {
        /* pas de compteur, c'est tout */
      })
    return () => {
      cancelled = true
    }
  }, [endpoint])
  return data
}

export function StickyCta({ config }: { config: StickyCtaConfig }) {
  const dynData = useDynamicData(config.dynamicSocialProof?.endpoint)
  // Route interne (/...) : ni nouvel onglet ni rel sponsored
  const isInternal = config.url.startsWith('/')
  const buttonLabel = config.buttonLabel ?? (config.code ? "J'en profite →" : 'Acheter →')
  const proof = (config.dynamicSocialProof && dynData ? pickDynamicTier(dynData, config.dynamicSocialProof.tiers) : null) ?? config.socialProof

  return (
    <StickyBar>
      {config.badge ? <span className={`${STICKY_BADGE} ${BADGE_BG[config.badgeColor ?? 'rose']}`}>{config.badge}</span> : null}
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm leading-snug text-cream">
          <span className="font-bold">{config.brandName}</span>
          <span className="text-cream/75"> · {config.label}</span>
          {config.code ? (
            <>
              {' · Code '}
              <span className="font-mono font-bold text-amber">{config.code}</span>
            </>
          ) : null}
        </p>
        {proof ? <p className="m-0 mt-0.5 hidden truncate text-xs leading-snug text-cream/70 md:block">{colorizeStars(proof)}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <Link
          href={config.url}
          target={isInternal ? undefined : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer sponsored'}
          className={STICKY_BUTTON}
        >
          {buttonLabel}
        </Link>
        {config.subButton ? <span className="hidden whitespace-nowrap text-[11px] leading-snug text-cream/70 md:block">{config.subButton}</span> : null}
      </div>
    </StickyBar>
  )
}
