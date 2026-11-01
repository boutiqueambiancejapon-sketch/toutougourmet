import { ImageResponse } from 'next/og'
import { getAllArticles, getArticleBySlug } from '@/lib/mdx'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getSlotPath, resolveSlot } from '@/data/image-utils'
import { VerdictCard, PHOTO } from '@/lib/og/VerdictCard'
import { loadOgFonts, loadOgPhoto, pngResponseToJpeg } from '@/lib/og/assets'
import { OG_SIZE, getCategoryPill } from '@/lib/og/tokens'

// @cdc 06-seo — miniature de partage par article, générée au build (1200×630, JPEG)
export const size = OG_SIZE
export const contentType = 'image/jpeg'
export const alt = 'Toutou Gourmet'

export async function generateStaticParams() {
  return getAllArticles()
    .filter((a) => a.frontmatter.categorySlug)
    .map((a) => ({ category: a.frontmatter.categorySlug, slug: a.slug }))
}

const FALLBACK_SLOT = 'cat-nutrition'

function photoPath(slug: string, category: string): string {
  const slot = resolveSlot(getArticleSlot(slug, category)) ?? resolveSlot(FALLBACK_SLOT)
  return slot ? getSlotPath(slot) : `/images/articles/${FALLBACK_SLOT}.webp`
}

export default async function Image({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  const fm = article?.frontmatter
  const [fonts, photo] = await Promise.all([
    loadOgFonts(),
    fm ? loadOgPhoto(photoPath(slug, fm.category), PHOTO.width, PHOTO.height) : Promise.resolve(null),
  ])
  const png = new ImageResponse(
    (
      <VerdictCard
        title={fm?.ogTitle ?? fm?.title ?? 'Toutou Gourmet'}
        pill={getCategoryPill(fm?.categorySlug ?? '')}
        photo={photo}
        verdict={fm?.verdict}
        verdictNote={fm?.verdictNote}
      />
    ),
    { ...OG_SIZE, fonts },
  )
  return pngResponseToJpeg(png)
}
