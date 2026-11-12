import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { RankRow } from '@/components/scanner/rankings/RankRow'
import { dateReleve } from '@/lib/scanner/prix'
import { marquesPromo } from '@/lib/server/promos'

// @cdc affiliation — promo d'une marque vendue chez Maxi Zoo (stratégie du 2026-11-12) : promotions du jour, puis
// recettes de la moins chère à la plus chère au kilo. Pas de code promo inventé.

export const revalidate = 3600
type Params = { params: Promise<{ marque: string }> }

const trouver = async (slug: string) => (await marquesPromo()).find((m) => m.slug === slug)

export async function generateStaticParams() {
  return (await marquesPromo()).map((m) => ({ marque: m.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = await trouver((await params).marque)
  if (!m) return { robots: { index: false, follow: false } }
  return {
    title: { absolute: `Promo croquettes ${m.nom} : prix et offres du moment` },
    description: `Promotions ${m.nom} du jour chez Maxi Zoo et prix au kilo de chaque recette, de la moins chère à la plus chère, avec la note de notre scanner. Mis à jour chaque nuit.`,
    alternates: { canonical: `https://www.toutou-gourmet.com/promo-croquettes-chien/${m.slug}` },
  }
}

export default async function PromoMarque({ params }: Params) {
  const m = await trouver((await params).marque)
  if (!m) notFound()
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-6 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Promo croquettes chien', href: '/promo-croquettes-chien' }, { label: m.nom }]} />
      <header className="flex flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(1.9rem,5vw,2.6rem)] font-black leading-[1.05] tracking-tight text-ink">{`Promo croquettes ${m.nom} : prix et offres du moment`}</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">
          {m.promos.length
            ? `${m.promos.length} recette${m.promos.length > 1 ? 's' : ''} ${m.nom} en promotion chez Maxi Zoo aujourd'hui. Plus bas, toutes ses recettes de la moins chère à la plus chère au kilo.`
            : `Pas de promotion ${m.nom} chez Maxi Zoo aujourd'hui. Voici ses recettes de la moins chère à la plus chère au kilo, avec la note de notre scanner.`}
        </p>
        <p className="m-0 text-sm text-ink-2">
          {m.releve ? `Prix Maxi Zoo relevés le ${dateReleve({ prix: 0, prixKg: null, prixAncien: null, releve: m.releve })}, ils peuvent changer. ` : ''}
          {`Il n'existe pas de code promo ${m.nom} chez nous : on ne publie que des offres vérifiées. `}
          <Link href={m.avis} className="font-semibold text-orange-ink underline underline-offset-2">{`Notre avis sur ${m.nom}`}</Link>
        </p>
      </header>
      {m.promos.length ? (
        <section aria-labelledby="promos" className="flex flex-col gap-3">
          <h2 id="promos" className="m-0 font-display text-2xl font-black text-ink">{`Quelles recettes ${m.nom} sont en promotion ?`}</h2>
          <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">{m.promos.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}</ol>
        </section>
      ) : null}
      {([['croquettes', 'Quelles croquettes', m.croquettes], ['patees', 'Quelles pâtées', m.patees]] as const).map(([id, q, liste]) =>
        liste.length ? (
          <section key={id} aria-labelledby={`kilo-${id}`} className="flex flex-col gap-3">
            <h2 id={`kilo-${id}`} className="m-0 font-display text-2xl font-black text-ink">{`${q} ${m.nom} coûtent le moins cher au kilo ?`}</h2>
            <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">{liste.slice(0, 15).map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}</ol>
          </section>
        ) : null,
      )}
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. La note ne dépend que de l&apos;étiquette.{' '}
        <Link href="/promo-croquettes-chien" className="font-semibold text-orange-ink underline underline-offset-2">Toutes les promos bien notées</Link>
      </p>
    </div>
  )
}
