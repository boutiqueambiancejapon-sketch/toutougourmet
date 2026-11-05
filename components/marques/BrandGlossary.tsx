import Link from 'next/link'
import { MARQUE_PAGES } from '@/data/marque-pages'

// @cdc seo — glossaire de /chien/marque : seulement des marques qui ont une page indexable.

export function BrandGlossary() {
  const lettres = new Map<string, typeof MARQUE_PAGES>()
  for (const m of [...MARQUE_PAGES].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))) lettres.set(m.nom[0], [...(lettres.get(m.nom[0]) ?? []), m])
  return (
    <section aria-labelledby="marques-a-z" className="flex flex-col gap-4">
      <h2 id="marques-a-z" className="m-0 font-display text-2xl font-black text-ink">Toutes nos marques de A à Z</h2>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {[...lettres].map(([lettre, marques]) => (
          <div key={lettre} className="flex flex-col gap-1">
            <p className="m-0 font-display text-lg font-black text-ink">{lettre}</p>
            {marques.map((m) => (
              <Link key={m.href} href={m.href} className="py-1 text-[15px] font-semibold text-orange-ink underline underline-offset-2">{m.nom}</Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
