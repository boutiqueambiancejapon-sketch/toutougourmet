#!/usr/bin/env node
// @cdc lot 4 — supprime les comptes non confirmés depuis plus de 30 jours (politique de
// confidentialité, section « Ton compte »). Aucune tâche planifiée : à lancer à la main ou
// depuis une minuterie systemd le jour où elle sera décidée.
// Usage : DATABASE_URL='postgresql:///toutou?host=/var/run/postgresql' node scripts/purge-unverified.mjs [--dry] [--days=30]

import pg from 'pg'
import { purgeUnverifiedUsers, UNVERIFIED_RETENTION_DAYS } from './lib/purge-unverified.mjs'

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
} catch (err) {
  console.error('[purge] échec', err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await pool.end()
}
