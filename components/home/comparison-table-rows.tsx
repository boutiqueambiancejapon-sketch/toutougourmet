import type { ComparisonRow } from './comparison-table-config'
import { BRAND_DISPLAY } from './comparison-table-config'

export const ROWS: ComparisonRow[] = [
  {
    key: 'type',
    label: 'Type',
    render: (b) => BRAND_DISPLAY[b.slug]?.typeLabel ?? '—',
  },
  {
    key: 'score',
    label: 'Note /5',
    render: (b) => (
      <span
        className="text-[var(--accent-1)] font-bold"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {b.scores.global}/5
      </span>
    ),
  },
  {
    key: 'price',
    label: 'Prix',
    render: (b) => (
      <span
        className="font-bold"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {b.priceRange}
      </span>
    ),
  },
  {
    key: 'digest',
    label: 'Digestibilité',
    render: (b) => (b.scores.digestibilite >= 4.6 ? 'Excellente' : 'Très bonne'),
  },
  {
    key: 'origin',
    label: 'Origine',
    render: (b) => (b.slug === 'dog-chef' ? 'Belgique' : 'France'),
  },
  {
    key: 'recette',
    label: 'Spécificité recette',
    render: (b) => BRAND_DISPLAY[b.slug]?.recette ?? '—',
  },
  {
    key: 'essai',
    label: "Offre d'essai",
    render: (b) => (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
        Oui · {b.discountOffer.split(' via ')[0]}
      </span>
    ),
  },
]
