import { GUIDE_RECIPES, type GuideRecipe } from '@/data/guide-recipes'
import { getGuideFoodFamilies, type GuideFoodFamily } from './foods'

// @cdc guide — plan du livre : une entrée par page A4, numérotée ici. Le sommaire, les pieds de
// page et la page /guide-alimentation (nombre de pages, d'aliments) lisent tous ce plan : un
// numéro ne peut pas être faux dans un endroit et juste dans l'autre.

export interface TocEntry {
  title: string
  page: number
  children?: { title: string; page: number }[]
}

type PageContent =
  | { kind: 'cover' }
  | { kind: 'toc' }
  | { kind: 'ration'; chapter: number }
  | { kind: 'foods-opener'; chapter: number }
  | { kind: 'foods'; chapter: number; families: GuideFoodFamily[] }
  | { kind: 'urgences'; chapter: number }
  | { kind: 'recipes-opener'; chapter: number }
  | { kind: 'recipe'; chapter: number; recipe: GuideRecipe; index: number }
  | { kind: 'end' }

export type BookPage = PageContent & { number: number }

export interface Book {
  pages: BookPage[]
  toc: TocEntry[]
  families: GuideFoodFamily[]
  recipes: GuideRecipe[]
  foodCount: number
}

/** Une petite famille (5 aliments ou moins) partage la page de la précédente. */
const SMALL_FAMILY = 5

function groupFamilies(families: GuideFoodFamily[]): GuideFoodFamily[][] {
  const groups: GuideFoodFamily[][] = []
  for (const f of families) {
    if (f.foods.length === 0) continue
    const last = groups.at(-1)
    if (last && f.foods.length <= SMALL_FAMILY) last.push(f)
    else groups.push([f])
  }
  return groups
}

export function buildBook(): Book {
  const families = getGuideFoodFamilies()
  const contents: PageContent[] = [
    { kind: 'cover' },
    { kind: 'toc' },
    { kind: 'ration', chapter: 1 },
    { kind: 'foods-opener', chapter: 2 },
    ...groupFamilies(families).map((group) => ({ kind: 'foods' as const, chapter: 2, families: group })),
    { kind: 'urgences', chapter: 3 },
    { kind: 'recipes-opener', chapter: 4 },
    ...GUIDE_RECIPES.map((recipe, index) => ({ kind: 'recipe' as const, chapter: 4, recipe, index })),
    { kind: 'end' },
  ]
  const pages: BookPage[] = contents.map((c, i) => ({ ...c, number: i + 1 }))
  const first = (kind: PageContent['kind']) => pages.find((p) => p.kind === kind)?.number ?? 0

  const familyPage = (id: string) => pages.find((p) => p.kind === 'foods' && p.families.some((f) => f.id === id))?.number ?? 0
  const toc: TocEntry[] = [
    { title: 'Combien lui donner', page: first('ration') },
    {
      title: 'Les aliments : autorisé, à limiter, interdit',
      page: first('foods-opener'),
      children: families.filter((f) => f.foods.length > 0).map((f) => ({ title: f.title, page: familyPage(f.id) })),
    },
    { title: 'Il a avalé quelque chose : la page du frigo', page: first('urgences') },
    {
      title: 'Six recettes maison',
      page: first('recipes-opener'),
      children: pages.flatMap((p) => (p.kind === 'recipe' ? [{ title: p.recipe.title, page: p.number }] : [])),
    },
    { title: 'Aller plus loin sur le site', page: first('end') },
  ]
  const foodCount = families.reduce((n, f) => n + f.foods.length, 0)
  return { pages, toc, families, recipes: GUIDE_RECIPES, foodCount }
}

export interface BookSummary {
  pageCount: number
  foodCount: number
  recipeCount: number
}

let summary: BookSummary | null = null

/** Chiffres du livre pour les encarts (calculés une fois par processus). */
export function bookSummary(): BookSummary {
  if (!summary) {
    const book = buildBook()
    summary = { pageCount: book.pages.length, foodCount: book.foodCount, recipeCount: book.recipes.length }
  }
  return summary
}
