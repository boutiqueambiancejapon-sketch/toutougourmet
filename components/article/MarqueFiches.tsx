import Link from 'next/link'
import { marquePage } from '@/data/marque-pages'
import { ficheIndexeePath } from '@/lib/scanner/fiches-indexees'
import { fichesIndexees } from '@/lib/server/fiches-indexees'
import { titleTypo } from '@/lib/title-typo'

// @cdc seo — liens de la page mère vers chaque fiche ouverte à Google : aucune fiche indexée ne reste orpheline.

export async function MarqueFiches({ marque, dejaListees = [] }: { marque: string; dejaListees?: string[] }) {
  const page = marquePage(marque)
  const toutes = await fichesIndexees()
  const fiches = page ? toutes.filter((f) => f.actif && marquePage(f.cle.split('|')[0])?.nom === page.nom && !dejaListees.includes(f.cle)) : []
  if (fiches.length === 0) return null
  return (
    <section className="v2 not-prose my-8 flex flex-col gap-3">
      <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo(`Quelles fiches lire chez ${page?.nom} ?`)}</h2>
      <ul role="list" className="m-0 flex list-none flex-col gap-1 p-0">
        {fiches.map((f) => (
          <li key={f.court}>
            <Link href={ficheIndexeePath(f)} className="inline-block py-1 text-[15px] font-semibold text-orange-ink underline underline-offset-2">{f.nom}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
