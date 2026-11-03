// @cdc guide — page d'inscription au guide PDF (indexable, rendue au build). Textes de la
// maquette validée ; le sommaire et les chiffres viennent du plan du livre (lib/guide/book.ts).
import type { Metadata } from 'next'
import Link from 'next/link'
import { IconCheck } from '@/components/icons'
import { GuidePreview } from '@/components/guide/GuidePreview'
import { GuideSignup } from '@/components/guide/GuideSignup'
import { buildBook } from '@/lib/guide/book'
import { GUIDE_PAGE_PATH, GUIDE_TITLE } from '@/lib/guide/config'

const URL = `https://www.toutou-gourmet.com${GUIDE_PAGE_PATH}`
const TITLE = 'Le guide de la gamelle : guide alimentation chien gratuit'
const DESCRIPTION =
  'Ce que ton chien peut manger, ce qu’il faut limiter, ce qui est interdit, et 6 recettes maison : le guide alimentation PDF gratuit de Toutou Gourmet.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website' },
}

export default function GuidePage() {
  const book = buildBook()
  const checks = [
    `${book.foodCount} aliments classés, avec la bonne quantité`,
    'Les numéros antipoison France, Belgique, Canada',
    `${book.recipes.length} recettes avec les doses par taille de chien`,
  ]
  return (
    <div className="v2 bg-cream">
      <section className="mx-auto grid max-w-page items-center gap-8 px-4 py-8 md:grid-cols-2 md:gap-12 md:px-8 md:py-14">
        <div className="flex max-w-xl flex-col gap-4">
          <span className="self-start rounded-pill bg-orange px-3 py-1 text-xs font-semibold text-ink">
            Guide gratuit · PDF de {book.pages.length} pages
          </span>
          <h1 className="m-0 font-display text-[clamp(1.75rem,5vw,3rem)] font-black leading-[1.05] text-ink">{GUIDE_TITLE}</h1>
          <p className="m-0 text-base text-ink-2 md:text-lg">
            Ce que ton chien peut manger, ce qu&apos;il faut limiter, ce qui est interdit. Et {book.recipes.length} recettes maison.
          </p>
          <div className="md:hidden">
            <GuidePreview />
          </div>
          <GuideSignup />
          <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0 text-[15px] text-ink">
            {checks.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-green text-green-ink">
                  <IconCheck className="size-4" />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:block">
          <GuidePreview />
        </div>
      </section>

      <section aria-labelledby="sommaire" className="mx-auto max-w-page px-4 pb-12 md:px-8">
        <div className="max-w-prose rounded-card border border-line bg-paper p-5 md:p-7">
          <h2 id="sommaire" className="m-0 font-display text-2xl font-black text-ink">
            Ce qu&apos;il y a dans le guide
          </h2>
          <ol className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
            {book.toc.map((entry) => (
              <li key={entry.title} className="border-b border-line pb-3 last:border-0 last:pb-0">
                <p className="m-0 flex items-baseline justify-between gap-3 font-semibold text-ink">
                  {entry.title}
                  <span className="shrink-0 text-sm font-normal text-ink-2">page {entry.page}</span>
                </p>
                {entry.children ? (
                  <p className="m-0 mt-1 text-[15px] text-ink-2">{entry.children.map((c) => c.title).join(', ')}.</p>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="m-0 mt-5 text-[15px] text-ink-2">
            Chaque page reprend une fiche du site :{' '}
            <Link href="/chien/peut-manger" className="font-semibold text-orange-ink underline underline-offset-2">
              que peut manger un chien
            </Link>
            ,{' '}
            <Link href="/chien/urgences" className="font-semibold text-orange-ink underline underline-offset-2">
              aliments dangereux
            </Link>{' '}
            et recettes maison. Il ne remplace pas l&apos;avis d&apos;un vétérinaire.
          </p>
        </div>
      </section>
    </div>
  )
}
