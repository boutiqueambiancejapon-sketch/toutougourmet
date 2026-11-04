// Procédure de secours du tableau de bord (deploy/README.md, « Connexion au tableau de bord »).
// À lancer sur le serveur, en SSH, avec les droits du compte toutou. Aucune route web n'y mène.
//   node --env-file=/srv/toutou/shared/.env scripts/dashboard-2fa-reset.mjs --confirmer
//     retire clés d'accès, application de codes, codes de secours et sessions, et efface les
//     échecs récents : la prochaine connexion par mot de passe ouvre l'enrôlement.
//   node --env-file=/srv/toutou/shared/.env scripts/dashboard-2fa-reset.mjs --debloquer
//     efface seulement les échecs récents, sans toucher aux facteurs ni aux sessions.
import pg from 'pg'

const mode = process.argv.includes('--confirmer') ? 'reset' : process.argv.includes('--debloquer') ? 'unblock' : null
if (!mode) {
  console.error('Rien fait. Ajoute --confirmer (réinitialise le second facteur) ou --debloquer (efface les échecs récents).')
  process.exit(2)
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL absent. Lance avec --env-file=/srv/toutou/shared/.env.')
  process.exit(2)
}

async function notify(message) {
  const topic = process.env.NTFY_TOPIC
  if (!topic) return
  const server = (process.env.NTFY_SERVER || 'https://ntfy.sh').replace(/\/+$/, '')
  await fetch(server, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ topic, title: 'Toutou Gourmet : sécurité', message, priority: 4, tags: ['lock'] }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => console.error('Alerte ntfy non envoyée.'))
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
  await client.query('BEGIN')
  // Lignes gardées au journal, mais qui ne comptent plus dans les limites.
  const cleared = await client.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome IN ('failure', 'blocked')`)
  if (mode === 'reset') {
    for (const table of ['passkey', 'totp', 'backup_code', 'session']) await client.query(`DELETE FROM app.dashboard_${table}`)
    await client.query(`INSERT INTO app.dashboard_login_event (kind, outcome) VALUES ('reset', 'success')`)
  }
  await client.query('COMMIT')
  console.log(mode === 'reset' ? 'Second facteur réinitialisé. Prochaine connexion par mot de passe : enrôlement.' : `Échecs effacés : ${cleared.rowCount}.`)
} catch (err) {
  await client.query('ROLLBACK').catch(() => undefined)
  console.error('Échec, rien de changé :', err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await client.end()
}
if (mode === 'reset' && !process.exitCode) await notify('Tableau de bord : second facteur réinitialisé depuis le serveur.')
