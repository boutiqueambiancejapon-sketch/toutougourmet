import type { Metadata } from 'next'
import Link from 'next/link'
import { HomeHero } from '@/components/home-v2/HomeHero'
import { StartTiles } from '@/components/home-v2/StartTiles'
import { HomeBreeds } from '@/components/home-v2/HomeBreeds'
import { HomeBrands } from '@/components/home-v2/HomeBrands'
import { DidYouKnow } from '@/components/home-v2/DidYouKnow'
import { ArticleTile } from '@/components/article/ArticleTile'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'
import { getAllArticles } from '@/lib/mdx'
import { getFoodVerdicts } from '@/lib/food-verdicts'

export const metadata: Metadata = {
  // absolute : la page est sous le groupe (fr), le gabarit « %s | Toutou Gourmet » du
  // layout racine s'appliquerait. En V1 il ne s'appliquait pas (même segment) : on garde ce titre.
  title: { absolute: 'Toutou Gourmet : bien nourrir son chien, calculs et guides' },
  description:
    'Ration en grammes et aliments à éviter, race par race : plus de 350 guides sourcés et des calculateurs gratuits pour nourrir ton chien.',
  alternates: { canonical: 'https://www.toutou-gourmet.com' },
}

// @cdc 04-pages — accueil V2 : hero avec calculateur de ration, recherche « peut-il manger »,
// derniers guides, encart âge, races, marques recommandées (bande encre pleine largeur).
// L'encart orange et la bande encre ne se suivent plus (audit design-CRO, §3 Accueil).
// Textes indexables rendus côté serveur ; seuls l'outil et la recherche sont des îlots client.
export default function HomePage() {
  const articles = getAllArticles()
  const foods = getFoodVerdicts()
  const latest = [...articles]
    .sort((a, b) => (b.frontmatter.updatedAt || b.frontmatter.date).localeCompare(a.frontmatter.updatedAt || a.frontmatter.date))
    .slice(0, 3)

  return (
    <div className="v2 flex flex-col gap-14 pb-16">
      <div className="mx-auto flex w-full max-w-page flex-col gap-14 px-4 pt-6 md:px-8 md:pt-10">
        <HomeHero />
        <StartTiles foods={foods} />
        <section aria-labelledby="derniers-guides" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="derniers-guides" className="m-0 font-display text-2xl font-black text-ink">Les derniers guides</h2>
            <Link href="/chien" className="text-sm font-semibold text-orange-ink no-underline hover:underline">Tous les guides →</Link>
          </div>
          <ul role="list" className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
            {latest.map((a) => (
              <li key={a.slug}>
                <ArticleTile article={a} />
              </li>
            ))}
          </ul>
        </section>
        <DidYouKnow />
        <HomeBreeds />
      </div>
      <HomeBrands />
      <div className="mx-auto flex w-full max-w-page flex-col gap-14 px-4 md:px-8">
        <NewsletterBlock />
        <p className="m-0 text-sm text-ink-2">Les conseils de ce site ne remplacent pas une consultation vétérinaire.</p>
      </div>
    </div>
  )
}
