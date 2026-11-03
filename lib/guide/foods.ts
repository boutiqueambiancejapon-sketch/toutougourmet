import { getAllArticles } from '@/lib/mdx'
import { foodLabel } from '@/lib/food-verdicts'
import { EXCLUDED, FOOD_FAMILY, GUIDE_FAMILIES, LABEL_OVERRIDES, NOTE_FROM_TLDR, type GuideFamily } from '@/data/guide-foods'

// @cdc guide — aliments du livre, lus dans le frontmatter des articles à chaque génération :
// corriger un verdict dans un article corrige le livre au prochain `npm run guide:pdf`.

export type Verdict = 'oui' | 'moderation' | 'danger'

export interface GuideFood {
  label: string
  /** verdictNote de l'article (sans « mais » initial), ou phrase du TL;DR, ou rien */
  note: string | null
  verdict: Verdict
  path: string
}

export interface GuideFoodFamily {
  id: GuideFamily
  title: string
  intro?: string
  image?: string
  foods: GuideFood[]
}

export const VERDICT_ORDER: Verdict[] = ['oui', 'moderation', 'danger']

function cleanNote(note: string | undefined): string | null {
  // Typographie française : espace insécable avant « : ; ? ! ».
  const text = note?.trim().replace(/^mais\s+/i, '').replace(/ ([:;?!])/g, '\u00a0$1')
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : null
}

export function getGuideFoodFamilies(): GuideFoodFamily[] {
  const byFamily = new Map<GuideFamily, GuideFood[]>()
  for (const a of getAllArticles()) {
    const { verdict, verdictNote, ogTitle, categorySlug } = a.frontmatter
    if (!verdict || !categorySlug || EXCLUDED.has(a.slug)) continue
    const family = FOOD_FAMILY[a.slug]
    if (!family) {
      // Nouvel article à verdict : il faut le classer dans data/guide-foods.ts.
      console.warn(`[guide] aliment non classé : ${a.slug}`)
      continue
    }
    const label = LABEL_OVERRIDES[a.slug] ?? (ogTitle ? foodLabel(ogTitle) : null)
    if (!label) continue
    const note = NOTE_FROM_TLDR[a.slug] ?? cleanNote(verdictNote)
    const list = byFamily.get(family) ?? []
    list.push({ label, note, verdict, path: `/chien/${categorySlug}/${a.slug}` })
    byFamily.set(family, list)
  }
  return GUIDE_FAMILIES.map((f) => ({
    ...f,
    foods: (byFamily.get(f.id) ?? []).sort((x, y) => x.label.localeCompare(y.label, 'fr')),
  }))
}
