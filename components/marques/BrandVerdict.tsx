import Link from 'next/link'
import { brandOfferLabel, type Brand } from '@/data/brands'
import { AffiliateNote } from './AffiliateNote'
import { titleTypo } from '@/lib/title-typo'

// @cdc affiliation — CTA principal d'une fiche marque (un seul par page) : bloc orange plein, verdict
// en clair, un bouton. Marque en rupture : pas de bouton, un lien discret et des alternatives.
// Clics mesurés par components/analytics/Tracking.tsx (data-cta="brand-fiche").

export function BrandVerdict({ brand, verdict }: { brand: Brand; verdict: string }) {
  const out = Boolean(brand.stockNote)
  return (
    <section
      aria-labelledby="verdict"
      data-cta="brand-fiche"
      className={`v2 rounded-card p-6 md:p-10 ${out ? 'border border-line bg-cream-2' : 'bg-orange shadow-[8px_8px_0_var(--ink)]'}`}
    >
      <h2 id="verdict" className="m-0 font-display text-[clamp(1.5rem,3vw,2rem)] font-black leading-tight text-ink">
        {titleTypo(`Faut-il essayer ${brand.name} ?`)}
      </h2>
      <p className="m-0 mt-4 max-w-[65ch] text-base leading-relaxed text-ink md:text-lg">{verdict}</p>
      <p className="m-0 mt-5 font-semibold text-ink">{brandOfferLabel(brand)}</p>
      {out ? (
        <p className="m-0 mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/chien/avis-marques/avis-dogfy-diet-repas-frais-chien" className="font-semibold text-ink underline underline-offset-4">Voir Dogfy Diet</Link>
          <Link href="/chien/marque/dog-chef" className="font-semibold text-ink underline underline-offset-4">Voir Dog Chef</Link>
          <a href={brand.affiliateUrl} target="_blank" rel="sponsored noopener" className="text-ink-2 underline underline-offset-4">
            Vérifier le stock chez {brand.name}
          </a>
        </p>
      ) : (
        <div className="mt-6 flex flex-col items-start gap-3">
          <a
            href={brand.affiliateUrl}
            target="_blank"
            rel="sponsored noopener"
            className="inline-flex min-h-12 items-center rounded-control bg-ink px-6 py-3 text-lg font-bold text-cream no-underline transition-transform hover:-translate-y-0.5"
          >
            Voir l&apos;offre {brand.name}&nbsp;→
          </a>
          {brand.affiliateCode ? (
            <p className="m-0 text-sm text-ink">
              Code appliqué par le lien&nbsp;: <span className="font-mono font-bold">{brand.affiliateCode}</span>
            </p>
          ) : null}
        </div>
      )}
      <AffiliateNote className="mt-5 text-ink" />
    </section>
  )
}
