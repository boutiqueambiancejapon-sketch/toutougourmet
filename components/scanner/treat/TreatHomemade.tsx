import Link from 'next/link'
import { ALTERNATIVE_BELOW, HOMEMADE_TREATS } from '@/lib/scanner/seo'

// @cdc lot 6 — fiche d'une friandise notée sous 55/100 : pas de marque partenaire de friandises,
// on propose nos recettes de friandises maison (viande ou poisson en premier ingrédient).

export function TreatHomemade({ score }: { score: number | null }) {
  if (score === null || score >= ALTERNATIVE_BELOW) return null
  const [a, b] = HOMEMADE_TREATS
  return (
    <section aria-labelledby="maison" className="flex flex-col gap-2">
      <h2 id="maison" className="m-0 font-display text-2xl font-black text-ink">
        Par quoi remplacer cette friandise ?
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        {'Une recette maison se passe de sucre, de sel et d\'additifs. Les '}
        <Link href={a.href} className="font-semibold text-orange-ink underline underline-offset-2">
          {a.label}
        </Link>
        {' n\'ont qu\'un ingrédient. Les '}
        <Link href={b.href} className="font-semibold text-orange-ink underline underline-offset-2">
          {b.label}
        </Link>
        {' en ont six, sans céréales.'}
      </p>
    </section>
  )
}
