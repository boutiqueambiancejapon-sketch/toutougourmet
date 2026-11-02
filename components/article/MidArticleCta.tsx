import Link from 'next/link'
import type { MidCtaConfig } from '@/lib/mid-cta'

// @cdc affiliation — encart du milieu d'article, inséré par lib/remark-mid-cta.ts.
// Bloc encre avec ombre orange décalée, pastille ronde en tampon, un seul bouton principal.
// Rendu serveur ; les clics sont mesurés par components/analytics/Tracking.tsx (data-cta).

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1 size-4 shrink-0 text-amber">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MidArticleCta({ cta }: { cta: MidCtaConfig }) {
  const external = cta.button.href.startsWith('http')
  return (
    <aside
      data-cta={`mid-${cta.id}`}
      aria-label="Recommandation"
      className="v2 tg-reveal not-prose relative my-12 mr-2 rounded-card bg-ink p-6 pt-8 text-cream shadow-[8px_8px_0_var(--orange)] md:mr-3 md:p-10"
    >
      <p
        aria-hidden="true"
        className="tg-stamp absolute -top-6 -right-3 m-0 flex size-20 rotate-6 flex-col items-center justify-center rounded-full bg-orange text-ink shadow-[3px_3px_0_var(--ink)] md:-top-8 md:-right-5 md:size-28"
      >
        <span className="font-display text-xl font-black leading-none md:text-3xl">{cta.badge.big}</span>
        <span className="mt-1 text-[10px] font-bold leading-none md:text-xs">{cta.badge.small}</span>
      </p>
      <p className="m-0 max-w-[calc(100%-4.5rem)] text-sm font-bold text-amber md:max-w-none">{cta.eyebrow}</p>
      <p className="m-0 mt-3 font-display text-[clamp(1.5rem,3.4vw,2.25rem)] font-black leading-[1.08] tracking-tight text-cream">
        {cta.title}
      </p>
      <p className="m-0 mt-4 max-w-[60ch] text-base leading-relaxed text-cream/90 md:text-lg">{cta.body}</p>
      <ul role="list" className="m-0 mt-5 flex list-none flex-col gap-2 p-0 md:flex-row md:flex-wrap md:gap-x-6">
        {cta.checks.map((c) => (
          <li key={c} className="flex gap-2 text-[15px] font-medium text-cream">
            <Check />
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-7">
        <a
          href={cta.button.href}
          {...(external ? { target: '_blank', rel: 'sponsored noopener' } : {})}
          className="rounded-control inline-flex items-center bg-amber px-6 py-4 text-lg font-bold text-ink no-underline shadow-[5px_5px_0_var(--orange)] transition-transform hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_var(--orange)]"
        >
          {cta.button.label}&nbsp;→
        </a>
        {cta.secondary ? (
          <Link href={cta.secondary.href} className="text-[15px] font-semibold text-cream underline underline-offset-4">
            {cta.secondary.label}
          </Link>
        ) : null}
      </div>
      {external ? (
        <p className="m-0 mt-5 text-xs text-cream/70">Lien partenaire&nbsp;: on touche une commission si tu commandes, sans surcoût pour toi.</p>
      ) : null}
    </aside>
  )
}
