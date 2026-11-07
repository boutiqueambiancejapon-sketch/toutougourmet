import { ASSISTANT_DAILY_CAP, QUESTIONS_PAR_JOUR } from './assistant'
import { safeRead } from './dashboard-safe'

// @cdc tableau de bord — suivi de Milo, l'assistant (demande du propriétaire du 2026-11-07) : appels à l'IA et coût
// estimé, questions par type de réponse, ouvertures de la fenêtre, demandes de compte, comptes ouverts grâce au chat,
// clics vers les partenaires, dernières conversations et questions sans article (idées d'articles).

/** Coût moyen mesuré d'un appel (environ 2 600 jetons en entrée, 200 en sortie, gemini-3.1-flash-lite). */
export const COUT_APPEL_USD = 0.001

export interface AssistantJour {
  jour: string
  questions: number
  appels: number
}
export interface AssistantConversation {
  at: Date
  question: string
  kind: string | null
  gravite: string | null
  reponse: string | null
  produits: number
  lieu: string | null
}
export interface AssistantSuivi {
  ok: boolean
  cap: number
  parCompte: number
  appels: { aujourdhui: number; semaine: number; mois: number }
  sortes: Record<string, number>
  comptesActifs: number
  ouvertures: number
  demandesCompte: number
  inscrits: { semaine: number; total: number }
  clics: { marque: string; n: number }[]
  jours: AssistantJour[]
  dernieres: AssistantConversation[]
  idees: { question: string; at: Date }[]
}

const SEMAINE = "now() - interval '7 days'"

export async function getAssistantSuivi(): Promise<AssistantSuivi> {
  const reads = await Promise.all([
    safeRead('assistant appels', { aujourdhui: 0, semaine: 0, mois: 0 }, async (pool) => {
      const { rows } = await pool.query<{ a: number; s: number; m: number }>(
        `SELECT coalesce(sum(calls) FILTER (WHERE day = (now() AT TIME ZONE 'Europe/Paris')::date), 0)::int AS a,
                coalesce(sum(calls) FILTER (WHERE day > (now() AT TIME ZONE 'Europe/Paris')::date - 7), 0)::int AS s,
                coalesce(sum(calls) FILTER (WHERE day > (now() AT TIME ZONE 'Europe/Paris')::date - 30), 0)::int AS m
           FROM analytics.assistant_daily`,
      )
      return { aujourdhui: rows[0]?.a ?? 0, semaine: rows[0]?.s ?? 0, mois: rows[0]?.m ?? 0 }
    }),
    safeRead('assistant sortes', {} as Record<string, number>, async (pool) => {
      const { rows } = await pool.query<{ kind: string; n: number }>(`SELECT coalesce(kind, 'ancienne') AS kind, count(*)::int AS n FROM analytics.assistant_questions WHERE created_at > ${SEMAINE} GROUP BY 1`)
      return Object.fromEntries(rows.map((r) => [r.kind, r.n]))
    }),
    safeRead('assistant comptes actifs', 0, async (pool) => {
      const { rows } = await pool.query<{ n: number }>(`SELECT count(DISTINCT user_id)::int AS n FROM analytics.assistant_quota WHERE day > (now() AT TIME ZONE 'Europe/Paris')::date - 7`)
      return rows[0]?.n ?? 0
    }),
    safeRead('assistant événements', { ouvertures: 0, demandes: 0, clics: [] as { marque: string; n: number }[] }, async (pool) => {
      const { rows } = await pool.query<{ name: string; marque: string | null; n: number }>(
        `SELECT name, CASE WHEN name = 'Affiliate Click' THEN props->>'brand' END AS marque, count(*)::int AS n
           FROM analytics.events
          WHERE ts > ${SEMAINE} AND (name IN ('Assistant Open', 'Assistant Signup Asked') OR (name = 'Affiliate Click' AND props->>'place' = 'assistant-produit'))
          GROUP BY 1, 2`,
      )
      return {
        ouvertures: rows.find((r) => r.name === 'Assistant Open')?.n ?? 0,
        demandes: rows.find((r) => r.name === 'Assistant Signup Asked')?.n ?? 0,
        clics: rows.filter((r) => r.name === 'Affiliate Click').map((r) => ({ marque: r.marque ?? 'autre', n: r.n })).sort((a, b) => b.n - a.n),
      }
    }),
    safeRead('assistant inscrits', { semaine: 0, total: 0 }, async (pool) => {
      const { rows } = await pool.query<{ s: number; t: number }>(
        `SELECT count(*) FILTER (WHERE created_at > ${SEMAINE})::int AS s, count(*)::int AS t FROM analytics.signup_sources WHERE place IN ('assistant', 'assistant-fenetre')`,
      )
      return { semaine: rows[0]?.s ?? 0, total: rows[0]?.t ?? 0 }
    }),
    safeRead('assistant jours', [] as AssistantJour[], async (pool) => {
      const { rows } = await pool.query<AssistantJour>(
        `SELECT to_char(d, 'DD/MM') AS jour,
                (SELECT count(*)::int FROM analytics.assistant_questions q WHERE (q.created_at AT TIME ZONE 'Europe/Paris')::date = d) AS questions,
                coalesce((SELECT calls FROM analytics.assistant_daily a WHERE a.day = d), 0)::int AS appels
           FROM generate_series((now() AT TIME ZONE 'Europe/Paris')::date - 13, (now() AT TIME ZONE 'Europe/Paris')::date, interval '1 day') AS g(d0),
                LATERAL (SELECT g.d0::date AS d) x
          ORDER BY d DESC`,
      )
      return rows
    }),
    safeRead('assistant dernières', [] as AssistantConversation[], async (pool) => {
      const { rows } = await pool.query<AssistantConversation>(
        'SELECT created_at AS at, question, kind, gravite, reponse, produits, lieu FROM analytics.assistant_questions ORDER BY created_at DESC LIMIT 40',
      )
      return rows
    }),
    safeRead('assistant idées', [] as { question: string; at: Date }[], async (pool) => {
      const { rows } = await pool.query<{ question: string; at: Date }>(
        "SELECT question, created_at AS at FROM analytics.assistant_questions WHERE kind = 'ia' AND created_at > now() - interval '30 days' ORDER BY created_at DESC LIMIT 25",
      )
      return rows
    }),
  ] as const)
  const [appels, sortes, actifs, ev, inscrits, jours, dernieres, idees] = reads
  return {
    ok: reads.every((r) => r.ok),
    cap: ASSISTANT_DAILY_CAP,
    parCompte: QUESTIONS_PAR_JOUR,
    appels: appels.value,
    sortes: sortes.value,
    comptesActifs: actifs.value,
    ouvertures: ev.value.ouvertures,
    demandesCompte: ev.value.demandes,
    inscrits: inscrits.value,
    clics: ev.value.clics,
    jours: jours.value,
    dernieres: dernieres.value,
    idees: idees.value,
  }
}
