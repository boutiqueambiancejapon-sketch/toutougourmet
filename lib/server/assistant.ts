import { cache } from 'react'
import { REPONSE_SENSIBLE } from '@/lib/assistant/sensible'
import type { Gravite } from '@/lib/assistant/urgence'
import { ACTIVITY_LABELS, breedName, formatAge } from '@/lib/dog-profile'
import type { Dog } from '@/db/schema'
import { chercherArticles, texteBrut, type ArticleIndexe } from '@/lib/assistant/recherche'
import { getAllArticles } from '@/lib/mdx'
import { getBrandBySlug } from '@/data/brands'
import { CGU_VERSION } from '@/data/conditions'
import { CONFIRMED_DISCOUNTS } from '@/data/partner-discounts'
import { capByBrand, displayBrand, displayName, fold, segmentBySlug, type SegmentSlug } from '@/lib/scanner/rankings'
import type { FoodNoun } from '@/lib/scanner/food-noun'
import { geminiJson } from '@/lib/scanner/providers/gemini'
import type { JsonSchema } from '@/lib/scanner/label-schema'
import { getPool } from '@/lib/server/db'
import { rankedRecipes, type RankedRecipe } from '@/lib/server/rankings'

// @cdc assistant — Milo, le Shiba de Toutou Gourmet (décision du propriétaire du 2026-11-07). Il demande le contexte
// qui manque avant de répondre, ne parle d'urgence que si c'est grave, et connaît les chiens du compte.
// Réponse en trois temps : articles du site d'abord, fiches produits si une marque est citée, puis
// l'IA rédige. Sans article qui convient, elle répond seule et le dit (depuisLeSite faux). Plafond de dépense par jour.

export const ASSISTANT_DAILY_CAP = Number(process.env.ASSISTANT_DAILY_CAP) || 300
/** Questions par compte et par jour (décision du propriétaire du 2026-11-07, « pour le moment »). */
export const QUESTIONS_PAR_JOUR = Number(process.env.ASSISTANT_PER_USER) || 5

export interface Echange {
  q: string
  r: string
}

export interface Reponse {
  reponse: string
  /** Milo pose des questions au lieu de répondre : il lui manque le contexte. */
  questions: boolean
  /** Réponse écrite par le serveur (questions de contexte, garde-fou) : pas d'appel à l'IA. */
  fixe: boolean
  gravite: Gravite
  depuisLeSite: boolean
  articles: { url: string; titre: string }[]
  /** Liens partenaires seulement (décision du 2026-11-07) : Maxi Zoo, Dog Chef, Franklin. */
  produits: Produit[]
}

export interface Produit {
  nom: string
  url: string
  chez: string
  /** Note du scanner ; null pour Dog Chef et Franklin, absents de nos classements. */
  score: number | null
  remise: string | null
}

const indexArticles = cache((): ArticleIndexe[] =>
  getAllArticles()
    .filter((a) => a.frontmatter.categorySlug)
    .map((a) => ({ slug: a.slug, url: `/chien/${a.frontmatter.categorySlug}/${a.slug}`, titre: a.frontmatter.title, tags: a.frontmatter.tags ?? [], description: a.frontmatter.description ?? '', texte: a.content })),
)

const SYSTEME = `Tu es Milo, un Shiba Inu, la mascotte de Toutou Gourmet, un site sur l'alimentation du chien. Tu parles en français, à la première personne, en tutoyant, comme dans nos e-mails : chaleureux, un brin taquin, jamais niais. Tu ne te présentes pas à chaque message.
Avant de répondre, vérifie que tu as le contexte utile : race ou poids du chien, âge, quantité et heure pour un aliment avalé, symptômes éventuels, santé connue. Si un élément qui change la réponse manque et qu'il n'est ni dans les échanges précédents ni dans le profil du chien, ne réponds pas encore : pose une à trois questions courtes dans le même message et mets questions à vrai. Une question générale (lire une étiquette, un aliment autorisé ou non) se traite sans interrogatoire.
Quand tu réponds : la réponse tient dans la première phrase, puis deux à cinq phrases utiles. Pas de jargon, pas de nom d'organisme, pas de titre ni de puce.
Si des extraits d'articles du site répondent à la question, appuie-toi d'abord sur eux sans les contredire, mets depuisLeSite à vrai et donne dans sources leurs adresses. Sinon, réponds avec tes connaissances et mets depuisLeSite à faux.
gravite : « aucune » en temps normal ; « veterinaire » quand il faut l'avis de son vétérinaire dans les jours qui viennent ; « urgence » seulement si le chien est en danger maintenant (toxique avalé en quantité dangereuse pour son poids, détresse, convulsions, ventre gonflé, sang). En cas d'urgence, dis d'appeler tout de suite son vétérinaire ou un centre antipoison, sans détour. Ne dramatise pas un cas bénin.
Tu n'es pas vétérinaire : aucun diagnostic, aucune dose de médicament ou de complément. Ne cite jamais une note, une composition ou un prix absent des données fournies.\nConseil d'achat : recommande seulement des produits de la liste « Produits partenaires » quand elle est fournie, sans citer d'autre marque ni d'autre boutique où acheter ; les liens s'affichent sous ta réponse, ne les écris pas. Les notes viennent de l'étiquette ; Dog Chef et Franklin n'ont pas de note, ne les présente pas comme mieux notés. Cite deux ou trois produits de la liste par leur nom. Ne nomme aucun produit ni aucune marque hors de cette liste, même si tu en connais un meilleur. Sans cette liste, ne recommande aucune marque ni boutique.
Si la question ne porte pas sur un chien, réponds en une phrase que tu ne parles que de chiens et de gamelle.`

const SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    reponse: { type: 'string' },
    questions: { type: 'boolean' },
    gravite: { type: 'string', enum: ['aucune', 'veterinaire', 'urgence'] },
    depuisLeSite: { type: 'boolean' },
    sources: { type: 'array', items: { type: 'string' } },
  },
  required: ['reponse', 'questions', 'gravite', 'depuisLeSite', 'sources'],
}

type Achat = 'croquettes' | 'patee' | 'friandises' | 'repas'

/** Demande de conseil d'achat ? Le type de produit visé, sinon null. */
export function besoinAchat(question: string): Achat | null {
  const q = fold(question)
  if (!/\b(meilleure?s?|recommand|conseill|quelle marque|quel(le)?s? (croquettes?|patees?|friandises?|nourriture|repas|marque|aliment)|acheter|choisir|top)\b/.test(q)) return null
  if (/friandise|snack|recompense|os a macher/.test(q)) return 'friandises'
  if (/patee|humide|boite/.test(q)) return 'patee'
  if (/repas|frais|menager|barf|cuisin/.test(q)) return 'repas'
  return 'croquettes'
}

const NOUN: Record<Exclude<Achat, 'repas'>, FoodNoun> = { croquettes: 'croquettes', patee: 'patee', friandises: 'friandise' }

const chezMaxiZoo = (r: RankedRecipe): Produit[] =>
  r.buy?.store === 'Maxi Zoo' ? [{ nom: `${displayBrand(r.brand)} ${displayName(r.name)}`, url: r.buy.href, chez: 'Maxi Zoo', score: r.score, remise: null }] : []

function partenaire(slug: 'dog-chef' | 'franklin', quoi: string): Produit[] {
  const b = getBrandBySlug(slug)
  return b ? [{ nom: `${b.name} (${quoi})`, url: b.affiliateUrl, chez: b.name, score: null, remise: CONFIRMED_DISCOUNTS[slug] }] : []
}

/** Questions de Milo quand le contexte manque : écrites par le serveur, sans appel à l'IA ni décompte. */
const AVALE = /\b(a|as|ont) (mange|avale|croque|bu|leche|chipe|vole)\b|\bil a eu\b/

/** Le contexte que Milo doit demander avant de répondre, ou '' s'il l'a déjà (profil, échanges, question). */
export function contexteManquant(question: string, avant: string, chiens: string): string {
  const q = fold(question)
  const tout = fold(`${question} ${avant} ${chiens}`)
  const poids = /\d+(,\d+)?\s*kg|\b(chiot|shiba|labrador|chihuahua|berger|bouledogue|teckel|golden|yorkshire|caniche|beagle|husky|border|cocker|spitz|jack russell|bichon|carlin|boxer|malinois|staff|setter|epagneul|braque|rottweiler|dogue|terrier)\b/.test(tout)
  if (AVALE.test(q)) {
    const quantite = /\d|\b(un|une|deux|trois|quelques|moitie|tablette|carre|grain|morceau|bout|paquet|tout)\b/.test(fold(`${question} ${avant}`).replace(/\b(a|as) (mange|avale) (un|une)\b/, ''))
    const manque = [poids ? '' : 'son poids ou sa race', quantite ? '' : 'la quantité', /heure|minute|hier|ce matin|ce soir|tout a l'heure|maintenant/.test(tout) ? '' : 'depuis combien de temps', /vomi|va bien|normal|diarrh|tremble|abattu|rien de special|aucun signe|symptome/.test(tout) ? '' : "s'il a des signes"].filter(Boolean)
    if (manque.length >= 2) return `Je renifle l'affaire, mais il me manque des détails pour te répondre juste. Dis-moi ${manque.length > 1 ? `${manque.slice(0, -1).join(', ')} et ${manque[manque.length - 1]}` : manque[0]}.`
  }
  if (besoinAchat(question) && !poids && !/\b(\d+ ans|chiot|senior|adulte|vieux|age)\b/.test(tout)) return "Je veux bien t'aider à choisir. Dis-moi d'abord son âge et son poids (ou sa race), et s'il a un souci de santé ou une allergie."
  return ''
}

/** Classement adapté au chien décrit : âge puis taille, d'après la question, les échanges et le profil. */
function segmentsDuChien(texte: string): SegmentSlug[] {
  const t = fold(texte)
  const ans = Number(t.match(/\b(\d{1,2}) ans\b/)?.[1] ?? NaN)
  const kg = Number(t.match(/(\d+(?:[.,]\d+)?)\s*kg/)?.[1]?.replace(',', '.') ?? NaN)
  const age: SegmentSlug = /\bchiot|puppy|\d+ mois\b/.test(t) ? 'chiot' : /senior|vieux|age de|\bage\b/.test(t) || ans >= 8 ? 'senior' : 'adulte'
  const taille: SegmentSlug | null = /\b(petit|mini)\b/.test(t) || kg <= 12 ? 'petit-chien' : /\bgrand\b/.test(t) || kg > 25 ? 'grand-chien' : kg > 12 ? 'chien-moyen' : null
  return taille ? [age, taille] : [age]
}

/** Produits proposés : marques citées dans la question, sinon les mieux notés du type demandé, plus les partenaires. */
async function produitsProposes(question: string, contexte: string): Promise<Produit[]> {
  const recettes = await rankedRecipes().catch(() => [])
  const q = ` ${fold(question)} `
  const marques = [...new Set(recettes.map((r) => r.brand))].filter((b) => b.length >= 4 && q.includes(` ${fold(b)}`))
  if (marques.length) return marques.flatMap((m) => recettes.filter((r) => r.brand === m).sort((a, b) => b.score - a.score).flatMap(chezMaxiZoo).slice(0, 3)).slice(0, 6)
  const achat = besoinAchat(question)
  if (!achat) return []
  const filtres = segmentsDuChien(`${question} ${contexte}`).map((s) => segmentBySlug(s)?.match).filter((m): m is NonNullable<typeof m> => Boolean(m))
  const top = (noun: FoodNoun, n: number) => {
    const meilleurs = (l: RankedRecipe[]) => capByBrand(l.sort((a, b) => b.score - a.score), 1).flatMap(chezMaxiZoo).slice(0, n)
    const type = recettes.filter((r) => r.noun === noun)
    if (noun !== 'croquettes') return meilleurs(type)
    const tous = meilleurs(type.filter((r) => filtres.every((f) => f(r))))
    return tous.length >= n ? tous : meilleurs(type.filter((r) => filtres.slice(0, 1).every((f) => f(r))))
  }
  if (achat === 'repas') return [...partenaire('dog-chef', 'repas frais livrés'), ...partenaire('franklin', 'croquettes et pâtées mono-protéine'), ...top('croquettes', 2)]
  const extra = achat === 'croquettes' ? [...partenaire('franklin', 'croquettes mono-protéine'), ...partenaire('dog-chef', 'repas frais livrés')] : partenaire('franklin', achat === 'patee' ? 'pâtées mono-protéine' : 'friandises')
  return [...top(NOUN[achat], 3), ...extra]
}

/** Questions de Milo sans appel à l'IA : il lui manque le contexte. */
export function demanderContexte(texte: string): Reponse {
  return { reponse: texte, questions: true, fixe: true, gravite: 'aucune', depuisLeSite: false, articles: [], produits: [] }
}

/** Garde-fou : renvoi vers le vétérinaire, avec les articles du site sur le sujet pour préparer la question. */
export function renvoiVeterinaire(question: string, gravite: Exclude<Gravite, 'aucune'>): Reponse {
  const articles = gravite === 'urgence' ? [] : chercherArticles(indexArticles(), question, 2).map((t) => ({ url: t.article.url, titre: t.article.titre }))
  return { reponse: REPONSE_SENSIBLE[gravite], questions: false, fixe: true, gravite, depuisLeSite: articles.length > 0, articles, produits: [] }
}

export type Sorte = 'site' | 'ia' | 'contexte' | 'sensible' | 'echec'
export const sorteDe = (r: Reponse | null): Sorte => (!r ? 'echec' : r.questions ? 'contexte' : r.fixe ? 'sensible' : r.depuisLeSite ? 'site' : 'ia')

/** Conditions générales acceptées pour la version en vigueur ? Avec accepte, l'acceptation est enregistrée. */
export async function cguOk(userId: string, accepte: boolean): Promise<boolean> {
  const pool = getPool()
  if (!pool) return false
  const { rows } = await pool.query<{ version: string }>('SELECT version FROM analytics.assistant_cgu WHERE user_id = $1', [userId])
  if (rows[0]?.version === CGU_VERSION) return true
  if (!accepte) return false
  await pool.query(
    'INSERT INTO analytics.assistant_cgu (user_id, version) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET version = EXCLUDED.version, accepted_at = now()',
    [userId, CGU_VERSION],
  )
  return true
}

/** Compte une question du jour pour ce compte. Faux : limite atteinte. */
export async function compterQuestion(userId: string): Promise<boolean> {
  const pool = getPool()
  if (!pool) return false
  const res = await pool.query(
    `INSERT INTO analytics.assistant_quota (user_id, day, n) VALUES ($1, (now() AT TIME ZONE 'Europe/Paris')::date, 1)
     ON CONFLICT (user_id, day) DO UPDATE SET n = analytics.assistant_quota.n + 1 WHERE analytics.assistant_quota.n < $2`,
    [userId, QUESTIONS_PAR_JOUR],
  )
  return res.rowCount === 1
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

/** Profil des chiens du compte, en une ligne chacun : Milo ne redemande pas ce qu'il sait déjà. */
export function profilChiens(chiens: Dog[]): string {
  return chiens.slice(0, 4).map((c) => [
    c.name,
    breedName(c.breedSlug) ?? 'race non précisée',
    formatAge(c.birthDate, c.birthDateEstimated),
    c.weightKg ? `${c.weightKg} kg` : null,
    c.sterilized ? 'stérilisé' : null,
    `activité ${ACTIVITY_LABELS[c.activity].toLowerCase()}`,
    c.food ? `mange ${c.food}` : null,
    c.allergies.length ? `allergies : ${c.allergies.join(', ')}` : null,
  ].filter(Boolean).join(', ')).join('\n')
}

export async function repondre(question: string, historique: Echange[], chiens = ''): Promise<Reponse> {
  const achat = besoinAchat(question) !== null
  // Conseil d'achat : sans extraits d'articles, qui citent d'autres marques que les partenaires.
  const trouves = achat ? [] : chercherArticles(indexArticles(), question)
  const produits = await produitsProposes(question, `${historique.map((h) => h.q).join(' ')} ${chiens}`)
  const extraits = trouves.map((t) => `ARTICLE ${t.article.url}\nTitre : ${t.article.titre}\n${texteBrut(t.article.texte)}`).join('\n\n')
  const donnees = produits.map((p) => `- ${p.nom}, chez ${p.chez}${p.score === null ? '' : ` : ${p.score}/100`}${p.remise ? ` (${p.remise})` : ''}`).join('\n')
  const message = [
    chiens ? `Chiens de la personne (profil enregistré) :\n${chiens}` : '',
    historique.length ? `Échanges précédents :\n${historique.map((h) => `Q : ${h.q}\nR : ${h.r}`).join('\n')}` : '',
    extraits ? `Extraits du site :\n${extraits}` : 'Aucun article du site ne correspond.',
    donnees ? `Produits partenaires (notes du scanner Toutou Gourmet) :\n${donnees}` : '',
    `Question : ${question}`,
  ].filter(Boolean).join('\n\n')
  const { text } = await geminiJson({ system: SYSTEME, message, schema: SCHEMA, maxOutputTokens: 900, signal: AbortSignal.timeout(30_000) })
  const brut = JSON.parse(text) as { reponse?: unknown; questions?: unknown; gravite?: unknown; depuisLeSite?: unknown; sources?: unknown }
  const sources = Array.isArray(brut.sources) ? brut.sources.filter((s): s is string => typeof s === 'string') : []
  const articles = trouves.filter((t) => sources.includes(t.article.url)).map((t) => ({ url: t.article.url, titre: t.article.titre }))
  const reponse = typeof brut.reponse === 'string' ? brut.reponse.trim() : ''
  if (!reponse) throw new Error('réponse vide')
  const gravite: Gravite = brut.gravite === 'urgence' || brut.gravite === 'veterinaire' ? brut.gravite : 'aucune'
  const questions = brut.questions === true
  return { reponse, questions, fixe: false, gravite, depuisLeSite: !questions && brut.depuisLeSite === true && articles.length > 0, articles: questions ? [] : articles, produits: questions ? [] : produits }
}

/** Conversation gardée 90 jours, sans compte ni adresse : suivi dans le tableau de bord et réglage de Milo. */
export async function noterQuestion(question: string, r: Reponse | null, lieu: string): Promise<void> {
  const pool = getPool()
  if (!pool) return
  await pool
    .query(
      'INSERT INTO analytics.assistant_questions (question, depuis_site, articles, kind, gravite, reponse, produits, lieu) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [question.slice(0, 300), r?.depuisLeSite ?? null, r?.articles.map((a) => a.url) ?? [], sorteDe(r), r?.gravite ?? null, r?.reponse.slice(0, 1500) ?? null, r?.produits.length ?? 0, lieu],
    )
    .catch((err: unknown) => console.error('[assistant] question non notée', err instanceof Error ? err.message : err))
}
