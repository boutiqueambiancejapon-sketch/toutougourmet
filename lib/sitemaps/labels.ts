import { categories } from '@/data/categories'
import { brands } from '@/data/brands'
import { getAllArticles, getComparatif } from '@/lib/mdx'

// @cdc seo — libellés du plan du site, pour chaque adresse des sitemaps (lib/sitemaps/entries.ts).
// Le plan est généré depuis les sitemaps : une page ajoutée au sitemap y apparaît d'elle-même.

const STATIC_LABELS: Record<string, string> = {
  '/': 'Accueil',
  '/quiz': 'Le test : quelle marque pour mon chien ?',
  '/comparateur': 'Comparateur de marques',
  '/scanner': 'Scanner de croquettes',
  '/scanner/alternative-yuka-animaux': 'Alternative à Yuka pour les croquettes',
  '/guide-alimentation': 'Le guide de la gamelle, en PDF gratuit',
  '/premium': 'Compte Premium',
  '/outils': 'Tous les calculateurs',
  '/outils/age': 'Âge de mon chien en âge humain',
  '/outils/bien-nourri': 'Bilan : mon chien est-il bien nourri ?',
  '/outils/budget': 'Budget alimentation par marque',
  '/outils/cout': 'Coût sur un an, croquettes ou repas frais',
  '/outils/fiche-de-garde': 'Fiche de garde à imprimer',
  '/outils/poids': 'Poids de forme',
  '/outils/ration': 'Ration journalière',
  '/a-propos': 'À propos de Toutou Gourmet',
  '/auteurs/mathias-c': 'Mathias C., auteur',
  '/plan-du-site': 'Plan du site',
  '/chien': 'Tous les guides',
  '/blog': 'Tous les articles',
  '/chien/marque': 'Les marques',
  '/chien/marque/comparatif': 'Comparatif des marques',
  '/codes-promo': 'Codes promo pour chien',
  '/promos-maxi-zoo': 'Promos Maxi Zoo du moment',
  '/codes-promo/dog-chef': 'Code promo Dog Chef',
  '/codes-promo/dogfy-diet': 'Code promo Dogfy Diet',
  '/codes-promo/elmut': 'Code promo Elmut',
  '/codes-promo/franklin': 'Code promo Franklin Pet Food',
  '/codes-promo/ultra-premium-direct': 'Code promo Ultra Premium Direct',
}

/** Libellé lisible d'une adresse du sitemap ; à défaut, le dernier segment de l'adresse. */
export function makeLabeler(): (path: string) => string {
  const titles = new Map(getAllArticles().map((a) => [`/chien/${a.frontmatter.categorySlug}/${a.slug}`, a.frontmatter.title]))
  const names = new Map(brands.map((b) => [b.slug, b.name]))
  return (path) => {
    const known = STATIC_LABELS[path] ?? titles.get(path)
    if (known) return known
    const [, root, section, slug] = path.split('/')
    if (root === 'chien' && !slug) return categories.find((c) => c.slug === section)?.label ?? section
    if (root === 'chien' && section === 'marque' && slug) {
      if (names.has(slug)) return names.get(slug) as string
      const duel = slug.split('-vs-')
      if (duel.length === 2) return getComparatif(slug)?.frontmatter.title ?? `${names.get(duel[0]) ?? duel[0]} ou ${names.get(duel[1]) ?? duel[1]}`
    }
    return path.split('/').filter(Boolean).at(-1) ?? path
  }
}
