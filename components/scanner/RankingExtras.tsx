import Link from 'next/link'
import type { ProductKind } from '@/lib/scanner/score'
import { BRAND_MIN_REVIEWED, HOMEMADE_TREATS } from '@/lib/scanner/seo'
import type { BrandGroup } from '@/lib/server/scanner-catalog'
import { RANKING_COPY } from './ranking-copy'

// @cdc lot 6 — sections secondaires des classements : note moyenne par marque (croquettes),
// produits absents (renvoi vers le scanner, objectif compte), quantité de friandises par jour.

const LINK = 'font-semibold text-orange-ink underline underline-offset-2'
const H2 = 'm-0 font-display text-2xl font-black text-ink'
const P = 'm-0 text-[15px] leading-relaxed text-ink-2'

export function RankingBrands({ brands }: { brands: BrandGroup[] }) {
  const listed = brands.filter((b) => b.items.length >= BRAND_MIN_REVIEWED)
  if (listed.length === 0) return null
  return (
    <section aria-labelledby="marques" className="flex flex-col gap-3">
      <h2 id="marques" className={H2}>
        Quelle note pour chaque marque de croquettes ?
      </h2>
      <ul role="list" className="m-0 flex list-none flex-wrap gap-2 p-0">
        {listed.map((b) => (
          <li key={b.slug}>
            <Link href={`/croquettes/marque/${b.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line bg-paper px-4 text-[15px] font-semibold text-ink no-underline hover:border-ink">
              {b.name}
              <span className="font-normal text-ink-2">{`${b.average}/100 en moyenne`}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function RankingMissing({ kind }: { kind: ProductKind }) {
  const treat = kind === 'treat'
  return (
    <section aria-labelledby="absent" className="flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-5">
      <h2 id="absent" className={`${H2} text-xl`}>
        {treat ? "Ta friandise n'est pas dans le classement ?" : 'Tes croquettes ne sont pas dans le classement ?'}
      </h2>
      <p className={P}>
        {treat
          ? "Scanne le code-barres du paquet. Si Open Pet Food Facts connaît déjà la friandise, sa note s'affiche sans compte. Sinon, une photo de la composition suffit, avec un compte gratuit."
          : "Scanne le code-barres du sac. Si Open Pet Food Facts connaît déjà le produit, sa note s'affiche sans compte. Sinon, deux photos de l'étiquette suffisent (composition et constituants), avec un compte gratuit."}
      </p>
      <p className="m-0">
        <Link href="/scanner" className="inline-flex min-h-12 items-center whitespace-nowrap rounded-control bg-ink px-5 font-semibold text-cream no-underline hover:underline">
          {RANKING_COPY[kind].scanLabel}
        </Link>
      </p>
      {treat ? null : (
        <p className={P}>
          {'Pour lire un sac sans scanner, notre guide pour '}
          <Link href="/chien/alimentation-quotidienne/comprendre-etiquette-croquettes-chien" className={LINK}>
            comprendre l&apos;étiquette des croquettes
          </Link>
          {' explique chaque ligne, et celui sur le '}
          <Link href="/chien/alimentation-quotidienne/glucides-croquettes-chien" className={LINK}>
            taux de glucides des croquettes
          </Link>
          {' montre le calcul.'}
        </p>
      )}
    </section>
  )
}

export function TreatQuantity() {
  return (
    <section aria-labelledby="combien" className="flex flex-col gap-2">
      <h2 id="combien" className={H2}>
        Combien de friandises donner à son chien par jour ?
      </h2>
      <p className={P}>
        Les friandises ne doivent pas dépasser 10 % de l&apos;apport calorique quotidien du chien (FEDIAF). Quand l&apos;étiquette
        donne les calories, la fiche du scanner traduit ce plafond en nombre de friandises par jour selon le gabarit, et une
        friandise qui contient du xylitol, du raisin ou du chocolat déclenche une alerte.
      </p>
      <p className={P}>
        {'Pour des récompenses sans additif, notre '}
        <Link href="/chien/alimentation-quotidienne/friandises-naturelles-chien-guide" className={LINK}>
          guide des friandises naturelles pour chien
        </Link>
        {' liste les bons choix, et deux recettes maison partent de la viande ou du poisson : '}
        {HOMEMADE_TREATS.map((t, i) => (
          <span key={t.href}>
            {i > 0 ? ' et ' : ''}
            <Link href={t.href} className={LINK}>
              {t.label}
            </Link>
          </span>
        ))}
        .
      </p>
    </section>
  )
}
