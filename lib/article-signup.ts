import type { Root, RootContent, Heading } from 'mdast'
import { articleEndCta } from './article-cro'

// @cdc CRO compte (maquette 3A) — encart « compte » de fin d'article, juste avant la FAQ, selon
// le sujet. Urgences et aliments « danger » : aucun encart (on ne vend rien à quelqu'un qui
// s'inquiète). Pages race : l'encart race existe déjà (RaceAccountInvite), un seul par article.
// Aliments autorisés ou à limiter et recettes : le guide PDF est l'encart de fin (un seul appel à
// l'action principal, docs/v2/cro-carte.md), donc pas d'encart compte (lib/article-cro.ts).

export type ArticleSignupTopic = 'kilos' | 'poids' | 'croquettes' | 'aliments'

interface TopicInput {
  slug: string
  categorySlug: string
  verdict?: 'oui' | 'moderation' | 'danger'
  hasBreed: boolean
}

const WEIGHT = /surpoids|obes|maigrir|minceur|light|kilos|grossi/
const KIBBLE = /croquette|marque|avis|comparatif|etiquette|composition|additif|glucide|cereale/

export function articleSignupTopic({ slug, categorySlug, verdict, hasBreed }: TopicInput): ArticleSignupTopic | null {
  if (categorySlug === 'urgences' || verdict === 'danger' || hasBreed) return null
  if (articleEndCta({ slug, categorySlug, verdict }) !== null) return null
  if (WEIGHT.test(slug)) return 'kilos'
  if (categorySlug === 'avis-marques' || KIBBLE.test(slug)) return 'croquettes'
  if (categorySlug === 'sante') return 'poids'
  return 'aliments'
}

function textOf(node: RootContent): string {
  if ('value' in node && typeof node.value === 'string') return node.value
  if ('children' in node) return (node.children as RootContent[]).map(textOf).join('')
  return ''
}

const FAQ_HEADING = /questions?\s+fréquentes|faq/i

/**
 * Plugin remark : insère <ArticleSignupInvite topic="…" /> avant l'intertitre H2 de la FAQ
 * (ou avant <FaqList> sans intertitre), sinon en fin d'article.
 */
export function remarkSignupInvite({ topic }: { topic: ArticleSignupTopic }) {
  return (tree: Root) => {
    const nodes = tree.children
    const faqHeading = nodes.findLastIndex((n) => n.type === 'heading' && (n as Heading).depth === 2 && FAQ_HEADING.test(textOf(n)))
    const faqList = nodes.findIndex((n) => n.type === 'mdxJsxFlowElement' && 'name' in n && n.name === 'FaqList')
    const at = faqHeading >= 0 ? faqHeading : faqList >= 0 ? faqList : nodes.length
    const invite = {
      type: 'mdxJsxFlowElement',
      name: 'ArticleSignupInvite',
      attributes: [{ type: 'mdxJsxAttribute', name: 'topic', value: topic }],
      children: [],
    } as unknown as RootContent
    nodes.splice(at, 0, invite)
  }
}

/** Plugins remark à ajouter à l'article (aucun quand l'article ne reçoit pas d'encart). */
export function signupInvitePlugins(input: TopicInput): [typeof remarkSignupInvite, { topic: ArticleSignupTopic }][] {
  const topic = articleSignupTopic(input)
  return topic ? [[remarkSignupInvite, { topic }]] : []
}
