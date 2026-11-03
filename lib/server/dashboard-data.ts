import { getPool } from '@/lib/server/db'
import { getAi, getSummary, type AiData, type SummaryData } from '@/lib/server/dashboard-queries'
import { EMPTY_GEO, getGeo, type GeoData } from '@/lib/server/dashboard-geo'
import { getRecentMessages, type StoredMessage } from '@/lib/server/contact'
import { getAllArticles } from '@/lib/mdx'
import type { Period } from '@/lib/dashboard/period'

// @cdc tableau de bord — assemble les données de la page. Une base absente ou en panne
// donne des tableaux vides et un message, jamais une page cassée.

const ZERO = { current: 0, previous: 0 }

const EMPTY_SUMMARY: SummaryData = {
  kpis: { pageViews: ZERO, affiliateClicks: ZERO, signups: ZERO, toolResults: ZERO },
  clicksByBrand: [],
  clicksByPlace: [],
  clicksByPage: [],
  signupsByPlace: [],
  guide: [],
  tools: [],
  foodSearches: [],
  foodMisses: [],
}

const EMPTY_AI: AiData = {
  byOperator: [],
  byKind: [],
  timeline: [],
  topPages: [],
  aiReadPaths: [],
  referrals: [],
  landingPages: [],
  errors: [],
}

export interface DashboardData {
  summary: SummaryData
  ai: AiData
  geo: GeoData
  messages: StoredMessage[]
  notice: string | null
  unread: { path: string; title: string }[]
  articleCount: number
}

export async function loadDashboard(period: Period): Promise<DashboardData> {
  const articles = getAllArticles()
    .filter((a) => a.frontmatter.categorySlug)
    .map((a) => ({ path: `/chien/${a.frontmatter.categorySlug}/${a.slug}`, title: a.frontmatter.title }))

  let summary = EMPTY_SUMMARY
  let ai = EMPTY_AI
  let geo = EMPTY_GEO
  let messages: StoredMessage[] = []
  let notice: string | null = null
  const pool = getPool()
  if (!pool) {
    notice = 'Base de données non reliée (DATABASE_URL absente) : les chiffres restent à zéro.'
  } else {
    // Les messages se lisent à part : une panne des statistiques ne les cache pas, et
    // une table absente (db/analytics.sql pas relancé) ne casse pas les statistiques.
    const messagesLoad = getRecentMessages(pool).catch((error: unknown) => {
      console.error('[tableau-de-bord] messages', error)
      return []
    })
    try {
      ;[summary, ai, geo] = await Promise.all([getSummary(pool, period), getAi(pool, period), getGeo(pool, period)])
    } catch (error) {
      console.error('[tableau-de-bord]', error)
      notice = `Lecture de la base impossible : ${error instanceof Error ? error.message : 'erreur inconnue'}.`
    }
    messages = await messagesLoad
  }

  const read = new Set(ai.aiReadPaths.map((p) => p.replace(/\/$/, '')))
  const unread = articles.filter((a) => !read.has(a.path))
  return { summary, ai, geo, messages, notice, unread, articleCount: articles.length }
}
