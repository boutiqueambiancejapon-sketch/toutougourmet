import { ImageResponse } from 'next/og'
import { categories, getCategoryBySlug } from '@/data/categories'
import { getArticlesByCategory } from '@/lib/mdx'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getSlotPath, resolveSlot } from '@/data/image-utils'
import { VerdictCard, PHOTO } from '@/lib/og/VerdictCard'
import { loadOgFonts, loadOgPhoto, pngResponseToJpeg } from '@/lib/og/assets'
import { OG_SIZE, getCategoryPill } from '@/lib/og/tokens'

// @cdc 06-seo — miniature de partage d'une page pilier : titre de la rubrique, photo de son article le plus récent.
export const size = OG_SIZE
export const contentType = 'image/jpeg'
export const alt = 'Toutou Gourmet'

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  const slugs = cat?.subCategorySlugs?.length ? cat.subCategorySlugs : [category]
  const latest = slugs.flatMap((s) => getArticlesByCategory(s))[0]
  const slot = latest ? resolveSlot(getArticleSlot(latest.slug, latest.frontmatter.category)) : undefined
  const [fonts, photo] = await Promise.all([
    loadOgFonts(),
    slot ? loadOgPhoto(getSlotPath(slot), PHOTO.width, PHOTO.height) : Promise.resolve(null),
  ])
  const png = new ImageResponse(
    <VerdictCard title={cat?.label ?? 'Toutou Gourmet'} pill={getCategoryPill(slugs[0] ?? category)} photo={photo} />,
    { ...OG_SIZE, fonts },
  )
  return pngResponseToJpeg(png)
}
