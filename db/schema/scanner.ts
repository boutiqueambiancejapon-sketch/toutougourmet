import { sql } from 'drizzle-orm'
import { boolean, check, index, integer, jsonb, primaryKey, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { ExtractedLabel } from '@/lib/scanner/types'
import type { ScoreResult } from '@/lib/scanner/score'
import { app } from './app'
import { user } from './auth'

// @cdc lot 6 — scanner d'étiquette. food_analysis sert de cache (un EAN = une analyse, Gemini
// n'est pas rappelé) et alimente /croquettes/[slug]. Aucune photo n'est stockée, nulle part.
// scan_history relie un compte à ses analyses ; scan_usage compte les appels au fournisseur
// d'IA par mois (quota). Tout ce qui touche un compte part avec lui (ON DELETE CASCADE).

/**
 * photo : étiquette lue par l'IA · openpetfoodfacts : données de la base ouverte, sans IA ·
 * openfoodfacts : produit pour animaux rangé dans Open Food Facts (dernier recours du code-barres)
 */
export type AnalysisSource = 'photo' | 'openpetfoodfacts' | 'openfoodfacts'

const ts = (name: string) => timestamp(name, { withTimezone: true })

export const foodAnalysis = app.table(
  'food_analysis',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ean: text('ean').unique(),
    slug: text('slug').notNull().unique(),
    brand: text('brand'),
    product: text('product'),
    extracted: jsonb('extracted').$type<ExtractedLabel>().notNull(),
    score: smallint('score'),
    details: jsonb('details').$type<ScoreResult>().notNull(),
    algorithmVersion: text('algorithm_version').notNull(),
    /** Fournisseur et modèle qui ont lu l'étiquette (ex. gemini:gemini-2.5-flash-lite) */
    model: text('model').notNull(),
    /** Provenance des données : photo lue par l'IA, fiche Open Pet Food Facts ou Open Food Facts (licence ODbL) */
    source: text('source').$type<AnalysisSource>().notNull().default('photo'),
    scanCount: integer('scan_count').notNull().default(1),
    /** Relue par la rédaction : seule une fiche relue est indexée et listée dans le sitemap */
    reviewed: boolean('reviewed').notNull().default(false),
    /**
     * Écartée à la relecture (fiche importée d'Open Pet Food Facts surtout) : reste servie au
     * scanner, jamais indexée, et un ré-import ne la republie pas. Une validation l'efface.
     */
    discarded: boolean('discarded').notNull().default(false),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check('food_analysis_score_range', sql`${t.score} IS NULL OR (${t.score} >= 0 AND ${t.score} <= 100)`),
    check('food_analysis_ean_format', sql`${t.ean} IS NULL OR ${t.ean} ~ '^([0-9]{8}|[0-9]{13})$'`),
    check('food_analysis_source', sql`${t.source} IN ('photo', 'openpetfoodfacts', 'openfoodfacts')`),
  ],
)

export const scanHistory = app.table(
  'scan_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    foodAnalysisId: uuid('food_analysis_id')
      .notNull()
      .references(() => foodAnalysis.id, { onDelete: 'cascade' }),
    /** true : analyse resservie depuis le cache, sans appel au fournisseur d'IA */
    fromCache: boolean('from_cache').notNull().default(false),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('scan_history_user_idx').on(t.userId, t.createdAt), index('scan_history_created_idx').on(t.createdAt)],
)

export const scanUsage = app.table(
  'scan_usage',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Mois au format AAAA-MM (UTC) */
    month: text('month').notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.month] }), check('scan_usage_month_format', sql`${t.month} ~ '^[0-9]{4}-[0-9]{2}$'`)],
)

/** Signalements d'erreur de lecture (AI Act : l'utilisateur peut contester une lecture IA). */
export const scanReport = app.table(
  'scan_report',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    foodAnalysisId: uuid('food_analysis_id')
      .notNull()
      .references(() => foodAnalysis.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    createdAt: ts('created_at').notNull().defaultNow(),
    /** Traité dans le tableau de bord (fiche corrigée ou signalement écarté) ; null : à traiter */
    handledAt: ts('handled_at'),
  },
  (t) => [index('scan_report_analysis_idx').on(t.foodAnalysisId)],
)

export type FoodAnalysis = typeof foodAnalysis.$inferSelect
