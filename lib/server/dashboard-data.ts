import { getPool } from '@/lib/server/db'
import { getAi, getSummary, type AiData, type SummaryData } from '@/lib/server/dashboard-queries'
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
  let notice: string | null = null
  const pool = getPool()
  if (!pool) {
    notice = 'Base de données non reliée (DATABASE_URL absente) : les chiffres restent à zéro.'
  } else {
    try {
      ;[summary, ai] = await Promise.all([getSummary(pool, period), getAi(pool, period)])
    } catch (error) {
      console.error('[tableau-de-bord]', error)
      notice = `Lecture de la base impossible : ${error instanceof Error ? error.message : 'erreur inconnue'}.`
    }
  }

  const read = new Set(ai.aiReadPaths.map((p) => p.replace(/\/$/, '')))
  const unread = articles.filter((a) => !read.has(a.path))
  return { summary, ai, notice, unread, articleCount: articles.length }
}
