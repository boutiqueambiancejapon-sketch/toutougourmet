import { Fraunces, DM_Sans } from 'next/font/google'

// @cdc polices — next/font uniquement, 2 familles. Partagées par les layouts de chaque langue.
// adjustFontFallback vaut true par défaut pour next/font/google ; on l'écrit pour lever la dette notée dans CLAUDE.md.

export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
  variable: '--font-fraunces',
  adjustFontFallback: true,
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-dm-sans',
  adjustFontFallback: true,
})
