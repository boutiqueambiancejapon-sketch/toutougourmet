import Link from 'next/link'
import { GUIDE_PAGE_PATH } from '@/lib/guide/config'

// @cdc guide — urgences et aliments « danger » : rien à vendre dans le corps de l'article. Tout en
// bas, après la FAQ, un lien discret vers le guide, qui contient la page à coller sur le frigo.

export function GuideFicheLink() {
  return (
    <p data-guide-on-page className="v2 mt-10 border-t border-line pt-4 text-[15px] text-ink-2 print:hidden">
      <Link href={GUIDE_PAGE_PATH} className="font-semibold text-ink underline underline-offset-2">
        Fiche frigo à imprimer
      </Link>{' '}
      : les gestes et les numéros antipoison sur une page, dans notre guide gratuit.
    </p>
  )
}
