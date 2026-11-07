import Link from 'next/link'
import { IconChevron } from '@/components/icons'

// @cdc tableau de bord — accès depuis l'onglet Contenu à la Recherche Google (Search Console).

export function RechercheLink() {
  return (
    <Link href="/tableau-de-bord/recherche" className="mt-3 flex min-h-12 items-center gap-3 rounded-card border border-line bg-paper px-4 py-3 text-ink no-underline hover:border-line-2">
      <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-blue-bg font-display font-black text-blue-ink">G</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">Voir la recherche Google</span>
        <span className="block text-xs text-ink-2">Recherches, positions, pages presque en première page</span>
      </span>
      <IconChevron className="size-4 text-ink-2" />
    </Link>
  )
}
