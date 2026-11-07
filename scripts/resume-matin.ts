// Résumé du matin envoyé par ntfy, même quand tout va bien (demande du propriétaire, 2026-11-07) : la nuit,
// les articles publiés, les fiches importées, les inscriptions, les clics partenaires et les tâches en échec.
//   tsx scripts/resume-matin.ts [--essai]
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import pg from 'pg'
import { sendNtfy } from '../lib/server/alerts/notify'
import { NIGHT_LABELS, readNightRun } from '../lib/server/night-logs'

const paris = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d)

async function main(): Promise<void> {
  const aujourdhui = paris(new Date())
  const hier = paris(new Date(Date.now() - 86_400_000))
  const articles = readdirSync('content/blog')
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ f, date: /^date:\s*"([\d-]+)"/m.exec(readFileSync(`content/blog/${f}`, 'utf8'))?.[1] }))
    .filter((a) => a.date === aujourdhui || a.date === hier)
    .map((a) => a.f.replace('.mdx', ''))
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const [fiches, comptes, clics] = await Promise.all([
    pool.query<{ n: number }>("SELECT count(*)::int AS n FROM app.food_analysis WHERE created_at > now() - interval '24 hours'"),
    pool.query<{ n: number }>("SELECT count(*)::int AS n FROM app.\"user\" WHERE created_at > now() - interval '24 hours'"),
    pool.query<{ n: number }>("SELECT count(*)::int AS n FROM analytics.events WHERE name = 'Affiliate Click' AND ts > now() - interval '24 hours'"),
  ])
  await pool.end()
  const nuit = await readNightRun(aujourdhui)
  let echecs: string[] = []
  try {
    echecs = execFileSync('systemctl', ['list-units', '--failed', '--plain', '--no-legend', 'toutou-*'], { encoding: 'utf8' })
      .split('\n')
      .map((l) => l.trim().split(/\s+/)[0])
      .filter(Boolean)
  } catch {
    echecs = ['lecture des tâches impossible']
  }
  const lignes = [
    `Nuit : ${NIGHT_LABELS[nuit.status]}.`,
    articles.length ? `Articles publiés : ${articles.join(', ')}.` : 'Aucun nouvel article depuis hier.',
    `Fiches importées : ${fiches.rows[0].n}. Inscriptions : ${comptes.rows[0].n}. Clics partenaires : ${clics.rows[0].n}.`,
    echecs.length ? `En échec : ${echecs.join(', ')}.` : 'Aucune tâche en échec.',
  ]
  const message: Parameters<typeof sendNtfy>[0] = { title: 'Toutou Gourmet : le point du matin', message: lignes.join('\n'), priority: echecs.length ? 4 : 3, tags: [echecs.length ? 'warning' : 'dog'], click: 'https://dashboard.toutou-gourmet.com/tableau-de-bord' }
  if (process.argv.includes('--essai')) console.log(message.message)
  else await sendNtfy(message)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
