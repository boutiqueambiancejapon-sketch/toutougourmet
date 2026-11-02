import { parseIngredientText } from './ingredient-text'
import { ANALYTICAL_KEYS, parseExtractedLabel, type AnalyticalKey, type ExtractedLabel } from './types'

// @cdc lot 6 — formulaire de relecture d'une fiche (tableau de bord) : texte ↔ étiquette.
// La composition s'écrit un ingrédient par ligne, « Poulet déshydraté (26 %) » ; le résultat
// repasse par le schéma commun (parseExtractedLabel), comme une lecture d'IA.

const pct = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2, useGrouping: false })

export function ingredientsToText(label: ExtractedLabel): string {
  return label.ingredients.map((i) => (i.pourcentage === null ? i.nom : `${i.nom} (${pct(i.pourcentage)} %)`)).join('\n')
}

export function analyticalValue(label: ExtractedLabel, key: AnalyticalKey): string {
  const v = label.constituants[key]
  return v === null ? '' : pct(v)
}

function numberField(form: FormData, key: string): number | null {
  const raw = String(form.get(key) ?? '').replace(',', '.').replace(/\s|%/g, '')
  if (raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** Étiquette corrigée à partir du formulaire ; la confiance passe à « haute », plus rien n'est douteux. */
export function labelFromForm(existing: ExtractedLabel, form: FormData): ExtractedLabel {
  const parsed = parseIngredientText(String(form.get('ingredients') ?? ''))
  const additifs = [
    ...parsed.additifs,
    ...String(form.get('additifs') ?? '')
      .split(/\n/)
      .map((a) => a.trim())
      .filter(Boolean),
  ]
  return parseExtractedLabel({
    ...existing,
    marque: String(form.get('marque') ?? ''),
    produit: String(form.get('produit') ?? ''),
    ingredients: parsed.ingredients,
    additifs: [...new Set(additifs)],
    constituants: Object.fromEntries(ANALYTICAL_KEYS.map((k) => [k, numberField(form, k)])),
    confiance: { marque: 'haute', produit: 'haute', ean: existing.confiance.ean, ingredients: 'haute', constituants: 'haute', additifs: 'haute' },
    champsDouteux: [],
  })
}
