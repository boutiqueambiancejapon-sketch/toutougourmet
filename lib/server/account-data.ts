import { asc, eq, inArray } from 'drizzle-orm'
import { foodAnalysis, scanHistory, scanReport, session, sitterSheet, user, weightLog } from '@/db/schema'
import type { SheetData } from '@/lib/garde/sheet'
import { listDogs } from './dogs'
import { getDb } from './drizzle'
import { getMembership } from './membership'

// @cdc lot 4 — RGPD : export des données d'un compte (portabilité) et garde-fou de la suppression.
// Inclut l'historique du scanner (scan_history, scan_report), la formule (membership) et les fiches de garde (sitter_sheet). L'export ne contient jamais le mot de passe haché (app.account) ni les jetons de session.

export interface AccountExport {
  format: 'toutou-gourmet-compte'
  version: 1
  exportedAt: string
  profile: { id: string; name: string; email: string; emailVerified: boolean; createdAt: string; updatedAt: string }
  sessions: { createdAt: string; expiresAt: string; ipAddress: string | null; userAgent: string | null }[]
  dogs: {
    id: string
    name: string
    breedSlug: string | null
    birthDate: string | null
    birthDateEstimated: boolean
    weightKg: number | null
    activity: string
    sterilized: boolean
    /** Ce qu'il mange (texte) et la fiche /croquettes liée, null si aucune */
    food: string | null
    foodSlug: string | null
    allergies: string[]
    createdAt: string
    updatedAt: string
    weights: { date: string; weightKg: number; createdAt: string }[]
  }[]
  /** Scanner d'étiquette (lot 6) : analyses lancées et signalements d'erreur */
  scans: { date: string; fromCache: boolean; product: { slug: string; brand: string | null; product: string | null; ean: string | null; score: number | null } }[]
  scanReports: { date: string; productSlug: string; message: string }[]
  /** Formule du compte (Premium du lancement ou abonnement Stripe) ; null : jamais activée */
  membership: {
    plan: string
    source: string
    activatedAt: string | null
    createdAt: string
    subscription: { status: string | null; interval: string | null; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; withdrawalWaiverAt: string | null } | null
  } | null
  /** Fiches de garde : contenu, dates et lien privé (le jeton fait partie des données du compte) */
  sitterSheets: { dogId: string; startsOn: string; endsOn: string; createdAt: string; expiresAt: string; link: string; content: SheetData }[]
}

export async function exportAccountData(userId: string): Promise<AccountExport | null> {
  const db = getDb()
  if (!db) return null
  const [profile] = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (!profile) return null
  const sessions = await db
    .select({ createdAt: session.createdAt, expiresAt: session.expiresAt, ipAddress: session.ipAddress, userAgent: session.userAgent })
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(asc(session.createdAt))
  // listDogs : mêmes colonnes avant et après la migration 0008 (croquettes et allergies vides avant).
  const dogs = await listDogs(userId)
  const weights = dogs.length
    ? await db
        .select()
        .from(weightLog)
        .where(
          inArray(
            weightLog.dogId,
            dogs.map((d) => d.id),
          ),
        )
        .orderBy(asc(weightLog.date), asc(weightLog.createdAt))
    : []
  const scans = await db
    .select({ at: scanHistory.createdAt, fromCache: scanHistory.fromCache, slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, ean: foodAnalysis.ean, score: foodAnalysis.score })
    .from(scanHistory)
    .innerJoin(foodAnalysis, eq(foodAnalysis.id, scanHistory.foodAnalysisId))
    .where(eq(scanHistory.userId, userId))
    .orderBy(asc(scanHistory.createdAt))
  const reports = await db
    .select({ at: scanReport.createdAt, slug: foodAnalysis.slug, message: scanReport.message })
    .from(scanReport)
    .innerJoin(foodAnalysis, eq(foodAnalysis.id, scanReport.foodAnalysisId))
    .where(eq(scanReport.userId, userId))
    .orderBy(asc(scanReport.createdAt))
  const plan = await getMembership(userId)
  const sheets = await db.select().from(sitterSheet).where(eq(sitterSheet.userId, userId)).orderBy(asc(sitterSheet.createdAt))
  return {
    format: 'toutou-gourmet-compte',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      emailVerified: profile.emailVerified,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
    sessions: sessions.map((s) => ({ ...s, createdAt: s.createdAt.toISOString(), expiresAt: s.expiresAt.toISOString() })),
    dogs: dogs.map((d) => ({
      id: d.id,
      name: d.name,
      breedSlug: d.breedSlug,
      birthDate: d.birthDate,
      birthDateEstimated: d.birthDateEstimated,
      weightKg: d.weightKg,
      activity: d.activity,
      sterilized: d.sterilized,
      food: d.food,
      foodSlug: d.foodSlug,
      allergies: d.allergies,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      weights: weights.filter((w) => w.dogId === d.id).map((w) => ({ date: w.date, weightKg: w.weightKg, createdAt: w.createdAt.toISOString() })),
    })),
    scans: scans.map((s) => ({
      date: s.at.toISOString(),
      fromCache: s.fromCache,
      product: { slug: s.slug, brand: s.brand, product: s.product, ean: s.ean, score: s.score },
    })),
    scanReports: reports.map((r) => ({ date: r.at.toISOString(), productSlug: r.slug, message: r.message })),
    membership: plan
      ? {
          plan: plan.plan,
          source: plan.source,
          activatedAt: plan.activatedAt?.toISOString() ?? null,
          createdAt: plan.createdAt.toISOString(),
          subscription: plan.stripeCustomerId
            ? {
                status: plan.status,
                interval: plan.billingInterval,
                currentPeriodEnd: plan.currentPeriodEnd?.toISOString() ?? null,
                cancelAtPeriodEnd: plan.cancelAtPeriodEnd,
                withdrawalWaiverAt: plan.withdrawalWaiverAt?.toISOString() ?? null,
              }
            : null,
        }
      : null,
    sitterSheets: sheets.map((s) => ({
      dogId: s.dogId,
      startsOn: s.startsOn,
      endsOn: s.endsOn,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      link: `https://www.toutou-gourmet.com/garde/${s.token}`,
      content: s.data,
    })),
  }
}

// La limite de Better Auth ne couvre que ses routes HTTP : la suppression passe par une action
// serveur, d'où ce compteur en mémoire (5 essais de mot de passe par compte et par 5 minutes).
const DELETE_WINDOW_MS = 5 * 60 * 1000
const DELETE_MAX = 5
const deleteAttempts = new Map<string, number[]>()

export function deleteAttemptsExceeded(userId: string): boolean {
  const now = Date.now()
  const recent = (deleteAttempts.get(userId) ?? []).filter((t) => now - t < DELETE_WINDOW_MS)
  recent.push(now)
  deleteAttempts.set(userId, recent)
  return recent.length > DELETE_MAX
}
