import { pgSchema } from 'drizzle-orm/pg-core'

// @cdc lot 4 — schéma Postgres des comptes. `analytics` reste à part (db/analytics.sql).
export const app = pgSchema('app')
