import Link from 'next/link'
import { CategoryIcon, IconChevron, VerdictIcon } from '@/components/icons'
import { articleHref } from '@/components/article/ArticleTile'
import type { Article } from '@/lib/mdx'

// @cdc 04-pages — « Questions les plus posées » du hub Guides : liste simple question → guide,
// avec la marque du verdict quand le guide en a un. Un guide absent est ignoré.
const QUESTIONS: { slug: string; question: string }[] = [
  { slug: 'chien-mange-chocolat-urgence', question: 'Mon chien a mangé du chocolat, que faire ?' },
  { slug: 'chien-mange-raisin-urgence', question: 'Le raisin est-il dangereux pour un chien ?' },
  { slug: 'chien-mange-os-cuit-urgence', question: "Il a avalé un os cuit, c'est grave ?" },
  { slug: 'combien-fois-par-jour-donner-manger-chien', question: 'Combien de repas par jour lui donner ?' },
  { slug: 'chien-peut-manger-fromage', question: 'Peut-il manger du fromage ?' },
  { slug: 'chien-peut-manger-banane', question: 'Peut-il manger de la banane ?' },
  { slug: 'chien-peut-manger-oeufs', question: 'Les œufs, crus ou cuits ?' },
  { slug: 'chien-peut-boire-lait', question: 'Peut-il boire du lait ?' },
]

export function TopQuestions({ articles }: { articles: Article[] }) {
  const items = QUESTIONS.flatMap((q) => {
    const article = articles.find((a) => a.slug === q.slug)
    return article ? [{ ...q, article }] : []
  })
  if (items.length === 0) return null
  return (
    <section aria-labelledby="questions-posees" className="v2 flex flex-col gap-3">
      <h2 id="questions-posees" className="m-0 font-display text-2xl font-black text-ink">Questions les plus posées</h2>
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-x-8 border-t border-line p-0 md:grid-cols-2">
        {items.map(({ slug, question, article }) => (
          <li key={slug} className="border-b border-line">
            <Link href={articleHref(article)} className="group flex min-h-13 items-center gap-3 py-2.5 text-ink no-underline">
              {article.frontmatter.verdict ? (
                <VerdictIcon verdict={article.frontmatter.verdict} className="size-6" />
              ) : (
                <CategoryIcon slug={article.frontmatter.categorySlug} className="size-6" />
              )}
              <span className="grow leading-snug group-hover:underline">{question}</span>
              <IconChevron className="size-4 text-ink-2" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
