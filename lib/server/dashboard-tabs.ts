import type { Period } from '@/lib/dashboard/period'
import { getAllArticles } from '@/lib/mdx'
import { getRecentMessages, type StoredMessage } from './contact'
import { EMPTY_CONVERSIONS, getConversions, type ConversionsData } from './dashboard-conversions'
import { EMPTY_GEO, getGeo, type GeoData } from './dashboard-geo'
import { getAi, getAudience, getPartners, EMPTY_AUDIENCE, EMPTY_PARTNERS, type AiData, type AudienceData, type PartnerData } from './dashboard-queries'
import { safeRead } from './dashboard-safe'
import { EMPTY_SIGNUPS, getSignups, type SignupsData } from './dashboard-signups'
import { getDb } from './drizzle'
import { getOpffImportStatus, type OpffImportStatusData } from './opff-store'
import { listToReview, type ReviewRow } from './scanner-review'
import { opffIndexPolicy, type OpffIndexPolicy } from './scanner-published'

// @cdc tableau de bord — une fonction de lecture par onglet : chaque onglet ne lance que ses
// propres requêtes, l'accueil reste léger. Chaque bloc se lit à part (dashboard-safe).

/** ok est faux quand au moins une lecture a échoué ou que la base n'est pas reliée. */
export interface Loaded<T> {
  data: T
  ok: boolean
}

export interface VisitorsData {
  audience: AudienceData
  geo: GeoData
}

export async function loadVisitors(period: Period): Promise<Loaded<VisitorsData>> {
  const [audience, geo] = await Promise.all([
    safeRead('visiteurs', EMPTY_AUDIENCE, (pool) => getAudience(pool, period)),
    safeRead('pays', EMPTY_GEO, (pool) => getGeo(pool, period)),
  ])
  return { data: { audience: audience.value, geo: geo.value }, ok: audience.ok && geo.ok }
}

export interface ConversionsTabData {
  conversions: ConversionsData
  partners: PartnerData
  signups: SignupsData
}

export async function loadConversionsTab(period: Period): Promise<Loaded<ConversionsTabData>> {
  const [conversions, partners, signups] = await Promise.all([
    safeRead('conversions', EMPTY_CONVERSIONS, (pool) => getConversions(pool, period)),
    safeRead('partenaires', EMPTY_PARTNERS, (pool) => getPartners(pool, period)),
    safeRead('inscriptions', EMPTY_SIGNUPS, (pool) => getSignups(pool, period)),
  ])
  return {
    data: { conversions: conversions.value, partners: partners.value, signups: signups.value },
    ok: conversions.ok && partners.ok && signups.ok,
  }
}

const EMPTY_AI: AiData = { byOperator: [], byKind: [], timeline: [], topPages: [], aiReadPaths: [], referrals: [], landingPages: [], errors: [] }

export interface RobotsData {
  ai: AiData
  unread: { path: string; title: string }[]
  articleCount: number
}

export async function loadRobots(period: Period): Promise<Loaded<RobotsData>> {
  const articles = getAllArticles()
    .filter((a) => a.frontmatter.categorySlug)
    .map((a) => ({ path: `/chien/${a.frontmatter.categorySlug}/${a.slug}`, title: a.frontmatter.title }))
  const ai = await safeRead('robots IA', EMPTY_AI, (pool) => getAi(pool, period))
  const read = new Set(ai.value.aiReadPaths.map((p) => p.replace(/\/$/, '')))
  // Sans lecture de la base, on ignore quels articles ont été lus : liste vide plutôt que fausse.
  const unread = ai.ok ? articles.filter((a) => !read.has(a.path)) : []
  return { data: { ai: ai.value, unread, articleCount: articles.length }, ok: ai.ok }
}

export interface ContentData {
  messages: StoredMessage[]
  review: ReviewRow[]
  reviewError: boolean
  opff: OpffImportStatusData | null
  opffPolicy: OpffIndexPolicy
}

async function loadOpff(): Promise<OpffImportStatusData | null> {
  return getOpffImportStatus().catch((err: unknown) => {
    console.error('[tableau-de-bord] import Open Pet Food Facts', err instanceof Error ? err.message : err)
    return null
  })
}

async function loadReview(): Promise<{ rows: ReviewRow[]; error: boolean }> {
  if (!getDb()) return { rows: [], error: true }
  return listToReview()
    .then((rows) => ({ rows, error: false }))
    .catch((err: unknown) => {
      console.error('[tableau-de-bord] fiches à relire', err instanceof Error ? err.message : err)
      return { rows: [], error: true }
    })
}

export async function loadContent(): Promise<Loaded<ContentData>> {
  const [messages, review, opff] = await Promise.all([safeRead('messages', [] as StoredMessage[], (pool) => getRecentMessages(pool)), loadReview(), loadOpff()])
  return { data: { messages: messages.value, review: review.rows, reviewError: review.error, opff, opffPolicy: opffIndexPolicy() }, ok: messages.ok }
}
