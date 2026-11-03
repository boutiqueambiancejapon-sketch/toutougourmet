import { sql } from 'drizzle-orm'
import { boolean, check, index, jsonb, serial, smallint, text, timestamp } from 'drizzle-orm/pg-core'
import type { OpffFoodKind, OpffSkipReason } from '@/lib/scanner/opff-import'
import { app } from './app'

// @cdc lot 6 — copie locale d'Open Pet Food Facts (base sous licence ODbL : base dérivée,
// voir DECISIONS.md), rafraîchie chaque semaine par scripts/opff-import.ts. Aliments pour chien
// seulement, réduits aux champs utiles au barème. Sert au scan par code-barres (avant l'API) et
// aux fiches pré-notées. Aucune donnée de compte ni de visiteur.

const ts = (name: string) => timestamp(name, { withTimezone: true })

export const opffProduct = app.table(
  'opff_product',
  {
    /** Code-barres normalisé (EAN-8 ou EAN-13 valide, comme food_analysis.ean) */
    ean: text('ean').primaryKey(),
    name: text('name'),
    nameFr: text('name_fr'),
    brand: text('brand'),
    ingredientsText: text('ingredients_text'),
    ingredientsTextFr: text('ingredients_text_fr'),
    nutriments: jsonb('nutriments').$type<Record<string, number | string>>().notNull(),
    categories: jsonb('categories').$type<string[]>().notNull(),
    additives: jsonb('additives').$type<string[]>().notNull(),
    countries: jsonb('countries').$type<string[]>().notNull(),
    /** Image de face sur le serveur d'Open Pet Food Facts (jamais copiée chez nous) */
    imageUrl: text('image_url'),
    lang: text('lang'),
    /** Aliment complet ou friandise (seuls les aliments complets sont notés pour l'instant) */
    kind: text('kind').$type<OpffFoodKind>().notNull(),
    /** Notre barème peut noter la fiche avec les mêmes règles qu'un scan */
    scorable: boolean('scorable').notNull().default(false),
    score: smallint('score'),
    /** Remplit la règle d'indexation proposée (OPFF_INDEX_POLICY=complete) */
    indexable: boolean('indexable').notNull().default(false),
    /** Pourquoi la fiche n'est pas notée (null si notée) */
    skipReason: text('skip_reason').$type<OpffSkipReason>(),
    /** Date de modification dans Open Pet Food Facts */
    lastModified: ts('last_modified'),
    /** Empreinte des champs gardés : seule une fiche qui change est retraitée */
    contentHash: text('content_hash').notNull(),
    importedAt: ts('imported_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [
    check('opff_product_ean_format', sql`${t.ean} ~ '^([0-9]{8}|[0-9]{13})$'`),
    check('opff_product_kind', sql`${t.kind} IN ('complete', 'treat')`),
    index('opff_product_indexable_idx').on(t.indexable),
  ],
)

export type OpffImportStatus = 'running' | 'ok' | 'error'

/** Un passage de l'import (alertes et tableau de bord). Les essais --dry ne sont pas enregistrés. */
export const opffImportRun = app.table(
  'opff_import_run',
  {
    id: serial('id').primaryKey(),
    startedAt: ts('started_at').notNull().defaultNow(),
    finishedAt: ts('finished_at'),
    status: text('status').$type<OpffImportStatus>().notNull().default('running'),
    /** Compteurs du passage (lus, chien, nouveaux, modifiés, notés, ignorés par raison…) */
    counters: jsonb('counters').$type<Record<string, number>>().notNull().default({}),
    /** Date de l'export (en-tête Last-Modified) */
    dumpModified: ts('dump_modified'),
    error: text('error'),
  },
  (t) => [check('opff_import_run_status', sql`${t.status} IN ('running', 'ok', 'error')`), index('opff_import_run_started_idx').on(t.startedAt)],
)

export type OpffProductRow = typeof opffProduct.$inferSelect
export type OpffImportRun = typeof opffImportRun.$inferSelect
