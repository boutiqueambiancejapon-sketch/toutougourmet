import { cache } from 'react'
import { chercherArticles, texteBrut, type ArticleIndexe } from '@/lib/assistant/recherche'
import { getAllArticles } from '@/lib/mdx'
import { displayBrand, displayName, fold } from '@/lib/scanner/rankings'
import { geminiJson } from '@/lib/scanner/providers/gemini'
import type { JsonSchema } from '@/lib/scanner/label-schema'
import { getPool } from '@/lib/server/db'
import { rankedRecipes } from '@/lib/server/rankings'

// @cdc assistant — réponse en trois temps : articles du site d'abord, fiches produits si une marque est citée, puis
// l'IA rédige. Sans article qui convient, elle répond seule et le dit (depuisLeSite faux). Plafond de dépense par jour.

export const ASSISTANT_DAILY_CAP = Number(process.env.ASSISTANT_DAILY_CAP) || 300

export interface Echange {
  q: string
  r: string
}

export interface Reponse {
  reponse: string
  depuisLeSite: boolean
  articles: { url: string; titre: string }[]
  fiches: { url: string; nom: string; score: number }[]
}

const indexArticles = cache((): ArticleIndexe[] =>
  getAllArticles()
    .filter((a) => a.frontmatter.categorySlug)
    .map((a) => ({ slug: a.slug, url: `/chien/${a.frontmatter.categorySlug}/${a.slug}`, titre: a.frontmatter.title, tags: a.frontmatter.tags ?? [], description: a.frontmatter.description ?? '', texte: a.content })),
)

const SYSTEME = `Tu es l'assistant de Toutou Gourmet, un site sur l'alimentation du chien. Tu réponds en français, en tutoyant, comme un ami qui s'y connaît : la réponse tient dans la première phrase, puis deux à cinq phrases utiles. Pas de jargon, pas de nom d'organisme, pas de liste de sources dans le texte, pas de titre ni de puce.
Si des extraits d'articles du site sont fournis et répondent à la question, appuie-toi d'abord sur eux sans les contredire, mets depuisLeSite à vrai et donne dans sources les adresses des extraits utilisés. Sinon, réponds avec tes connaissances et mets depuisLeSite à faux.
Tu n'es pas vétérinaire : aucun diagnostic, aucune dose de médicament ou de complément. Pour un symptôme, un produit peut-être toxique avalé, un chiot très jeune, une chienne gestante ou un chien malade, dis d'appeler son vétérinaire. Si tu n'es pas sûr qu'un aliment est sans danger, dis-le et conseille de ne pas en donner.
Ne cite jamais une note, une composition ou un prix absent des données fournies.
Si la question ne porte pas sur un chien, réponds en une phrase que tu ne traites que l'alimentation et le bien-être du chien.`

const SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    reponse: { type: 'string' },
    depuisLeSite: { type: 'boolean' },
    sources: { type: 'array', items: { type: 'string' } },
  },
  required: ['reponse', 'depuisLeSite', 'sources'],
}

async function fichesCitees(question: string) {
  const q = ` ${fold(question)} `
  const recettes = await rankedRecipes().catch(() => [])
  const marques = [...new Set(recettes.map((r) => r.brand))].filter((b) => b.length >= 4 && q.includes(` ${fold(b)}`))
  return marques.flatMap((m) =>
    recettes
      .filter((r) => r.brand === m)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => ({ url: r.href, nom: `${displayBrand(r.brand)} ${displayName(r.name)}`, score: r.score })),
  ).slice(0, 6)
}

/** Réserve un appel sur le plafond du jour. Faux : plafond atteint. */
export async function reserverAppel(): Promise<boolean> {
  const pool = getPool()
  if (!pool) return false
  const res = await pool.query(
    `INSERT INTO analytics.assistant_daily (day, calls) VALUES ((now() AT TIME ZONE 'Europe/Paris')::date, 1)
     ON CONFLICT (day) DO UPDATE SET calls = analytics.assistant_daily.calls + 1 WHERE analytics.assistant_daily.calls < $1`,
    [ASSISTANT_DAILY_CAP],
  )
  return res.rowCount === 1
}

export async function repondre(question: string, historique: Echange[]): Promise<Reponse> {
  const trouves = chercherArticles(indexArticles(), question)
  const fiches = await fichesCitees(question)
  const extraits = trouves.map((t) => `ARTICLE ${t.article.url}\nTitre : ${t.article.titre}\n${texteBrut(t.article.texte)}`).join('\n\n')
  const donnees = fiches.map((f) => `- ${f.nom} : ${f.score}/100 (${f.url})`).join('\n')
  const message = [
    historique.length ? `Échanges précédents :\n${historique.map((h) => `Q : ${h.q}\nR : ${h.r}`).join('\n')}` : '',
    extraits ? `Extraits du site :\n${extraits}` : 'Aucun article du site ne correspond.',
    donnees ? `Fiches produits du site (notes officielles) :\n${donnees}` : '',
    `Question : ${question}`,
  ].filter(Boolean).join('\n\n')
  const { text } = await geminiJson({ system: SYSTEME, message, schema: SCHEMA, maxOutputTokens: 900, signal: AbortSignal.timeout(30_000) })
  const brut = JSON.parse(text) as { reponse?: unknown; depuisLeSite?: unknown; sources?: unknown }
  const sources = Array.isArray(brut.sources) ? brut.sources.filter((s): s is string => typeof s === 'string') : []
  const articles = trouves.filter((t) => sources.includes(t.article.url)).map((t) => ({ url: t.article.url, titre: t.article.titre }))
  const reponse = typeof brut.reponse === 'string' ? brut.reponse.trim() : ''
  if (!reponse) throw new Error('réponse vide')
  return { reponse, depuisLeSite: brut.depuisLeSite === true && articles.length > 0, articles, fiches }
}

/** Question gardée 90 jours, sans compte ni adresse : elle sert à choisir les prochains articles. */
export async function noterQuestion(question: string, r: Reponse | null): Promise<void> {
  const pool = getPool()
  if (!pool) return
  await pool
    .query('INSERT INTO analytics.assistant_questions (question, depuis_site, articles) VALUES ($1, $2, $3)', [question.slice(0, 300), r?.depuisLeSite ?? null, r?.articles.map((a) => a.url) ?? []])
    .catch((err: unknown) => console.error('[assistant] question non notée', err instanceof Error ? err.message : err))
}
