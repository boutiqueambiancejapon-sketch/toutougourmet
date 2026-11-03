import Image from 'next/image'

// @cdc guide — aperçu des pages du livre (maquette validée) : couverture, page aliments, recette.
// Les images sont de vraies pages du PDF, capturées par scripts/build-guide.mjs à chaque
// génération (public/guides/apercu-*.webp) : l'aperçu suit toujours le contenu du livre.

const PAGES = [
  { src: '/guides/apercu-couverture.webp', alt: 'Couverture du guide de la gamelle' },
  { src: '/guides/apercu-aliments.webp', alt: 'Page Fruits : aliments autorisés, à limiter et interdits' },
  { src: '/guides/apercu-recette.webp', alt: 'Page recette des biscuits au potiron, avec les doses par poids' },
] as const

export function GuidePreview({ priority = false }: { priority?: boolean }) {
  return (
    <div className="flex justify-center gap-2.5 md:gap-4">
      {PAGES.map((p, i) => (
        <Image
          key={p.src}
          src={p.src}
          alt={p.alt}
          width={480}
          height={679}
          sizes="(min-width: 768px) 170px, 30vw"
          priority={priority && i === 0}
          className="h-auto w-[30%] max-w-[170px] rounded-tile border border-line bg-paper shadow-[3px_3px_0_var(--orange)] md:shadow-[5px_5px_0_var(--orange)]"
        />
      ))}
    </div>
  )
}
