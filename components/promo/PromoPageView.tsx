import Link from 'next/link'
import type { Brand } from '@/data/brands'
import { PROMO_HUB_PATH, PROMO_PAGES, PROMO_VERIFIED_AT, formatFrDate, promoFaqs, promoPath, type PromoPage } from '@/data/promo-codes'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { frTypo } from '@/lib/utils'
import { PromoOffer } from './PromoOffer'
import { titleTypo } from '@/lib/title-typo'

// @cdc affiliation — page « code promo » d'un partenaire (/codes-promo/[slug]) : réponse directe,
// offre et bouton partenaire, mode d'emploi, conditions tirées de nos données, pour quel chien,
// FAQ (JSON-LD FAQPage), autres offres. Rendu serveur, aucun Offer avec prix en JSON-LD.

const H2 = 'm-0 font-display text-2xl font-black leading-tight text-ink md:text-3xl'
const LINK = 'font-semibold text-orange-ink underline underline-offset-4 hover:text-ink'

export function PromoPageView({ page, brand }: { page: PromoPage; brand: Brand }) {
  const faqs = promoFaqs(page, brand)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: frTypo(f.q), acceptedAnswer: { '@type': 'Answer', text: frTypo(f.a) } })),
  }
  const others = PROMO_PAGES.filter((p) => p.slug !== page.slug)
  const howTitle = page.code ? `Comment utiliser le code promo ${brand.name} ?` : `Comment profiter de la remise ${brand.name} ?`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-6 pb-16 md:px-8 md:pt-10">
        <div className="flex flex-col gap-6">
          <BreadcrumbNav
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Marques', href: '/chien/marque' },
              { label: 'Codes promo', href: PROMO_HUB_PATH },
              { label: brand.name },
            ]}
          />
          <header className="flex max-w-prose flex-col gap-3">
            <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">{titleTypo(page.h1)}</h1>
            <p className="m-0 text-lg leading-relaxed text-ink-2">{frTypo(page.intro)}</p>
            <p className="m-0 text-sm text-ink-2">
              Offre vérifiée le <time dateTime={PROMO_VERIFIED_AT}>{formatFrDate(PROMO_VERIFIED_AT)}</time>.
            </p>
          </header>
          <PromoOffer brand={brand} slug={page.slug} code={page.code} />
        </div>

        <section aria-labelledby="mode-emploi" className="flex max-w-prose flex-col gap-3">
          <h2 id="mode-emploi" className={H2}>{titleTypo(howTitle)}</h2>
          <ol className="m-0 list-decimal space-y-2 pl-6 leading-relaxed text-ink">
            {page.steps.map((s) => (
              <li key={s}>{frTypo(s)}</li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="conditions" className="flex max-w-prose flex-col gap-3">
          <h2 id="conditions" className={H2}>{titleTypo(`Quelles sont les conditions de l'offre ${brand.name} ?`)}</h2>
          <ul className="m-0 list-disc space-y-2 pl-6 leading-relaxed text-ink">
            {page.conditions.map((c) => (
              <li key={c}>{frTypo(c)}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pour-quel-chien" className="flex max-w-prose flex-col gap-3">
          <h2 id="pour-quel-chien" className={H2}>{titleTypo(`${brand.name} est-il fait pour ton chien ?`)}</h2>
          <p className="m-0 leading-relaxed text-ink">{frTypo(page.fit)}</p>
          <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
            {page.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={LINK}>{frTypo(l.label)}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq" className="flex max-w-prose flex-col gap-2">
          <h2 id="faq" className={H2}>{titleTypo(`Questions fréquentes sur le code promo ${brand.name}`)}</h2>
          <FaqList>
            {faqs.map((f) => (
              <FaqItem key={f.q} question={frTypo(f.q)}>
                <p className="m-0">{frTypo(f.a)}</p>
              </FaqItem>
            ))}
          </FaqList>
          <PromoOffer brand={brand} slug={page.slug} code={page.code} variant="compact" />
        </section>

        <nav aria-label="Autres codes promo" className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-xl font-black text-ink">Les autres offres de nos partenaires</h2>
          <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={promoPath(p.slug)} className={LINK}>{frTypo(p.title)}</Link>
              </li>
            ))}
            <li>
              <Link href={PROMO_HUB_PATH} className={LINK}>Tous les codes promo pour chien</Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}
