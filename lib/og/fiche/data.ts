import { openDataCredit } from '@/components/scanner/SourceNotice'
import type { FoodAnalysis } from '@/db/schema'
import { BAND_SHORT, verdictText } from '@/lib/scanner/highlights'
import { ingredientClass, type IngredientClass } from '@/lib/scanner/ingredient-class'
import { kindOf } from '@/lib/scanner/score'
import { ALTERNATIVE_BELOW, alternativesFor, HOMEMADE_TREATS } from '@/lib/scanner/seo'
import { allowanceText, TREAT_SHARE } from '@/lib/scanner/treat-allowance'
import { qrDataUri } from '../qr'

// @cdc lot 6 — données de la fiche A4 en PDF, tirées des mêmes sources que la page
// /croquettes/[slug]/fiche (critères, composition colorée, matière sèche, alternatives).
// La composition et les explications sont coupées pour tenir sur une seule page.

export const SITE = 'https://www.toutou-gourmet.com'

export interface FicheA4Data {
  name: string
  meta: string
  score: number | null
  band: string | null
  verdict: string
  missing: string | null
  criteria: { id: string; label: string; points: number | null; max: number; explanation: string }[]
  ingredients: { text: string; cls: IngredientClass }[]
  hidden: number
  dryMatter: { label: string; value: string }[]
  dryMatterNote: string
  alternatives: { name: string; reason: string; url: string }[]
  /** Friandise : alertes de sécurité, nombre par jour par gabarit, recettes maison sous 55/100 */
  treat: {
    alerts: { label: string; text: string }[]
    perDay: { label: string; value: string }[]
    perDayNote: string
    homemade: string | null
  } | null
  url: string
  qr: string
  credit: string
}

/** Coupe au dernier mot entier avant `max` caractères, avec des points de suspension. */
export function clipWords(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, '')}…`
}

/**
 * Pastilles qui tiennent dans `budget` (largeur estimée en caractères, marge de pastille comprise).
 * Ce qui dépasse est compté dans `hidden` (affiché « + N autres »).
 */
export function fitPills<T extends { text: string }>(items: T[], budget: number, pad = 4): { shown: T[]; hidden: number } {
  const cost = (t: string) => t.length + pad
  const total = items.reduce((s, i) => s + cost(i.text), 0)
  if (total <= budget) return { shown: items, hidden: 0 }
  const room = budget - cost('+ 99 autres')
  const shown: T[] = []
  let used = 0
  for (const item of items) {
    if (used + cost(item.text) > room) break
    shown.push(item)
    used += cost(item.text)
  }
  return { shown, hidden: items.length - shown.length }
}

const pct = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`
const pctDm = (n: number | null) => (n === null ? 'non calculé' : `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`)

/** Budget de la composition : environ sept lignes de pastilles sur la largeur de la page. */
const COMPOSITION_BUDGET = 860

function treatData(row: FoodAnalysis): FicheA4Data['treat'] {
  const t = row.details.treat
  if (kindOf(row.details) !== 'treat' || !t) return null
  const a = t.allowance
  const share = `${Math.round(TREAT_SHARE * 100)} %`
  return {
    alerts: t.alerts.map((x) => ({ label: `${x.label} (« ${clipWords(x.found, 40)} »)`, text: clipWords(x.text, 150) })),
    perDay: a ? a.rows.map((r) => ({ label: `${r.label} (${r.weightKg} kg)`, value: allowanceText(r) })) : [],
    perDayNote: a
      ? `Au plus ${share} de l'apport calorique du jour (FEDIAF), chien adulte d'activité normale.`
      : `Calories non indiquées sur l'étiquette. Repère FEDIAF : friandises sous ${share} de l'apport calorique du jour.`,
    homemade:
      row.score !== null && row.score < ALTERNATIVE_BELOW
        ? `Recettes maison sans sucre ni sel : ${HOMEMADE_TREATS.map((h) => h.label).join(', ')}, sur toutou-gourmet.com.`
        : null,
  }
}

export function ficheA4Data(row: FoodAnalysis): FicheA4Data {
  const d = row.details
  const label = row.extracted
  const date = row.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
  const items = [
    ...label.ingredients.map((i) => ({ text: clipWords(i.pourcentage !== null ? `${i.nom} (${pct(i.pourcentage)})` : i.nom, 60), cls: ingredientClass(i.nom) })),
    ...label.additifs.map((a) => ({ text: clipWords(a, 60), cls: ingredientClass(a) })).filter((a) => a.cls === 'controverse'),
  ]
  const { shown, hidden } = fitPills(items, COMPOSITION_BUDGET)
  const url = `${SITE}/croquettes/${row.slug}`
  return {
    name: clipWords(row.product ?? row.brand ?? 'Produit sans nom lisible', 90),
    meta: [kindOf(d) === 'treat' ? 'Friandise' : null, row.product ? row.brand : null, row.ean ? `code-barres ${row.ean}` : null, `fiche du ${date}`].filter(Boolean).join(' · '),
    score: d.score,
    band: d.band ? BAND_SHORT[d.band] : null,
    verdict: verdictText(d),
    missing: d.missing.length > 0 ? `Absent de l'étiquette : ${d.missing.join(', ')}. La note porte sur les critères évalués.` : null,
    criteria: d.criteria.map((c) => ({ id: c.id, label: c.label, points: c.points, max: c.max, explanation: clipWords(c.explanation, 170) })),
    ingredients: shown,
    hidden,
    dryMatter: [
      { label: 'Protéines', value: pctDm(d.dryMatter?.proteines ?? null) },
      { label: 'Matières grasses', value: pctDm(d.dryMatter?.matieresGrasses ?? null) },
      { label: 'Glucides estimés', value: pctDm(d.dryMatter?.glucides ?? null) },
    ],
    dryMatterNote: clipWords(d.assumptions[0] ?? "Valeurs de l'étiquette, eau retirée.", 110),
    treat: treatData(row),
    alternatives: alternativesFor(row.brand, d.score, kindOf(d)).map(({ brand, reason }) => ({
      name: brand.name,
      reason: clipWords(reason, 110),
      url: `toutou-gourmet.com/chien/marque/${brand.slug}`,
    })),
    url,
    qr: qrDataUri(url),
    credit:
      openDataCredit(row.source)
        ? `${openDataCredit(row.source)}. Note calculée par le barème publié de Toutou Gourmet : vérifie sur ton sac.`
        : "Lecture automatique de l'étiquette par une IA, vérifie sur ton sac. Note calculée par le barème publié de Toutou Gourmet.",
  }
}
