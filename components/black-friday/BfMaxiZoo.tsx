import Link from 'next/link'
import { RankRow } from '@/components/scanner/rankings/RankRow'
import { rankedRecipes } from '@/lib/server/rankings'
import { promosDuJour } from '@/lib/server/promos'

// @cdc affiliation — Black Friday Maxi Zoo : promotions réelles du fichier Awin (relevé chaque nuit), aliments notés
// 70/100 ou plus, plus forte remise d'abord. Même règle que /promo-croquettes-chien, limitée aux 12 premières.

const MAX = 12

export async function BfMaxiZoo() {
  const liste = promosDuJour(await rankedRecipes().catch(() => [])).slice(0, MAX)
  return (
    <section aria-labelledby="promos-maxi-zoo" className="flex max-w-prose flex-col gap-3" data-cta="black-friday">
      <h2 id="promos-maxi-zoo" className="m-0 font-display text-2xl font-black leading-tight text-ink md:text-3xl">
        Quelles croquettes sont en promo chez Maxi Zoo en ce moment&nbsp;?
      </h2>
      {liste.length ? (
        <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
          {liste.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
        </ol>
      ) : (
        <p className="m-0 leading-relaxed text-ink">Aucun aliment bien noté n&apos;est en promotion aujourd&apos;hui. La liste est mise à jour chaque nuit.</p>
      )}
      <p className="m-0 leading-relaxed text-ink">
        La liste complète, triée par type d&apos;aliment, est sur notre page{' '}
        <Link href="/promo-croquettes-chien" className="font-semibold text-orange-ink underline underline-offset-4 hover:text-ink">promo croquettes chien</Link>.
      </p>
    </section>
  )
}
