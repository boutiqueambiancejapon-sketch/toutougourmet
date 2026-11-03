// Alertes urgentes vers ntfy, toutes les 10 minutes (deploy/toutou-alerts.timer). Contrôle le site
// (local et public), les services toutou-*, la tâche de nuit, le disque, la mémoire, la charge,
// la sauvegarde, l'import Open Pet Food Facts et les nouveaux signalements du scanner. Une
// notification par incident, une autre quand il est réglé ; tout ce qui change pendant un
// passage part dans un seul message.
//
// Lancer depuis la racine du site, variables de /srv/toutou/shared/.env chargées :
//   node_modules/.bin/tsx scripts/alerts.ts          (passage normal)
//   … --dry                 affiche le message sans l'envoyer (état : /tmp/toutou-alerts-state.dry.json
//                           sauf si ALERTS_STATE_FILE est donné)
//   … --test                envoie une notification de test, sans rien contrôler
//   … --now=2026-11-02T07:05:00+01:00   simule l'heure (contrôle de la tâche de nuit)
// Variables : NTFY_SERVER, NTFY_TOPIC (secret), ALERTS_STATE_FILE, DATABASE_URL ; pour les essais :
// ALERTS_LOCAL_URL, ALERTS_PUBLIC_URL, ALERTS_RETRY_MS, SEO_LOGS_DIR, DASHBOARD_BACKUP_DIR.

import { checkBackup,
  checkOpffImport, checkScannerDaily, checkHost, checkNight, checkSites, checkUnits, type Incident } from '../lib/server/alerts/checks'
import { composeMessage, DASHBOARD_URL, diffIncidents, printMessage, readState, sendNtfy, writeState } from '../lib/server/alerts/notify'
import { getPool } from '../lib/server/db'

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const nowArg = args.find((a) => a.startsWith('--now='))?.slice('--now='.length)
const stateFile = process.env.ALERTS_STATE_FILE || (dry ? '/tmp/toutou-alerts-state.dry.json' : '/srv/toutou/shared/alerts-state.json')

/** Signalements non traités créés depuis le dernier passage (premier passage : 10 dernières minutes). */
async function newReports(since: string | undefined): Promise<{ count: number; until: string } | Incident> {
  const pool = getPool()
  if (!pool) return { key: 'db', urgent: false, line: 'DATABASE_URL absent : signalements du scanner non contrôlés.', resolved: 'Base de données de nouveau lue.' }
  try {
    const res = await pool.query<{ count: number; until: Date }>(
      `SELECT (SELECT count(*)::int FROM app.scan_report
                WHERE handled_at IS NULL AND created_at > coalesce($1::timestamptz, now() - interval '10 minutes')) AS count,
              now() AS until`,
      [since ?? null],
    )
    return { count: res.rows[0].count, until: res.rows[0].until.toISOString() }
  } catch {
    return { key: 'db', urgent: false, line: 'Base de données injoignable.', resolved: 'Base de données de nouveau joignable.' }
  } finally {
    await pool.end()
  }
}

async function test(): Promise<void> {
  const msg = { title: 'Toutou Gourmet : test', message: 'Notification de test. Les alertes du serveur arrivent ici.', priority: 3 as const, tags: ['test_tube'], click: DASHBOARD_URL }
  printMessage(msg)
  if (dry) return console.log('[alertes] --dry : rien envoyé.')
  await sendNtfy(msg)
  console.log('[alertes] notification de test envoyée.')
}

async function main(): Promise<void> {
  if (args.includes('--test')) return test()
  const now = nowArg ? new Date(nowArg) : new Date()
  if (Number.isNaN(now.getTime())) throw new Error(`--now invalide : ${nowArg}`)

  const state = readState(stateFile)
  const [sites, units, night, host, backup, scanner, opff, reports] = await Promise.all([
    checkSites(),
    checkUnits(),
    checkNight(now),
    checkHost(),
    checkBackup(now),
    checkScannerDaily(),
    checkOpffImport(now),
    newReports(state.reportsSince),
  ])
  const reportCount = 'count' in reports ? reports.count : 0
  const current = [...sites, ...units, ...night, ...host, ...backup, ...scanner, ...opff, ...('count' in reports ? [] : [reports])]
  const diff = diffIncidents(state, current)
  const msg = composeMessage(diff, reportCount)

  console.log(`[alertes] ${now.toISOString()} : ${current.length} incident(s) en cours, ${diff.opened.length} nouveau(x), ${diff.closed.length} réglé(s), ${reportCount} signalement(s).`)
  for (const i of current) console.log(`[alertes]   ${i.key} : ${i.line}`)

  if (msg) {
    printMessage(msg)
    if (dry) console.log('[alertes] --dry : rien envoyé.')
    else await sendNtfy(msg)
  }
  // Après l'envoi seulement : si ntfy échoue, le passage suivant renverra le même message.
  const kept = Object.fromEntries(current.map((i) => [i.key, state.incidents[i.key] ?? { since: now.toISOString(), line: i.line, resolved: i.resolved }]))
  writeState(stateFile, { incidents: kept, reportsSince: 'count' in reports ? reports.until : state.reportsSince })
  if (dry) console.log(`[alertes] état écrit dans ${stateFile}`)
}

main().catch((err: unknown) => {
  console.error('[alertes] échec :', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
