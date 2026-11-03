import Image from 'next/image'
import Link from 'next/link'

// @cdc cro-carte — le guide (e-mail contre PDF) mis en avant en tête du pied de page, sur toutes les pages.
export function FooterGuide() {
  return (
    <aside
      aria-labelledby="footer-guide"
      data-cta="guide-footer"
      className="flex items-center gap-4 rounded-card border border-cream/15 bg-cream/5 p-4 md:gap-6 md:p-6"
    >
      <Image
        src="/guides/apercu-couverture.webp"
        alt="Couverture du guide de la gamelle"
        width={480}
        height={679}
        sizes="96px"
        className="h-auto w-16 shrink-0 rounded-sm shadow-[4px_4px_0_var(--orange)] md:w-24"
      />
      <div className="flex min-w-0 grow flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex flex-col gap-1">
          <p id="footer-guide" className="m-0 font-display text-lg font-black leading-tight text-cream md:text-xl">
            Le guide de la gamelle, gratuit
          </p>
          <p className="m-0 text-sm leading-snug text-cream/75">
            93 aliments classés, la page urgences pour le frigo et 6 recettes, en PDF.
          </p>
        </div>
        <Link
          href="/guide-alimentation"
          className="inline-flex min-h-11 shrink-0 items-center justify-center self-start whitespace-nowrap rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline md:self-auto"
        >
          Recevoir le guide
        </Link>
      </div>
    </aside>
  )
}
