import Link from 'next/link'
import { getBrandBySlug } from '@/data/brands'
import { CONFIRMED_DISCOUNTS } from '@/data/partner-discounts'
import { PROMO_HUB_FAQS, PROMO_PAGES, PROMO_VERIFIED_AT, formatFrDate, promoPath } from '@/data/promo-codes'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { AffiliateNote } from '@/components/marques/AffiliateNote'
import { frTypo } from '@/lib/utils'
import { CopyCode } from './CopyCode'
import { PromoOffer } from './PromoOffer'

// @cdc affiliation — hub /codes-promo : une carte par partenaire (remise confirmée, code ou lien,
// pour quel chien, bouton partenaire, lien vers le mode d'emploi), puis FAQ (JSON-LD FAQPage).

const H2 = 'm-0 font-display text-2xl font-black leading-tight text-ink md:text-3xl'

export function PromoHub() {
  const offers = PROMO_PAGES.flatMap((p) => {
    const brand = getBrandBySlug(p.slug)
    return brand ? [{ page: p, brand }] : []
  })
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PROMO_HUB_FAQS.map((f) => ({ '@type': 'Question', name: frTypo(f.q), acceptedAnswer: { '@type': 'Answer', text: frTypo(f.a) } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-6 pb-16 md:px-8 md:pt-10">
        <div className="flex flex-col gap-6">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Marques', href: '/chien/marque' }, { label: 'Codes promo' }]} />
          <header className="flex max-w-prose flex-col gap-3">
            <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
              Codes promo croquettes et repas frais pour chien
            </h1>
            <p className="m-0 text-lg leading-relaxed text-ink-2">
              {frTypo(
                `${offers.length} remises de nos marques partenaires, de −20 % à −50 % sur la première commande ou l'abonnement. Une seule demande un code à taper : WZU7090 chez Dog Chef. Les autres passent par notre lien.`,
              )}
            </p>
            <p className="m-0 text-sm text-ink-2">
              Offres vérifiées le <time dateTime={PROMO_VERIFIED_AT}>{formatFrDate(PROMO_VERIFIED_AT)}</time>.
            </p>
          </header>
        </div>

        <section aria-labelledby="offres" className="flex flex-col gap-4">
          <h2 id="offres" className={H2}>Quelles remises pour quelle marque&nbsp;?</h2>
          <ul role="list" className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
            {offers.map(({ page, brand }) => (
              <li key={page.slug} className="flex flex-col gap-3 rounded-card border border-line bg-paper p-5">
                <h3 className="m-0 font-display text-xl font-black text-ink">{brand.name}</h3>
                <p className="m-0 text-lg font-bold text-ink">{frTypo(CONFIRMED_DISCOUNTS[page.slug] ?? '')}</p>
                {page.code ? (
                  <p className="m-0 flex flex-wrap items-center gap-2 text-ink-2">
                    Code&nbsp;: <CopyCode code={page.code} />
                  </p>
                ) : null}
                <p className="m-0 text-ink-2">
                  {page.code ? null : 'Sans code, par notre lien · '}
                  {frTypo(brand.facts.format)}
                </p>
                <p className="m-0 text-sm text-ink-2">{frTypo(`Pour : ${brand.facts.bestFor.toLowerCase()}.`)}</p>
                <PromoOffer brand={brand} slug={page.slug} code={page.code} variant="compact" />
                <Link href={promoPath(page.slug)} className="inline-flex min-h-11 items-center font-semibold text-orange-ink underline underline-offset-4 hover:text-ink">
                  {frTypo(`Mode d'emploi et conditions ${brand.name}`)}
                </Link>
              </li>
            ))}
          </ul>
          <AffiliateNote single={false} />
        </section>

        <section aria-labelledby="choisir" className="flex max-w-prose flex-col gap-3">
          <h2 id="choisir" className={H2}>Croquettes ou repas frais&nbsp;: quelle offre pour ton chien&nbsp;?</h2>
          <p className="m-0 leading-relaxed text-ink">
            {frTypo(
              "Dog Chef, Dogfy Diet et Elmut livrent des repas frais, plus chers que des croquettes : environ 1,50 à 5,50 € par jour chez Dog Chef selon le gabarit. Franklin Pet Food et Ultra Premium Direct vendent des croquettes en direct, de 3 à 9 € le kilo selon la marque et la recette.",
            )}
          </p>
          <p className="m-0 leading-relaxed text-ink">
            Pas sûr de la marque&nbsp;?{' '}
            <Link href="/quiz" className="font-semibold text-orange-ink underline underline-offset-4">Le test de ton chien</Link>
            {' '}propose une marque selon son profil, et le{' '}
            <Link href="/chien/marque" className="font-semibold text-orange-ink underline underline-offset-4">comparatif des marques</Link>
            {' '}détaille prix, fabrication et livraison.
          </p>
        </section>

        <section aria-labelledby="faq" className="flex max-w-prose flex-col gap-2">
          <h2 id="faq" className={H2}>Questions fréquentes sur les codes promo pour chien</h2>
          <FaqList>
            {PROMO_HUB_FAQS.map((f) => (
              <FaqItem key={f.q} question={frTypo(f.q)}>
                <p className="m-0">{frTypo(f.a)}</p>
              </FaqItem>
            ))}
          </FaqList>
        </section>
      </div>
    </>
  )
}
