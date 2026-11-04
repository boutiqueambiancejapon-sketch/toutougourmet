import { and, eq, inArray, not, or, sql } from 'drizzle-orm'
import { foodAnalysis } from '@/db/schema'
import { getDb } from './drizzle'
import { publishedWhere } from './scanner-published'

// @cdc profil chien — « Ce qu'il mange » : suggestions tirées des fiches /croquettes publiées ou
// importées d'Open Pet Food Facts (jamais écartées, friandises exclues), recherche simple dans la
// base, sans appel externe. Accents ignorés des deux côtés (translate côté SQL, NFD côté JS).

export interface FoodSuggestion {
  slug: string
  name: string
  score: number | null
}

const FROM = 'àáâäãåéèêëíìîïóòôöõúùûüçñÿ'
const TO = 'aaaaaaeeeeiiiiooooouuuucny'
const haystack = sql`translate(lower(coalesce(${foodAnalysis.brand}, '') || ' ' || coalesce(${foodAnalysis.product}, '')), ${FROM}, ${TO})`
const visible = (treats: boolean) =>
  and(
    not(foodAnalysis.discarded),
    or(publishedWhere(), eq(foodAnalysis.source, 'openpetfoodfacts'), eq(foodAnalysis.source, 'maxizoo')),
    treats ? undefined : sql`coalesce(${foodAnalysis.details}->>'kind', '') <> 'treat'`,
  )

const SLUG = /^[a-z0-9-]{1,100}$/

export const foodName = (brand: string | null, product: string | null): string => [brand, product].filter(Boolean).join(', ')

/** Mots de la recherche, sans accents ni caractères spéciaux (5 au plus, 2 lettres au moins). */
export function searchTerms(q: string): string[] {
  return q
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2)
    .slice(0, 5)
}

/** 8 fiches au plus dont la marque et le nom contiennent tous les mots tapés (doublons de nom fusionnés). */
export async function searchFoods(q: string, { treats = false }: { treats?: boolean } = {}): Promise<FoodSuggestion[]> {
  const d = getDb()
  const terms = searchTerms(q)
  if (!d || terms.length === 0) return []
  const rows = await d
    .select({ slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score })
    .from(foodAnalysis)
    .where(and(visible(treats), ...terms.map((t) => sql`${haystack} LIKE ${`%${t}%`}`)))
    .orderBy(sql`${foodAnalysis.score} DESC NULLS LAST`, sql`${foodAnalysis.scanCount} DESC`)
    .limit(40)
  const seen = new Set<string>()
  const out: FoodSuggestion[] = []
  for (const r of rows) {
    const name = foodName(r.brand, r.product)
    const key = name.toLowerCase()
    if (!name || seen.has(key)) continue
    seen.add(key)
    out.push({ slug: r.slug, name, score: r.score })
    if (out.length === 8) break
  }
  return out
}

/** Fiches liées de plusieurs chiens, en une requête (clé : slug). */
export async function getFoodLinks(slugs: (string | null)[]): Promise<Map<string, FoodSuggestion>> {
  const map = new Map<string, FoodSuggestion>()
  const d = getDb()
  const list = [...new Set(slugs.filter((s): s is string => !!s && SLUG.test(s)))]
  if (!d || list.length === 0) return map
  // Lien de confort : une base indisponible n'empêche pas d'afficher le profil.
  const rows = await d
    .select({ slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score })
    .from(foodAnalysis)
    .where(and(inArray(foodAnalysis.slug, list), not(foodAnalysis.discarded)))
    .catch(() => [])
  for (const r of rows) map.set(r.slug, { slug: r.slug, name: foodName(r.brand, r.product), score: r.score })
  return map
}

/** Fiche liée au profil : null si le slug est inconnu ou la fiche écartée. */
export async function getFoodLink(slug: string | null): Promise<FoodSuggestion | null> {
  return slug ? ((await getFoodLinks([slug])).get(slug) ?? null) : null
}
