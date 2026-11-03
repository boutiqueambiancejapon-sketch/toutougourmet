import Link from 'next/link'
import { IconClipboard } from '@/components/icons'

// @cdc fiche de garde — encart d'article (MDX <SitterSheetCta />) vers l'outil : il tient lieu
// d'encart de fin (lib/article-signup.ts › OWN_END_CTA), l'outil mène ensuite au compte.

export function SitterSheetCta() {
  return (
    <aside aria-labelledby="fiche-garde-cta" className="v2 my-8 flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_var(--orange)]">
      <p id="fiche-garde-cta" className="m-0 flex items-center gap-2 font-display text-xl font-black leading-tight text-ink">
        <IconClipboard className="size-6" />
        Sa fiche de garde, prête à envoyer
      </p>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        Poids, âge et activité suffisent pour la ration en grammes. La fiche ajoute ses friandises permises, les aliments interdits, ses
        médicaments et les numéros à appeler, puis te donne un lien privé et un PDF d&apos;une page pour le gardien.
      </p>
      <Link
        href="/outils/fiche-de-garde"
        className="inline-flex min-h-12 items-center justify-center self-start whitespace-nowrap rounded-control bg-orange px-5 text-base font-semibold text-ink no-underline hover:underline"
      >
        Remplir sa fiche de garde
      </Link>
    </aside>
  )
}
