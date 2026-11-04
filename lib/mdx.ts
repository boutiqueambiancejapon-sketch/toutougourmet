import { estimateReadTime as estimateReadTimeUtil } from '@/lib/utils'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content')

// @cdc seo-geo — next-mdx-remote retire les expressions JavaScript : {"< 5 kg"} ou {'Autorisés'} dans un
// article donnaient une cellule vide (30 articles, vu à l'audit mobile du 2026-11-04). Le texte est
// remis tel quel, chevrons échappés. Les attributs (nom={'…'}) ne sont pas touchés.
const TEXT_EXPRESSION = /(?<![=\w])\{\s*(?:'([^'\n{}]*)'|"([^"\n{}]*)"|`([^`\n{}]*)`)\s*\}/g

function restoreTextExpressions(mdx: string): string {
  return mdx.replace(TEXT_EXPRESSION, (_, single?: string, double?: string, tick?: string) =>
    (single ?? double ?? tick ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  )
}

// Remplace l'année de rédaction dans les titres/descriptions par l'année courante
// Ex: "Avis Royal Canin : notre test complet 2026" → "…2027" en 2027
function injectCurrentYear(frontmatter: ArticleFrontmatter): ArticleFrontmatter {
  const year = String(new Date().getFullYear())
  // Remplace uniquement l'année de rédaction en fin de titre (ex: "… 2026" → "… 2027")
  // N'affecte pas les années historiques en milieu de phrase ("depuis 2012", "fondée en 1953")
  const replaceTitle = (s: string) => s?.replace(/\b(20[2-9]\d)\s*$/, year) ?? s
  const replaceDesc  = (s: string) => s?.replace(/\b(20[2-9]\d)\b(?=\s*[.?]?\s*$)/, year) ?? s
  return { ...frontmatter, title: replaceTitle(frontmatter.title), description: replaceDesc(frontmatter.description) }
}

export interface AffiliateLink {
  /** Nom de la marque affiché en gras dans le sticky */
  name: string
  /** URL affiliée tracker (https://) ou route interne (/...) */
  url: string
  /** Phrase d'accroche sm+ — garde sous 60 chars */
  label?: string
  /** Étiquette retailer affichée à défaut de label (ex. "Maxi Zoo") */
  badge?: string
  /** Code promo affiché inline après le label */
  code?: string
  /**
   * Couleur de la pastille badge — défaut: rose.
   * `rose` (promo) · `green` (gratuit) · `blue` (info) · `amber` (nouveauté)
   */
  badgeColor?: 'rose' | 'green' | 'blue' | 'amber'
  /**
   * Ligne preuve sociale statique — visible sur tous viewports.
   * Toute séquence de ★ est colorisée en doré automatiquement.
   * Ex : "★★★★★ 4,8/5 · 7 845 avis clients"
   */
  socialProof?: string
  /**
   * Sous-label discret sous le bouton CTA — friction-removers ou promesses.
   * Ex : "Livraison gratuite · sans engagement"
   */
  subButton?: string
  /** Override du libellé du bouton — défaut: "J'en profite →" si code, "Acheter →" sinon */
  buttonLabel?: string
}

/**
 * Bloc optionnel destiné aux articles de type avis-produit.
 * Permet d'injecter un Schema.org Product (+ Review éditorial + AggregateRating)
 * dans le `<head>` SSR, et de récolter les rich snippets « étoile » côté SERP.
 *
 * Règle d'usage : `aggregateRating` ne doit refléter que des avis réels et
 * vérifiables affichés sur la page (cf. policy Google Search Central « Review
 * snippet », consolidée 2024). Toutougourmet seede ces avis manuellement.
 */
export interface ReviewFrontmatter {
  /** Nom commercial du produit testé */
  productName: string
  /** Nom de la marque (Schema.org Brand) */
  brand: string
  /** URL canonique du produit chez le fabricant (optionnelle) */
  productUrl?: string
  /** Note éditoriale Toutou Gourmet sur 10 (issue du <Verdict score={…}/>) */
  editorialRating?: number
  /** Agrégation des avis lecteurs affichés sur la page */
  aggregateRating?: {
    value: number
    count: number
    /** Note maximale (par défaut 5) */
    best?: number
  }
}

export interface ArticleFrontmatter {
  title: string
  description: string
  date: string
  updatedAt: string
  category: string
  categorySlug: string
  tags: string[]
  image: string
  author: string
  affiliateA?: AffiliateLink
  affiliateB?: AffiliateLink
  /** Optionnel — active l'injection de Product/Review/AggregateRating JSON-LD */
  review?: ReviewFrontmatter
  /** Miniature de partage : titre court et accrocheur (sinon `title`) */
  ogTitle?: string
  /** Miniature de partage : badge verdict (oui / avec modération / danger) */
  verdict?: 'oui' | 'moderation' | 'danger'
  /** Miniature de partage : précision courte à côté du badge (≈ 25 caractères) */
  verdictNote?: string
  /** Énergie pour 100 g, reprise de la valeur citée dans l'article (USDA le plus souvent) */
  kcal100?: number
}

export interface Article {
  slug: string
  frontmatter: ArticleFrontmatter
  content: string      // MDX brut pour next-mdx-remote
  rawContent: string   // même chose (alias pour compat TL;DR)
  /** Temps de lecture précalculé : présent quand le corps a été retiré (listes envoyées au navigateur). */
  readMinutes?: number
}

/** Version allégée pour les listes de cartes passées à un composant client : sans le corps MDX. */
export function toCardArticle(a: Article): Article {
  return { ...a, content: '', rawContent: '', readMinutes: estimateReadTimeUtil(a.rawContent) }
}

export function getAllArticles(): Article[] {
  const blogDir = path.join(contentDir, 'blog')
  if (!fs.existsSync(blogDir)) return []
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'))
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8')
      const { data, content } = matter(raw)
      return { slug, frontmatter: injectCurrentYear(data as ArticleFrontmatter), content: restoreTextExpressions(content), rawContent: content }
    })
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(contentDir, 'blog', `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { slug, frontmatter: injectCurrentYear(data as ArticleFrontmatter), content: restoreTextExpressions(content), rawContent: content }
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return getAllArticles().filter((a) => a.frontmatter.categorySlug === categorySlug)
}

// Extrait les items TL;DR depuis le contenu MDX brut
export function extractTldr(rawContent: string): string[] {
  const match = rawContent.match(/##?\s*TL;DR[^\n]*\n([\s\S]*?)(?=\n##)/i)
  if (!match) return []
  const items = match[1].match(/^[-*]\s+(.+)$/gm)
  return items ? items.map((i) => i.replace(/^[-*]\s+/, '')) : []
}

// Supprime la section TL;DR du contenu MDX pour éviter le doublon
export function stripTldr(content: string): string {
  return content.replace(/##?\s*TL;DR[^\n]*\n([\s\S]*?)(?=\n##)/i, '')
}

/**
 * Texte brut d'une réponse MDX pour le JSON-LD (§4.3 : texte sans balises).
 * Retire les balises, garde l'ancre des liens markdown et retire le gras.
 */
export function mdxToPlainText(mdx: string): string {
  return mdx
    .replace(/<\/?[A-Za-z][^>]*>/g, '')      // balises MDX/HTML (pas les « < 5 kg »)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // [ancre](/url) → ancre
    .replace(/\*\*(.+?)\*\*/g, '$1')          // **gras** → gras
    .replace(/\s+/g, ' ')
    .trim()
}

// Extrait les paires question/réponse des composants <FaqItem> du MDX.
// \s* avant « > » : quelques articles écrivent <FaqItem question="…" > avec une espace.
export function extractFaqs(rawContent: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []
  const regex = /<FaqItem\s+question="([^"]+)"\s*>([\s\S]*?)<\/FaqItem>/g
  let match
  while ((match = regex.exec(rawContent)) !== null) {
    const question = match[1].trim()
    const answer = mdxToPlainText(match[2])
    if (question && answer) faqs.push({ question, answer })
  }
  return faqs
}

export { estimateReadTime } from '@/lib/utils'

export interface ComparatifFrontmatter {
  title: string
  description: string
  date: string
  updatedAt: string
  brandA: string
  brandB: string
  author: string
  tags: string[]
}

export interface Comparatif {
  slug: string
  frontmatter: ComparatifFrontmatter
  content: string
  rawContent: string
}

export function getComparatif(slug: string): Comparatif | null {
  const filePath = path.join(contentDir, 'comparatifs', `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { slug, frontmatter: data as ComparatifFrontmatter, content: restoreTextExpressions(content), rawContent: content }
}
