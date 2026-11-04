import Link from 'next/link'
import { IconChevron } from '@/components/icons'
import type { AlternativesLinkData } from '@/lib/alternatives-link'

// @cdc cro-carte — lien vers les alternatives en haut d'un avis de marque non partenaire (lib/alternatives-link.ts).
export function AlternativesLink({ href, brandName }: AlternativesLinkData) {
  return (
    <p className="m-0 flex flex-wrap items-center gap-x-2 rounded-box bg-cream-2 px-3 py-1 text-[15px] text-ink-2">
      {brandName ? `Tu cherches autre chose que ${brandName} ?` : 'Tu cherches une autre marque ?'}
      <Link href={href} data-cta="alternatives-avis" className="inline-flex min-h-11 items-center gap-1 font-semibold text-orange-ink no-underline hover:underline">
        Voir les alternatives
        <IconChevron className="size-4" />
      </Link>
    </p>
  )
}
