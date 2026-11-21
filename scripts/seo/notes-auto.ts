// @cdc tableau de bord SEO — notes automatiques tirées de l'historique git de la branche en ligne (copie de
// déploiement /srv/toutou/repo) : nouveautés du site (pastille « technique »), réécritures SEO et relectures de ton
// (journal seulement, quotidiennes), mises en ligne du jour. Clé unique : une note n'est jamais écrite deux fois.
//   tsx scripts/seo/notes-auto.ts [--jours=120]
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import pg from 'pg'

const REPO = process.env.DEPLOY_REPO || '/srv/toutou/repo'
const RELEASES = process.env.RELEASES_DIR || '/srv/toutou/releases'
const BRANCH = process.env.DEPLOY_BRANCH || 'v2'
const jours = Number(process.argv.find((a) => a.startsWith('--jours='))?.split('=')[1] ?? 120)
// Changements du tableau de bord ou de l'outillage : ils ne touchent pas le site public.
const INTERNAL = /^(feat|fix|perf|refactor)\((dashboard|safeguard|deploy|scripts|ci|deps|test|images|analytics|ops|sites|db|data|dns|qrt|10min)\)/
// Nouveautés qui changent ce que Google voit (pastille sur les courbes) ; les autres restent au journal.
const VISIBLE = /^(seo|cro|home|menu|nav|layout|design|pillar|rankings|promo|urgences|outils|tools|race)$/

interface Note {
  ref: string
  day: string
  kind: 'tech' | 'maj'
  text: string
  source: 'auto' | 'journal'
}

function fromGit(): Note[] {
  const out = execFileSync('git', ['-C', REPO, 'log', `origin/${BRANCH}`, `--since=${jours}.days`, '--no-merges', '--date=short', '--format=%h|%ad|%s'], { encoding: 'utf8' })
  const notes: Note[] = []
  for (const line of out.split('\n')) {
    const [sha, day, ...rest] = line.split('|')
    const subject = rest.join('|')
    if (!sha || !subject || INTERNAL.test(subject)) continue
    const seo = /^content\(seo\): (?:enrich|rewrite) (.+?)(?: for .*)?$/.exec(subject)
    if (seo) {
      notes.push({ ref: `git:${sha}`, day, kind: 'maj', text: `Réécriture SEO : ${seo[1]}`, source: 'journal' })
      continue
    }
    const tone = /^content\(tone\): clean up (\d+) articles/.exec(subject)
    if (tone) {
      notes.push({ ref: `git:${sha}`, day, kind: 'maj', text: `Ton relu sur ${tone[1]} articles`, source: 'journal' })
      continue
    }
    const feat = /^feat(?:\(([^)]+)\))?!?: (.+)$/.exec(subject)
    if (feat) notes.push({ ref: `git:${sha}`, day, kind: 'tech', text: `Nouveauté en ligne : ${feat[2]}`, source: VISIBLE.test(feat[1] ?? '') ? 'auto' : 'journal' })
  }
  return notes
}

function fromReleases(): Note[] {
  const perDay = new Map<string, number>()
  try {
    for (const name of readdirSync(RELEASES)) {
      const day = new Date(statSync(`${RELEASES}/${name}`).mtimeMs).toISOString().slice(0, 10)
      perDay.set(day, (perDay.get(day) ?? 0) + 1)
    }
  } catch {
    return []
  }
  return [...perDay].map(([day, n]) => ({ ref: `deploys:${day}`, day, kind: 'tech' as const, text: `${n} mise${n > 1 ? 's' : ''} en ligne du site`, source: 'journal' as const }))
}

async function main(): Promise<void> {
  const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  const notes = [...fromGit(), ...fromReleases()]
  let added = 0
  for (const n of notes) {
    const r = await db.query(
      `INSERT INTO analytics.seo_notes (day, kind, text, source, ref) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (ref) DO UPDATE SET text = EXCLUDED.text, source = EXCLUDED.source WHERE analytics.seo_notes.source <> 'manuel'`,
      [n.day, n.kind, n.text.slice(0, 200), n.source, n.ref],
    )
    added += r.rowCount ?? 0
  }
  await db.end()
  console.log(`Notes automatiques : ${notes.length} lues, ${added} écrites ou mises à jour`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
