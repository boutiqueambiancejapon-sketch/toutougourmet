import { sql } from 'drizzle-orm'
import { bigint, bigserial, boolean, check, index, integer, jsonb, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { app } from './app'

// @cdc tableau de bord — connexion du propriétaire. Tables à part de Better Auth : l'administrateur
// n'est pas un compte visiteur, aucune clé étrangère vers app.user. Aucun secret en clair :
// jeton de session et codes de secours hachés, secret TOTP chiffré (AES-256-GCM), adresse IP
// remplacée par une empreinte à clé (lib/server/dashboard-login/secrets.ts).

export const DASHBOARD_SESSION_STAGES = ['second_factor', 'enroll', 'full'] as const

const at = (name: string) => timestamp(name, { withTimezone: true })

export const dashboardSession = app.table(
  'dashboard_session',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tokenHash: text('token_hash').notNull().unique(),
    stage: text('stage', { enum: DASHBOARD_SESSION_STAGES }).notNull(),
    /** Empreinte du mot de passe courant : changer le mot de passe invalide toutes les sessions. */
    passwordFp: text('password_fp').notNull(),
    createdAt: at('created_at').notNull().defaultNow(),
    lastSeenAt: at('last_seen_at').notNull().defaultNow(),
    expiresAt: at('expires_at').notNull(),
    factorAt: at('factor_at'),
    factorFailures: integer('factor_failures').notNull().default(0),
    /** Défi WebAuthn en cours, à usage unique. */
    challenge: text('challenge'),
    challengeAt: at('challenge_at'),
    deviceLabel: text('device_label').notNull().default(''),
  },
  (t) => [index('dashboard_session_expires_idx').on(t.expiresAt)],
)

export const dashboardPasskey = app.table('dashboard_passkey', {
  credentialId: text('credential_id').primaryKey(),
  publicKey: text('public_key').notNull(),
  counter: bigint('counter', { mode: 'number' }).notNull().default(0),
  transports: jsonb('transports').$type<string[]>().notNull().default([]),
  backedUp: boolean('backed_up').notNull().default(false),
  label: text('label').notNull(),
  createdAt: at('created_at').notNull().defaultNow(),
  lastUsedAt: at('last_used_at'),
})

/** Une seule ligne : le secret TOTP du propriétaire. confirmed_at vide = enrôlement en cours. */
export const dashboardTotp = app.table(
  'dashboard_totp',
  {
    id: smallint('id').primaryKey().default(1),
    secretEnc: text('secret_enc').notNull(),
    confirmedAt: at('confirmed_at'),
    /** Dernière période acceptée : un code déjà utilisé ne repasse pas. */
    lastCounter: bigint('last_counter', { mode: 'number' }).notNull().default(0),
    createdAt: at('created_at').notNull().defaultNow(),
  },
  (t) => [check('dashboard_totp_single', sql`${t.id} = 1`)],
)

export const dashboardBackupCode = app.table('dashboard_backup_code', {
  codeHash: text('code_hash').primaryKey(),
  createdAt: at('created_at').notNull().defaultNow(),
  usedAt: at('used_at'),
})

/** Appareils connus, pour l'alerte « nouvel appareil » et l'exemption de la limite globale. */
export const dashboardDevice = app.table('dashboard_device', {
  hash: text('hash').primaryKey(),
  label: text('label').notNull(),
  firstSeenAt: at('first_seen_at').notNull().defaultNow(),
  lastSeenAt: at('last_seen_at').notNull().defaultNow(),
})

export const dashboardLoginEvent = app.table(
  'dashboard_login_event',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    at: at('at').notNull().defaultNow(),
    kind: text('kind').notNull(),
    outcome: text('outcome').notNull(),
    ipHash: text('ip_hash').notNull().default(''),
    deviceLabel: text('device_label').notNull().default(''),
  },
  (t) => [index('dashboard_login_event_at_idx').on(t.at), index('dashboard_login_event_ip_idx').on(t.ipHash, t.at)],
)

/** Défis de la connexion directe par Face ID : aucune session n'existe encore, un défi ne sert qu'une fois. */
export const dashboardChallenge = app.table('dashboard_challenge', {
  challenge: text('challenge').primaryKey(),
  createdAt: at('created_at').notNull().defaultNow(),
})
