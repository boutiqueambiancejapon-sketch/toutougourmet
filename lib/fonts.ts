import localFont from 'next/font/local'

// @cdc polices — next/font uniquement, 2 familles, fichiers hébergés dans le site (assets/fonts,
// sous-ensemble latin de Fontsource, licence SIL OFL). Plus de téléchargement chez Google au build :
// il échouait par intermittence (« next/font/google queries have exactly one entry »), sur Vercel
// comme sur le serveur. adjustFontFallback : 'Times New Roman' et 'Arial' limitent le décalage au chargement.

export const fraunces = localFont({
  src: [
    { path: '../assets/fonts/fraunces-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../assets/fonts/fraunces-latin-900-normal.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-fraunces',
  adjustFontFallback: 'Times New Roman',
})

export const dmSans = localFont({
  src: [
    { path: '../assets/fonts/dm-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/dm-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/dm-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-dm-sans',
  adjustFontFallback: 'Arial',
})
