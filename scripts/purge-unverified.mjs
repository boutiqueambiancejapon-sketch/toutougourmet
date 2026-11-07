#!/usr/bin/env node
// @cdc lot 4 — supprime les comptes non confirmés depuis plus de 30 jours (politique de
// confidentialité, section « Ton compte »). Aucune tâche planifiée : à lancer à la main ou
// depuis une minuterie systemd le jour où elle sera décidée.
// Usage : DATABASE_URL='postgresql:///toutou?host=/var/run/postgresql' node scripts/purge-unverified.mjs [--dry] [--days=30]

import pg from 'pg'
import { EMAIL_LOG_RETENTION_MONTHS, purgeEmailHistory, purgeScannerEvents, purgeUnverifiedUsers, SCANNER_EVENTS_RETENTION_DAYS, UNVERIFIED_RETENTION_DAYS } from './lib/purge-unverified.mjs'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('[purge] DATABASE_URL manquant')
  process.exit(1)
}

const dry = process.argv.includes('--dry')
const daysArg = process.argv.find((a) => a.startsWith('--days='))
const days = daysArg ? Number(daysArg.slice('--days='.length)) : UNVERIFIED_RETENTION_DAYS

const pool = new pg.Pool({ connectionString: url, max: 1 })
try {
  const result = await purgeUnverifiedUsers(pool, { days, dry })
  const verb = dry ? 'à supprimer' : 'supprimés'
  console.log(`[purge] ${verb} : ${result.users} compte(s) non confirmé(s) depuis plus de ${days} jours, ${result.verifications} jeton(s) et ${result.sessions} session(s) expirés`)
  const history = await purgeEmailHistory(pool, { dry })
  console.log(`[purge] ${verb} : ${history} ligne(s) d'historique d'envois de plus de ${EMAIL_LOG_RETENTION_MONTHS} mois`)
  const scans = await purgeScannerEvents(pool, { dry })
  console.log(`[purge] ${verb} : ${scans} ligne(s) du journal du scanner de plus de ${SCANNER_EVENTS_RETENTION_DAYS} jours`)
  // Questions de l'assistant : gardées 90 jours (page /assistant).
  const questions = dry ? { rowCount: 0 } : await pool.query("DELETE FROM analytics.assistant_questions WHERE created_at < now() - interval '90 days'")
  console.log(`[purge] ${verb} : ${questions.rowCount ?? 0} question(s) de l'assistant de plus de 90 jours`)
} catch (err) {
  console.error('[purge] échec', err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await pool.end()
}
