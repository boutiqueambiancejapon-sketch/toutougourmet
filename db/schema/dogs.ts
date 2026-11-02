import { sql } from 'drizzle-orm'
import { boolean, check, date, index, numeric, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { app } from './app'
import { user } from './auth'

// @cdc lot 4 — profil chien et suivi du poids. breed_slug reprend Breed.slug de data/breeds.ts
// (vérifié à l'écriture, pas de clé étrangère : la liste des races vit dans le code).
// activity reprend ActivityLevel de lib/calculators.ts pour pré-remplir les outils tels quels.

export const ACTIVITY_VALUES = ['sedentaire', 'normal', 'actif', 'tres-actif'] as const

export const dog = app.table(
  'dog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    breedSlug: text('breed_slug'),
    /** Date de naissance, ou date estimée quand le maître n'a donné qu'un âge */
    birthDate: date('birth_date', { mode: 'string' }),
    birthDateEstimated: boolean('birth_date_estimated').notNull().default(false),
    weightKg: numeric('weight_kg', { precision: 5, scale: 2, mode: 'number' }),
    activity: text('activity', { enum: ACTIVITY_VALUES }).notNull().default('normal'),
    sterilized: boolean('sterilized').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('dog_user_id_idx').on(t.userId),
    check('dog_weight_range', sql`${t.weightKg} IS NULL OR (${t.weightKg} > 0 AND ${t.weightKg} <= 120)`),
    check('dog_activity_values', sql`${t.activity} IN ('sedentaire', 'normal', 'actif', 'tres-actif')`),
  ],
)

export const weightLog = app.table(
  'weight_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dogId: uuid('dog_id')
      .notNull()
      .references(() => dog.id, { onDelete: 'cascade' }),
    date: date('date', { mode: 'string' }).notNull(),
    weightKg: numeric('weight_kg', { precision: 5, scale: 2, mode: 'number' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('weight_log_dog_date_idx').on(t.dogId, t.date),
    check('weight_log_weight_range', sql`${t.weightKg} > 0 AND ${t.weightKg} <= 120`),
  ],
)

export type Dog = typeof dog.$inferSelect
export type WeightEntry = typeof weightLog.$inferSelect
