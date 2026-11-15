import Link from 'next/link'
import { getBrandBySlug } from '@/data/brands'
import { BF_CHECKED_AT, BF_PAGES, BF_PATH, bfPath, type BfPage } from '@/data/black-friday'
import { isOfferSlug } from '@/data/partner-discounts'
import { formatFrDate, getPromoPage, promoPath } from '@/data/promo-codes'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { PromoOffer } from '@/components/promo/PromoOffer'
import { frTypo } from '@/lib/utils'
import { titleTypo } from '@/lib/title-typo'
import { BfMaxiZoo } from './BfMaxiZoo'

// @cdc affiliation — page fille Black Friday d'une marque : réponse directe, offre confirmée et bouton partenaire
// (ou promos Maxi Zoo du jour), quand commander, FAQ (JSON-LD FAQPage), liens vers les autres marques et le pilier.

const H2 = 'm-0 font-display text-2xl font-black leading-tight text-ink md:text-3xl'
const LINK = 'font-semibold text-orange-ink underline underline-offset-4 hover:text-ink'
export const BF_PLACE = 'black-friday'

export function BfBrandView({ page }: { page: BfPage }) {
  const brand = isOfferSlug(page.slug) ? getBrandBySlug(page.slug) : undefined
  const promo = isOfferSlug(page.slug) ? getPromoPage(page.slug) : undefined
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({ '@type': 'Question', name: frTypo(f.q), acceptedAnswer: { '@type': 'Answer', text: frTypo(f.a) } })),
  }
  const others = BF_PAGES.filter((p) => p.slug !== page.slug)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-6 pb-16 md:px-8 md:pt-10">
        <div className="flex flex-col gap-6">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Black Friday', href: BF_PATH }, { label: page.name }]} />
          <header className="flex max-w-prose flex-col gap-3">
            <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">{titleTypo(page.h1)}</h1>
            <p className="m-0 text-lg leading-relaxed text-ink-2">{frTypo(page.intro)}</p>
            <p className="m-0 text-sm text-ink-2">
              Vérifié le <time dateTime={BF_CHECKED_AT}>{formatFrDate(BF_CHECKED_AT)}</time>. Le récapitulatif de commande affiché le jour de ton achat fait foi.
            </p>
          </header>
          {brand && isOfferSlug(page.slug) ? <PromoOffer brand={brand} slug={page.slug} code={promo?.code ?? null} place={BF_PLACE} /> : null}
        </div>

        {page.slug === 'maxi-zoo' ? <BfMaxiZoo /> : null}

        <section aria-labelledby="quand" className="flex max-w-prose flex-col gap-3">
          <h2 id="quand" className={H2}>{titleTypo(`Faut-il attendre le Black Friday pour commander chez ${page.name} ?`)}</h2>
          <p className="m-0 leading-relaxed text-ink">{frTypo(page.wait)}</p>
          {promo && isOfferSlug(page.slug) ? (
            <p className="m-0 leading-relaxed text-ink">
              Les étapes et les conditions détaillées sont sur notre page{' '}
              <Link href={promoPath(page.slug)} className={LINK}>{frTypo(`code promo ${page.name}`)}</Link>.
            </p>
          ) : null}
        </section>

        <section aria-labelledby="faq" className="flex max-w-prose flex-col gap-2">
          <h2 id="faq" className={H2}>{titleTypo(`Questions fréquentes sur le Black Friday ${page.name}`)}</h2>
          <FaqList>
            {page.faqs.map((f) => (
              <FaqItem key={f.q} question={frTypo(f.q)}>
                <p className="m-0">{frTypo(f.a)}</p>
              </FaqItem>
            ))}
          </FaqList>
          {brand && isOfferSlug(page.slug) ? <PromoOffer brand={brand} slug={page.slug} code={null} variant="compact" place={BF_PLACE} /> : null}
          <p className="m-0 text-sm leading-relaxed text-ink-2">Lien partenaire&nbsp;: on touche une commission si tu commandes, sans surcoût pour toi.</p>
        </section>

        <nav aria-label="Black Friday des autres marques" className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-xl font-black text-ink">Le Black Friday des autres marques</h2>
          <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={bfPath(p.slug)} className={LINK}>{`Black Friday ${p.name}`}</Link>
              </li>
            ))}
            <li>
              <Link href={BF_PATH} className={LINK}>Black Friday croquettes et nourriture pour chien</Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}
