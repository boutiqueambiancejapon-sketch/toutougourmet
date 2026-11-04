import { getSlotPath, resolveSlot } from '@/data/image-utils'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { type OfferSlug } from '@/lib/account-offers'
import { offerCard } from './offer-card'
import { getAllArticles, type Article } from '@/lib/mdx'
import { COLORS, button, divider, heading, image, label, linkItem, paragraph, renderEmail, siteUrl, type EmailBlock, type RenderedEmail } from './layout'
import { SEASONAL_TIPS } from './seasonal'

// @cdc e-mails — lettre mensuelle générée depuis le site : guide du mois, nouveaux guides avec
// verdict, croquette la mieux notée du scanner (fiches relues seulement), une offre partenaire qui
// tourne chaque mois, un conseil de saison. Fonction pure à données injectables (tests, aperçu).

/** Balise de désinscription des campagnes Brevo, remplacée par Brevo pour chaque destinataire. */
export const BREVO_UNSUBSCRIBE_TAG = '{{ unsubscribe }}'

/** Rotation limitée à Dog Chef et Franklin (décision du propriétaire, 2026-11-04). Elmut seulement là où il est vraiment la solution. */
export const OFFER_ROTATION: readonly OfferSlug[] = ['dog-chef', 'franklin']

const DAY = 86_400_000
const WINDOW_DAYS = 30
const FALLBACK_SLOT = 'cat-nutrition'

export interface TopFood {
  slug: string
  brand: string | null
  product: string | null
  score: number
}

export interface MonthlyInput {
  /** Articles du site (par défaut : getAllArticles()) */
  articles?: Article[]
  /** Croquette relue la mieux notée du mois (bloc masqué si null) */
  topFood?: TopFood | null
  /** Lien de désinscription (par défaut : balise Brevo {{ unsubscribe }}) */
  unsubscribeUrl?: string
}

export interface MonthlyNewsletter extends RenderedEmail {
  previewText: string
  featuredSlug: string
  guideSlugs: string[]
  offerSlug: OfferSlug
  seasonalSlug: string
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

const VERDICTS = {
  oui: { label: 'Oui', bg: COLORS.greenBg, ink: COLORS.greenInk },
  moderation: { label: 'Avec modération', bg: COLORS.amberBg, ink: COLORS.amberInk },
  danger: { label: 'Danger', bg: COLORS.roseBg, ink: COLORS.roseInk },
} as const

export const articlePath = (a: Article): string =>
  a.frontmatter.categorySlug ? `/chien/${a.frontmatter.categorySlug}/${a.slug}` : `/blog/${a.slug}`

/** Image de couverture absolue (même résolution que les cartes du site), ou null si non produite. */
export function coverUrl(a: Article): string | null {
  const slot = resolveSlot(getArticleSlot(a.slug, a.frontmatter.category))
  const ready = slot?.imageReady ? slot : resolveSlot(FALLBACK_SLOT)
  return ready?.imageReady ? siteUrl(getSlotPath(ready)) : null
}

/** Offre du mois : rotation stable sur le numéro de mois (même mois, même offre). */
export function offerForMonth(date: Date): OfferSlug {
  const index = date.getUTCFullYear() * 12 + date.getUTCMonth()
  return OFFER_ROTATION[index % OFFER_ROTATION.length]
}

const time = (a: Article): number => new Date(a.frontmatter.date).getTime()

/** Guide du mois et 4 à 6 nouveaux guides, publiés dans les 30 jours qui précèdent l'envoi. */
export function pickGuides(articles: Article[], date: Date, exclude: readonly string[] = []): { featured: Article; guides: Article[] } {
  const end = date.getTime()
  const published = articles.filter((a) => Number.isFinite(time(a)) && time(a) <= end).sort((a, b) => time(b) - time(a))
  if (published.length === 0) throw new Error('Aucun article publié avant cette date')
  const recent = published.filter((a) => time(a) >= end - WINDOW_DAYS * DAY)
  const featured = recent[0] ?? published[0]
  const rest = published.filter((a) => a.slug !== featured.slug && !exclude.includes(a.slug))
  const inWindow = rest.filter((a) => time(a) >= end - WINDOW_DAYS * DAY)
  // Priorité aux guides qui portent un verdict, puis les autres du mois, puis les plus récents avant.
  const ordered = [...inWindow.filter((a) => a.frontmatter.verdict), ...inWindow.filter((a) => !a.frontmatter.verdict)]
  const guides = ordered.slice(0, 6)
  for (const a of rest) {
    if (guides.length >= 4) break
    if (!guides.includes(a)) guides.push(a)
  }
  return { featured, guides }
}

function featuredBlocks(a: Article): EmailBlock[] {
  const url = siteUrl(articlePath(a))
  const cover = coverUrl(a)
  return [
    label('Le guide du mois'),
    ...(cover ? [image(cover, a.frontmatter.title, url, 357)] : []),
    heading(a.frontmatter.title, 1),
    paragraph(a.frontmatter.description),
    button('Lire le guide', url),
  ]
}

function guideBlocks(guides: Article[]): EmailBlock[] {
  return [
    divider(),
    label('Les nouveaux guides'),
    ...guides.map((a) => {
      const v = a.frontmatter.verdict ? VERDICTS[a.frontmatter.verdict] : undefined
      const note = a.frontmatter.verdictNote
      return linkItem(a.frontmatter.title, siteUrl(articlePath(a)), note ? `${note.charAt(0).toUpperCase()}${note.slice(1)}.` : undefined, v)
    }),
  ]
}

function topFoodBlocks(food: TopFood): EmailBlock[] {
  const name = [food.brand, food.product].filter(Boolean).join(' · ') || 'Fiche sans nom'
  return [
    divider(),
    label('La meilleure note du mois au scanner'),
    paragraph(`${name} obtient ${food.score}/100 parmi les paquets scannés ce mois-ci et relus par la rédaction.`),
    button('Voir sa fiche', siteUrl(`/croquettes/${food.slug}`)),
  ]
}

function offerBlocks(slug: OfferSlug): EmailBlock[] {
  const card = offerCard(slug, 'lettre-mensuelle')
  return card ? [divider(), label("L'offre partenaire du mois"), card] : []
}

function seasonalBlocks(articles: Article[], month: number, featuredSlug: string): { blocks: EmailBlock[]; slug: string } {
  const tip = SEASONAL_TIPS[month]
  const article = articles.find((a) => a.slug === tip.slug)
  if (!article) return { blocks: [], slug: tip.slug }
  return {
    slug: tip.slug,
    blocks: [
      divider(),
      label('Le conseil de saison'),
      paragraph(tip.text),
      ...(article.slug === featuredSlug ? [] : [linkItem(article.frontmatter.title, siteUrl(articlePath(article)))]),
    ],
  }
}

/** Lettre du mois pour un envoi à `date` (en pratique le premier mardi du mois). */
export function buildMonthlyNewsletter(date: Date, input: MonthlyInput = {}): MonthlyNewsletter {
  const articles = input.articles ?? getAllArticles()
  const month = date.getUTCMonth() + 1
  // Le guide du conseil de saison n'est pas répété dans la liste des nouveaux guides.
  const { featured, guides } = pickGuides(articles, date, [SEASONAL_TIPS[month].slug])
  const offerSlug = offerForMonth(date)
  const seasonal = seasonalBlocks(articles, month, featured.slug)
  const subject = featured.frontmatter.title
  const previewText = featured.frontmatter.description
  const rendered = renderEmail({
    subject,
    preheader: previewText,
    kicker: `Lettre de ${MONTHS[month - 1]} ${date.getUTCFullYear()}`,
    blocks: [
      ...featuredBlocks(featured),
      ...guideBlocks(guides),
      ...(input.topFood ? topFoodBlocks(input.topFood) : []),
      ...offerBlocks(offerSlug),
      ...seasonal.blocks,
    ],
    unsubscribeUrl: input.unsubscribeUrl ?? BREVO_UNSUBSCRIBE_TAG,
    reason: "Tu reçois cette lettre parce que tu t'es inscrit sur toutou-gourmet.com. Un e-mail par mois, pas plus.",
  })
  return { ...rendered, previewText, featuredSlug: featured.slug, guideSlugs: guides.map((g) => g.slug), offerSlug, seasonalSlug: seasonal.slug }
}
