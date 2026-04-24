import type { Brand } from '@/data/brands'
import type { ReactNode } from 'react'

export interface BrandDisplay {
  emoji: string
  typeLabel: string
  pillVar: string
  recette: string
  featured?: boolean
}

export interface ComparisonRow {
  key: string
  label: string
  render: (b: Brand) => ReactNode
}

export const BRAND_DISPLAY: Record<string, BrandDisplay> = {
  franklin: {
    emoji: '🔥',
    typeLabel: 'Croquettes',
    pillVar: 'var(--pill-amber)',
    recette: 'Mono-protéine',
  },
  elmut: {
    emoji: '🌿',
    typeLabel: 'Repas frais',
    pillVar: 'var(--pill-green)',
    recette: 'Cuisine maison',
    featured: true,
  },
  'petty-well': {
    emoji: '⭐',
    typeLabel: 'Croquettes',
    pillVar: 'var(--pill-blue)',
    recette: 'Formulée AgroParisTech',
  },
  'dog-chef': {
    emoji: '👨‍🍳',
    typeLabel: 'Repas frais',
    pillVar: 'var(--pill-rose)',
    recette: 'Sur-mesure',
  },
}
