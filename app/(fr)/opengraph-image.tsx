import { ImageResponse } from 'next/og'
import { VerdictCard, PHOTO } from '@/lib/og/VerdictCard'
import { loadOgFonts, loadOgPhoto, pngResponseToJpeg } from '@/lib/og/assets'
import { OG_SIZE } from '@/lib/og/tokens'

// @cdc 06-seo — miniature de l'accueil, reprise par les pages françaises sans miniature propre
export const size = OG_SIZE
export const contentType = 'image/jpeg'
export const alt = "Toutou Gourmet : bien nourrir ton chien, chiffres à l'appui"

export default async function Image() {
  const [fonts, photo] = await Promise.all([
    loadOgFonts(),
    loadOgPhoto('/images/hero/home-hero.webp', PHOTO.width, PHOTO.height, 'entropy'),
  ])
  const png = new ImageResponse(
    (
      <VerdictCard
        title="Bien nourrir ton chien, chiffres à l'appui."
        pill={{ label: 'Guides et outils gratuits', tone: 'amber' }}
        photo={photo}
      />
    ),
    { ...OG_SIZE, fonts },
  )
  return pngResponseToJpeg(png)
}
