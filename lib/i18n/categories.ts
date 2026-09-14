/**
 * Mapping des catégories éditoriales FR → NL-BE.
 *
 * @cdc i18n — le slug FR reste la **clé canonique** : un article NL déclare
 * `categorySlug: <slug FR>` dans son frontmatter. Le slug NL n'existe que dans
 * l'URL publique. Ça évite de dupliquer la taxonomie et garantit que la
 * résolution de cover (`getArticleSlot`, indexée sur le FR) continue de marcher.
 */

import { categories, type Category } from '@/data/categories'
import type { Locale } from './config'

export interface NlCategory {
  /** Slug canonique côté FR — clé de jointure */
  frSlug: string
  /** Slug publié dans l'URL NL */
  slug: string
  label: string
  description: string
}

export const nlCategories: NlCategory[] = [
  {
    frSlug: 'peut-manger',
    slug: 'mag-mijn-hond-eten',
    label: 'Wat mag een hond eten?',
    description:
      'Fruit, groenten, vlees, zetmeel — welke voeding mag je hond wel en niet, met de juiste hoeveelheden en waarschuwingen.',
  },
  {
    frSlug: 'alimentation-quotidienne',
    slug: 'dagelijkse-voeding',
    label: 'Je hond goed voeden',
    description:
      'Brokken, natvoeding, verse maaltijden, BARF… Welke voeding kies je, in welke hoeveelheid en hoe vaak? Onze praktische gidsen.',
  },
  {
    frSlug: 'fruit',
    slug: 'fruit',
    label: 'Welk fruit mag een hond?',
    description:
      'Aardbeien, mango, peer, abrikoos… Welk fruit mag je hond zonder risico eten? Hoeveelheden, delen die je weglaat en verboden fruit.',
  },
  {
    frSlug: 'legumes',
    slug: 'groenten',
    label: 'Welke groenten mag een hond?',
    description:
      'Broccoli, bloemkool, paprika, witloof… Welke groenten mag je hond eten, welke laat je beter staan, en hoe bereid je ze.',
  },
  {
    frSlug: 'viandes',
    slug: 'vlees-en-vis',
    label: 'Vlees en vis voor honden',
    description:
      'Kip, rund, lam, zalm, lever… Welk vlees en welke vis mag een hond eten, rauw of gaar, en in welke hoeveelheden.',
  },
  {
    frSlug: 'urgences',
    slug: 'gevaarlijke-voeding',
    label: 'Gevaarlijke en giftige voeding voor honden',
    description:
      'Chocolade, druiven, look, gekookte botten, cashewnoten… De voeding die je hond kan vergiftigen, en wat je doet na inname.',
  },
  {
    frSlug: 'comportement-alimentaire',
    slug: 'eetgedrag',
    label: 'Mijn hond eet niet meer, eet te snel…',
    description:
      'Weigert zijn brokken, haalt het eten uit de kom, eet uitwerpselen, schrokt te snel… Eetgedrag begrijpen en bijsturen.',
  },
  {
    frSlug: 'race',
    slug: 'voeding-per-ras',
    label: 'Voeding per ras',
    description:
      'Labrador, Golden Retriever, Duitse Herder, Franse Bulldog… Voedingsadvies afgestemd op het ras van je hond.',
  },
  {
    frSlug: 'sante',
    slug: 'gezondheid',
    label: 'Voeding voor zieke honden',
    description:
      'Nierinsufficiëntie, artrose, dermatitis, kanker, hartproblemen… Welke voeding kies je bij de aandoening van je hond?',
  },
  {
    frSlug: 'avis-marques',
    slug: 'merken-reviews',
    label: 'Reviews & vergelijking',
    description:
      'Royal Canin, Hill\'s, Orijen, Farmina, Belcando… Onze volledige tests van de grote merken en gedetailleerde vergelijkingen.',
  },
]

const BY_FR_SLUG = new Map(nlCategories.map((c) => [c.frSlug, c]))
const BY_NL_SLUG = new Map(nlCategories.map((c) => [c.slug, c]))

/** Catégorie NL depuis le slug canonique FR */
export function getNlCategoryByFrSlug(frSlug: string): NlCategory | undefined {
  return BY_FR_SLUG.get(frSlug)
}

/** Catégorie NL depuis le slug publié dans l'URL NL */
export function getNlCategoryBySlug(slug: string): NlCategory | undefined {
  return BY_NL_SLUG.get(slug)
}

/** Catégorie FR correspondant à un slug d'URL NL */
export function getFrCategoryByNlSlug(slug: string): Category | undefined {
  const nl = BY_NL_SLUG.get(slug)
  if (!nl) return undefined
  return categories.find((c) => c.slug === nl.frSlug)
}

/**
 * Libellés courts de catégorie (`frontmatter.category`) traduits.
 *
 * @cdc i18n — la clé reste le libellé FR, qui est aussi la clé de
 * `CATEGORY_TABLE` dans `components/blog/blog-categories.ts`. Un article NL
 * garde donc `category:` en FR dans son frontmatter : c'est ce qui permet à la
 * cover et à l'image Open Graph de se résoudre sans mapping supplémentaire.
 * Seul l'affichage est traduit.
 */
const NL_CATEGORY_LABEL: Record<string, string> = {
  Alimentation: 'Voeding',
  'Santé': 'Gezondheid',
  'Avis & Comparatif': 'Reviews & vergelijking',
  Race: 'Ras',
  'Urgences & Intoxications': 'Noodgevallen & vergiftiging',
  Comportement: 'Gedrag',
}

export function localizeCategoryLabel(label: string, locale: Locale): string {
  if (locale === 'fr') return label
  return NL_CATEGORY_LABEL[label] ?? label
}
