import { sql } from 'drizzle-orm'
import { check, text, timestamp } from 'drizzle-orm/pg-core'
import { app } from './app'
import { user } from './auth'

// @cdc premium — formule du compte. Une ligne par compte au plus (user_id en clé primaire) ;
// pas de ligne = gratuit. Premium est gratuit pendant le lancement (source `launch-free`) :
// aucun moyen de paiement n'est stocké, rien n'est prélevé. Part avec le compte (ON DELETE CASCADE)
// et figure dans l'export RGPD (lib/server/account-data.ts).

export const PLAN_VALUES = ['free', 'premium'] as const
export type Plan = (typeof PLAN_VALUES)[number]

export const MEMBERSHIP_SOURCES = ['launch-free'] as const

export const membership = app.table(
  'membership',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    plan: text('plan', { enum: PLAN_VALUES }).notNull().default('free'),
    /** D'où vient la formule : `launch-free` = Premium offert pendant le lancement */
    source: text('source', { enum: MEMBERSHIP_SOURCES }).notNull().default('launch-free'),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('membership_plan_values', sql`${t.plan} IN ('free', 'premium')`),
    check('membership_source_values', sql`${t.source} IN ('launch-free')`),
  ],
)

export type Membership = typeof membership.$inferSelect
