import { cache } from 'react'
import { headers } from 'next/headers'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import * as schema from '@/db/schema'
import { SESSION_HINT_COOKIE } from '@/lib/account-hint'
import { isDisposableEmail } from './disposable-email'
import { getDb, type Db } from './drizzle'
import { clientIp, overLimit } from './rate-window'
import { cancelSubscriptionBeforeDelete } from './billing-account'
import { accountDeletedEmail, resetPasswordEmail, verificationEmail } from './auth-emails'
import { sendTransactionalEmail } from './mailer'
import { recordSignup, recordVerified } from './signup-source'

// @cdc lot 4 — Better Auth : e-mail + mot de passe (scrypt, haché dans notre base), adresse à
// vérifier avant la première connexion, mot de passe oublié. E-mails via Brevo (lib/server/mailer).
// Protection CSRF (Origin + Fetch Metadata) et limite de tentatives en mémoire : réglages par défaut
// de Better Auth, resserrés sur les routes sensibles. Sans DATABASE_URL, getAuth() renvoie null.

const BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000'

// @cdc sécurité — au plus 5 comptes par jour depuis une même adresse (compteur en mémoire, adresse
// jamais écrite), en plus de la limite par minute de Better Auth.
const SIGNUPS_PER_DAY = [{ windowMs: 24 * 60 * 60 * 1000, max: 5 }] as const


function send(mail: Parameters<typeof sendTransactionalEmail>[0]): void {
  // Pas d'attente : le temps de réponse ne doit pas révéler si l'adresse existe.
  sendTransactionalEmail(mail).catch((err: unknown) => {
    console.error('[auth] e-mail non envoyé', err instanceof Error ? err.message : err)
  })
}

function createAuth(db: Db) {
  const secure = BASE_URL.startsWith('https://')
  return betterAuth({
    appName: 'Toutou Gourmet',
    baseURL: BASE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => send(resetPasswordEmail(user.email, user.name, url)),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60 * 24,
      sendVerificationEmail: async ({ user, url }) => send(verificationEmail(user.email, user.name, url)),
      // @cdc mesure — e-mail confirmé, compté avec l'emplacement d'où vient le compte.
      afterEmailVerification: async (user, request) => recordVerified(user.id, request),
    },
    user: {
      // Droit à l'effacement : suppression depuis /compte/supprimer, mot de passe exigé. Les chiens,
      // les pesées et l'historique du scanner partent avec l'utilisateur (ON DELETE CASCADE).
      deleteUser: {
        enabled: true,
        // @cdc premium — abonnement Stripe résilié avant l'effacement (lib/server/billing-account.ts).
        beforeDelete: async (deleted) => cancelSubscriptionBeforeDelete(deleted.id),
        afterDelete: async (deleted) => send(accountDeletedEmail(deleted.email, deleted.name)),
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    // @cdc RGPD — aucune adresse IP enregistrée : Better Auth remplit session.ip_address par
    // défaut, on la vide avant l'écriture (la limite de tentatives lit l'IP sans la garder ici).
    databaseHooks: {
      session: { create: { before: async (data) => ({ data: { ...data, ipAddress: null } }) } },
      // @cdc mesure — emplacement d'origine du compte (?source= de la page d'inscription).
      user: { create: { after: async (created, ctx) => recordSignup(created.id, ctx) } },
    },
    rateLimit: {
      enabled: true,
      // En mémoire : la clé de Better Auth contient l'adresse IP en clair (« ip|chemin »), on ne
      // l'écrit pas en base. Un redémarrage remet les compteurs à zéro (fenêtres de 1 à 5 min).
      storage: 'memory',
      window: 60,
      max: 60,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 60, max: 3 },
        '/request-password-reset': { window: 300, max: 3 },
        '/send-verification-email': { window: 300, max: 3 },
        '/reset-password': { window: 300, max: 5 },
        '/delete-user': { window: 300, max: 5 },
      },
    },
    advanced: { useSecureCookies: secure, cookiePrefix: 'tg' },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-up/email') return
        const email: unknown = (ctx.body as { email?: unknown } | undefined)?.email
        if (typeof email === 'string' && isDisposableEmail(email)) {
          throw new APIError('BAD_REQUEST', { code: 'DISPOSABLE_EMAIL', message: 'Disposable email addresses are not accepted' })
        }
        if (overLimit(`signup-day:${clientIp(ctx.headers ?? new Headers())}`, SIGNUPS_PER_DAY)) {
          throw new APIError('TOO_MANY_REQUESTS', { code: 'SIGNUP_DAILY_LIMIT', message: 'Too many accounts created today' })
        }
      }),
      // Témoin lisible par le navigateur (sans valeur secrète) : l'en-tête et /outils/ration savent
      // qu'il y a un compte sans appeler le serveur, donc les pages publiques restent statiques.
      after: createAuthMiddleware(async (ctx) => {
        const hint = { path: '/', sameSite: 'lax' as const, secure, httpOnly: false }
        if (ctx.path === '/sign-out') ctx.setCookie(SESSION_HINT_COOKIE, '', { ...hint, maxAge: 0 })
        else if (ctx.context.newSession) ctx.setCookie(SESSION_HINT_COOKIE, '1', { ...hint, maxAge: 60 * 60 * 24 * 30 })
      }),
    },
    plugins: [nextCookies()],
  })
}

type Auth = ReturnType<typeof createAuth>

const globalForAuth = globalThis as unknown as { tgAuth?: Auth | null }

export function getAuth(): Auth | null {
  if (globalForAuth.tgAuth !== undefined) return globalForAuth.tgAuth
  const db = getDb()
  globalForAuth.tgAuth = db ? createAuth(db) : null
  return globalForAuth.tgAuth
}

export type SessionUser = { id: string; name: string; email: string }

/** Utilisateur connecté de la requête en cours (une seule lecture par rendu). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // Lire les en-têtes d'abord : la page appelante devient dynamique même sans base configurée
  // (sinon le build figerait une redirection vers la connexion).
  const requestHeaders = await headers()
  const auth = getAuth()
  if (!auth) return null
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) return null
  return { id: session.user.id, name: session.user.name, email: session.user.email }
})
