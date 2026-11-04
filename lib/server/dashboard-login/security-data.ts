import { factorsSummary, listPasskeys } from './factors'
import { requirePool } from './mode'

// @cdc tableau de bord — écran Sécurité. Seulement ce qui sert : ni clé publique, ni empreinte
// complète (6 caractères suffisent à voir si deux lignes viennent de la même adresse).

export interface SessionRow {
  id: string
  stage: string
  deviceLabel: string
  createdAt: Date
  lastSeenAt: Date
}

export interface EventRow {
  id: string
  at: Date
  kind: string
  outcome: string
  ip: string
  deviceLabel: string
}

export async function readSecurity() {
  const pool = requirePool()
  const [passkeys, summary, sessions, events] = await Promise.all([
    listPasskeys(),
    factorsSummary(),
    pool.query<SessionRow>(
      `SELECT id, stage, device_label AS "deviceLabel", created_at AS "createdAt", last_seen_at AS "lastSeenAt"
         FROM app.dashboard_session WHERE expires_at > now() ORDER BY last_seen_at DESC LIMIT 20`,
    ),
    pool.query<EventRow>(`SELECT id, at, kind, outcome, left(ip_hash, 6) AS ip, device_label AS "deviceLabel" FROM app.dashboard_login_event ORDER BY at DESC, id DESC LIMIT 30`),
  ])
  return {
    passkeys: passkeys.map((p) => ({ id: p.credentialId, label: p.label, createdAt: p.createdAt, lastUsedAt: p.lastUsedAt })),
    totp: summary.totp,
    backupCodes: summary.backupCodes,
    sessions: sessions.rows,
    events: events.rows,
  }
}

export type SecurityData = Awaited<ReturnType<typeof readSecurity>>
