import type { ComponentType } from 'react'
import type { IconProps } from './Svg'
import { IconBowl, IconDog, IconSearch } from './nav-icons'
import { IconAlert, IconBone, IconBread, IconCarrot, IconFruit, IconHeart, IconPaw } from './food-icons'
import { IconBang, IconCheck, IconCross } from './mark-icons'

// Correspondances métier : rubrique → icône, verdict → marque.
const BY_CATEGORY: Record<string, ComponentType<IconProps>> = {
  'peut-manger': IconCarrot,
  'alimentation-quotidienne': IconBowl,
  alimentation: IconBowl,
  fruit: IconFruit,
  legumes: IconCarrot,
  feculents: IconBread,
  viandes: IconBone,
  urgences: IconAlert,
  'comportement-alimentaire': IconPaw,
  race: IconDog,
  sante: IconHeart,
  'avis-marques': IconSearch,
}

export function CategoryIcon({ slug, ...props }: IconProps & { slug: string }) {
  const Icon = BY_CATEGORY[slug] ?? IconPaw
  return <Icon {...props} />
}

const BY_VERDICT = { oui: IconCheck, moderation: IconBang, danger: IconCross } as const

export type VerdictKind = keyof typeof BY_VERDICT

export function VerdictIcon({ verdict, ...props }: IconProps & { verdict: VerdictKind }) {
  const Icon = BY_VERDICT[verdict]
  return <Icon {...props} />
}
