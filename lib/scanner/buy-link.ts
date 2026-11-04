import { isTherapeutic } from './fiche-lists'
import { partnerBrand } from './seo'

// @cdc lot 6 — où acheter le produit d'une fiche notée au moins 55. Marque partenaire : son lien.
// Marque présente chez Maxi Zoo (vérifié le 2026-11-04) : sa page de marque, lien Awin. Sinon :
// recherche Amazon. Aucune carte sous 55, ni pour un aliment thérapeutique, qui se choisit avec le vétérinaire.

export const BUY_MIN_SCORE = 55

const UPD_URL = 'https://www.ultrapremiumdirect.com/?utm_source=affilae&utm_medium=banniere_affiliation&utm_campaign=Toutou%20Gourmet&ae=1346'
const AMAZON_TAG = 'toutougourmet-21'
const MAXI_ZOO_BRANDS = ['royal canin', 'edgard cooper', 'edgard & cooper', 'pedigree', 'carnilove', 'vitakraft', 'eukanuba']

export interface BuyLink {
  store: string
  href: string
  /** Mention exigée par le programme Partenaires d'Amazon. */
  amazon: boolean
}

const maxiZooUrl = (brand: string) =>
  `https://www.awin1.com/cread.php?awinmid=68698&awinaffid=1112904&ued=${encodeURIComponent(`https://www.maxizoo.fr/search/?text=${encodeURIComponent(brand)}`)}`

export function buyLink(f: { brand: string | null; product: string | null; score: number | null }): BuyLink | null {
  if (f.score === null || f.score < BUY_MIN_SCORE || !f.brand || isTherapeutic(f)) return null
  const partner = partnerBrand(f.brand)
  if (partner?.slug === 'ultra-premium-direct') return { store: partner.name, href: UPD_URL, amazon: false }
  if (partner && !partner.stockNote) return { store: partner.name, href: partner.affiliateUrl, amazon: false }
  if (partner) return null
  if (MAXI_ZOO_BRANDS.includes(f.brand.trim().toLowerCase())) return { store: 'Maxi Zoo', href: maxiZooUrl(f.brand.trim()), amazon: false }
  const query = `${f.brand} ${f.product ?? ''} chien`.replace(/\s+/g, ' ').trim()
  return { store: 'Amazon', href: `https://www.amazon.fr/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`, amazon: true }
}
