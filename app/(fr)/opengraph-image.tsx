import { ImageResponse } from 'next/og'
import { VerdictCard, PHOTO } from '@/lib/og/VerdictCard'
import { loadOgDogFace, loadOgFonts, loadOgPhoto, pngResponseToJpeg } from '@/lib/og/assets'
import { OG_SIZE } from '@/lib/og/tokens'

// @cdc 06-seo — miniature de l'accueil, reprise par les pages françaises sans miniature propre
export const size = OG_SIZE
export const contentType = 'image/jpeg'
export const alt = 'Toutou Gourmet : ce que mange ton chien, calculé pour lui'

export default async function Image() {
  const [fonts, dogFace, photo] = await Promise.all([
    loadOgFonts(),
    loadOgDogFace(),
    loadOgPhoto('/images/hero/home-hero.webp', PHOTO.width, PHOTO.height),
  ])
  const png = new ImageResponse(
    (
      <VerdictCard
        title="Ce que mange ton chien, calculé pour lui."
        pill={{ label: 'Guides et outils gratuits', tone: 'amber' }}
        photo={photo}
        dogFace={dogFace}
      />
    ),
    { ...OG_SIZE, fonts },
  )
  return pngResponseToJpeg(png)
}
