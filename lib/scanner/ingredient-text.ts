import type { Ingredient } from './types'

// @cdc lot 6 — découpe d'une liste d'ingrédients écrite en texte libre (fiches Open Pet Food
// Facts) vers le même format que la lecture des photos. Fonction pure, testée par
// scripts/test-scanner-score.ts. Les sous-listes entre parenthèses restent dans le nom.

/** Début du bloc des additifs (vitamines, oligo-éléments, conservateurs…). */
const ADDITIVES_START =
  /^(additifs?|additives?|vitamines?\s+[a-e]\d?\b|oligo-?\s?elements?|oligo-?\s?éléments?|conservateurs?|antioxyg[eè]nes?|antioxydants?|liants?|stabilisateurs?|aromatisants?|technologiques?|nutritionnels?|sensoriels?|colorants?)/i

/** Découpe sur les virgules et points-virgules hors parenthèses ; les retours à la ligne séparent aussi. */
export function splitTopLevel(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(' || ch === '[') depth++
    if ((ch === ')' || ch === ']') && depth > 0) depth--
    // « 2,3 % » : virgule décimale entre deux chiffres, pas un séparateur
    const decimal = ch === ',' && /\d/.test(text[i - 1] ?? '') && /\d/.test(text[i + 1] ?? '')
    if ((depth === 0 && !decimal && (ch === ',' || ch === ';')) || ch === '\n' || ch === '\r') {
      parts.push(current)
      current = ''
      continue
    }
    current += ch
  }
  parts.push(current)
  return parts.map((p) => p.replace(/\s+/g, ' ').replace(/^[\s.:*-]+|[\s.:*]+$/g, '').trim()).filter((p) => p.length > 0)
}

const PERCENT = /(\d{1,3}(?:[.,]\d{1,2})?)\s?%/

/** Pourcentage écrit pour l'ingrédient (le premier, ex. « Poulet (26 % dont poulet frais 14 %) » : 26). */
function percentOf(item: string): number | null {
  if (/mg\s*\/\s*kg|ui\b|u\.i\./i.test(item)) return null
  const m = item.match(PERCENT)
  if (!m) return null
  const n = Number(m[1].replace(',', '.'))
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : null
}

/** Nom propre : sans astérisque ni pourcentage isolé, parenthèses vides retirées. */
function cleanName(item: string): string {
  return item
    .replace(/\*/g, '')
    .replace(/\(\s*\d{1,3}(?:[.,]\d{1,2})?\s?%\s*\)/g, '')
    .replace(/\s\d{1,3}(?:[.,]\d{1,2})?\s?%(?=\s|$)/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

export interface ParsedIngredients {
  ingredients: Ingredient[]
  additifs: string[]
}

export function parseIngredientText(text: string): ParsedIngredients {
  const ingredients: Ingredient[] = []
  const additifs: string[] = []
  let inAdditives = false
  const body = text.replace(/^\s*(composition|ingr[ée]dients?)\s*:?\s*/i, '')
  for (const raw of splitTopLevel(body)) {
    if (!inAdditives && ADDITIVES_START.test(raw.normalize('NFC'))) inAdditives = true
    if (inAdditives) {
      const a = raw.replace(/\s+/g, ' ').trim().slice(0, 160)
      // « Vitamine A : », « 24 000 U.I. » : morceaux d'un même additif coupés par la saisie
      if (a.length > 1 && !/^[\d\s.,]+(u\.?i\.?|mg|g|ufc)?\.?$/i.test(a)) additifs.push(a)
      continue
    }
    const nom = cleanName(raw)
    if (nom.length < 2) continue
    ingredients.push({ nom, pourcentage: percentOf(raw) })
  }
  return { ingredients: ingredients.slice(0, 80), additifs: additifs.slice(0, 60) }
}
