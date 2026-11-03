import type { Pool } from 'pg'
import type { Period } from '@/lib/dashboard/period'
import { isPageType, pageTypeOf, PAGE_TYPES, type PageType } from '@/lib/page-type'

// @cdc tableau de bord — « Conversions par type de page » (carte des conversions, 2026-11-03).
// Pages vues : événements Pageview, type déduit du chemin. Objectifs :
// - e-mail : Newsletter Signup (et Guide Signup quand le guide sera en ligne) ;
// - compte : Account Created, rattaché au type de page par son emplacement d'origine (le serveur
//   ne connaît que lui) ; bouton du haut et inscriptions directes restent « non attribués » ;
// - clic partenaire : Affiliate Click.
// Le type vient de props.pageType (envoyé par lib/analytics.ts depuis le 2026-11-03), sinon du
// chemin de l'événement : les événements plus anciens sont classés aussi.

export type Goal = 'email' | 'compte' | 'clic'

export const GOALS: Goal[] = ['email', 'compte', 'clic']

/** Objectif principal de la carte, null quand il n'est pas l'un des trois (urgences, accueil). */
export const MAIN_GOAL: Record<PageType, Goal | null> = {
  aliments: 'email',
  urgences: null,
  sante: 'compte',
  'nutrition-marques': 'clic',
  races: 'compte',
  recettes: 'email',
  outils: 'compte',
  quiz: 'clic',
  scanner: 'compte',
  accueil: null,
  compte: 'clic',
  autre: null,
}

/** Emplacement d'une invitation compte (lib/signup-places.ts) → type de page. */
const PLACE_TYPE: Record<string, PageType> = {
  'tool-ration': 'outils',
  'tool-poids': 'outils',
  'tool-bilan': 'outils',
  'tool-age': 'outils',
  'tool-scanner': 'scanner',
  'article-poids': 'sante',
  'article-croquettes': 'nutrition-marques',
  'article-aliments': 'aliments',
}

export interface ConversionRow {
  type: PageType
  views: number
  goals: Record<Goal, number>
}

export interface ConversionsData {
  rows: ConversionRow[]
  /** Comptes créés sans type connu (bouton du haut, lien direct) */
  unattributedAccounts: number
}

export const EMPTY_CONVERSIONS: ConversionsData = { rows: [], unattributedAccounts: 0 }

const GOAL_OF: Record<string, Goal> = {
  'Newsletter Signup': 'email',
  'Guide Signup': 'email',
  'Account Created': 'compte',
  'Affiliate Click': 'clic',
}

interface RawRow {
  name: string
  page: string
  page_type: string | null
  place: string | null
  n: number
}

export async function getConversions(pool: Pool, period: Period): Promise<ConversionsData> {
  const res = await pool.query<RawRow>(
    `SELECT name, page, props->>'pageType' AS page_type, props->>'place' AS place, count(*)::int AS n
     FROM analytics.events
     WHERE ts >= now() - $1::interval AND name = ANY($2)
     GROUP BY 1, 2, 3, 4`,
    [period.interval, ['Pageview', ...Object.keys(GOAL_OF)]],
  )
  const byType = new Map<PageType, ConversionRow>(
    PAGE_TYPES.map((type) => [type, { type, views: 0, goals: { email: 0, compte: 0, clic: 0 } }]),
  )
  let unattributedAccounts = 0
  for (const row of res.rows) {
    if (row.name === 'Account Created') {
      const type = row.place ? PLACE_TYPE[row.place] : undefined
      if (type) byType.get(type)!.goals.compte += row.n
      else unattributedAccounts += row.n
      continue
    }
    const type = isPageType(row.page_type) ? row.page_type : pageTypeOf(row.page)
    const target = byType.get(type)!
    if (row.name === 'Pageview') target.views += row.n
    else target.goals[GOAL_OF[row.name]] += row.n
  }
  const rows = [...byType.values()]
    .filter((r) => r.views > 0 || GOALS.some((g) => r.goals[g] > 0))
    .sort((a, b) => b.views - a.views)
  return { rows, unattributedAccounts }
}
