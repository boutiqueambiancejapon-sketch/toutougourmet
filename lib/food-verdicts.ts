import { getAllArticles } from '@/lib/mdx'

// @cdc seo-geo §6.4 — aliments classés par verdict, tirés des articles « peut-manger »
// (champs ogTitle + verdict). Sert à la section « Que peut manger un [race] ? » des pages race :
// la page race renvoie vers les pages génériques au lieu de dupliquer leur contenu.

export interface FoodVerdict {
  label: string
  href: string
  verdict: 'oui' | 'moderation' | 'danger'
}

const URGENCY = /^Ton chien a \S+ (?:du |de la |de l'|des |un |une |d')(.+?)\s*\?$/

/**
 * Nom de l'aliment tiré du titre de miniature, ou null si le titre n'en nomme pas un seul :
 * « Poire : ton chien peut en manger ? » → « Poire » ;
 * « Ton chien a mangé du raisin ? » → « Raisin ».
 */
function foodLabel(ogTitle: string): string | null {
  const urgency = URGENCY.exec(ogTitle)
  const raw = urgency ? urgency[1] : ogTitle.includes(':') ? ogTitle.split(/\s*:\s*/)[0] : null
  if (!raw) return null
  const label = raw.trim().replace(/ ou (?:du |de la |de l'|des )/, ' ou ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function getFoodVerdicts(): FoodVerdict[] {
  const seen = new Set<string>()
  const foods: FoodVerdict[] = []
  for (const a of getAllArticles()) {
    const { verdict, ogTitle, categorySlug } = a.frontmatter
    if (!verdict || !ogTitle || !categorySlug) continue
    if (!a.slug.includes('peut-manger') && categorySlug !== 'urgences') continue
    const label = foodLabel(ogTitle)
    if (!label || seen.has(label.toLowerCase())) continue
    seen.add(label.toLowerCase())
    foods.push({ label, href: `/chien/${categorySlug}/${a.slug}`, verdict })
  }
  return foods.sort((x, y) => x.label.localeCompare(y.label, 'fr'))
}
