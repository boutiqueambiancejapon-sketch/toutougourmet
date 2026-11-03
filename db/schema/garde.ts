import { sql } from 'drizzle-orm'
import { check, date, index, jsonb, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import type { SheetData } from '@/lib/garde/sheet'
import { app } from './app'
import { user } from './auth'
import { dog } from './dogs'

// @cdc fiche de garde — une fiche par absence et par chien. Le jeton (144 bits aléatoires,
// base64url) est la seule clé de la page publique /garde/[jeton] : impossible à deviner, inutile
// après expires_at. Rien sur le gardien n'est stocké. Part avec le chien ou le compte (cascade)
// et figure dans l'export RGPD (lib/server/account-data.ts).

export const sitterSheet = app.table(
  'sitter_sheet',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    dogId: uuid('dog_id')
      .notNull()
      .references(() => dog.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    startsOn: date('starts_on', { mode: 'string' }).notNull(),
    endsOn: date('ends_on', { mode: 'string' }).notNull(),
    /** Contenu de la fiche (lib/garde/sheet.ts › SheetData), validé avant écriture */
    data: jsonb('data').$type<SheetData>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex('sitter_sheet_token_idx').on(t.token),
    index('sitter_sheet_dog_idx').on(t.dogId),
    index('sitter_sheet_user_idx').on(t.userId),
    check('sitter_sheet_dates', sql`${t.endsOn} >= ${t.startsOn}`),
    check('sitter_sheet_token_length', sql`length(${t.token}) >= 22`),
  ],
)

export type SitterSheet = typeof sitterSheet.$inferSelect
