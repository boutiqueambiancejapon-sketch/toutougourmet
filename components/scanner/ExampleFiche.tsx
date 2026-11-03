import Image from 'next/image'
import { PREMIUM_LABEL } from '@/lib/scanner/fixtures'

// @cdc lot 6 — exemple de fiche de partage sur /scanner : image générée au build
// (app/(fr)/scanner/exemple-story.png) depuis une étiquette inventée, marque fictive.
// @cdc perf — affichée en 224 px (w-56) : next/image sert une version réduite en AVIF/WebP au lieu du PNG 1080×1920.

export function ExampleFiche() {
  return (
    <section aria-labelledby="exemple" className="flex flex-col gap-4">
      <h2 id="exemple" className="m-0 font-display text-2xl font-black text-ink">
        À quoi ressemble une fiche ?
      </h2>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Image
          src="/scanner/exemple-story.png"
          alt={`Exemple de fiche : ${PREMIUM_LABEL.produit} de la marque fictive ${PREMIUM_LABEL.marque}, note dans un tampon orange, points forts et QR code`}
          width={1080}
          height={1920}
          sizes="224px"
          className="h-auto w-56 shrink-0 self-center rounded-card border border-line shadow-[6px_6px_0_var(--orange)] sm:self-start"
        />
        <div className="flex flex-col gap-3 text-base leading-relaxed text-ink-2">
          <p className="m-0">
            {`Chaque produit scanné a sa fiche. Celle-ci est calculée sur une étiquette inventée (marque fictive ${PREMIUM_LABEL.marque}) : saumon et poulet en tête, ${PREMIUM_LABEL.constituants.proteines} % de protéines sur le paquet.`}
          </p>
          <p className="m-0">
            Elle se partage en image au format story, ou se télécharge en PDF d&apos;une page A4 avec le détail des 11 critères, la
            composition colorée ingrédient par ingrédient et les valeurs ramenées sur matière sèche.
          </p>
        </div>
      </div>
    </section>
  )
}
