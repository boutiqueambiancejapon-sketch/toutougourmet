import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { RankRow } from '@/components/scanner/rankings/RankRow'
import { remise } from '@/lib/scanner/prix'
import type { FoodNoun } from '@/lib/scanner/food-noun'
import { rankedRecipes, type RankedRecipe } from '@/lib/server/rankings'

// @cdc affiliation — promotions Maxi Zoo du moment, croisées avec les notes du scanner (décision du propriétaire du
// 2026-11-12) : seulement les produits notés 70/100 ou plus, plus forte remise d'abord. Prix du fichier Awin relevé
// chaque nuit. Ouverte à Google à partir de 5 produits.

export const revalidate = 3600
const NOTE_MIN = 70
const GROUPES: { noun: FoodNoun; titre: string }[] = [
  { noun: 'croquettes', titre: 'Croquettes en promotion' },
  { noun: 'patee', titre: 'Pâtées en promotion' },
  { noun: 'friandise', titre: 'Friandises en promotion' },
]

async function promos(): Promise<RankedRecipe[]> {
  const all = await rankedRecipes().catch(() => [])
  return all
    .filter((r) => r.score >= NOTE_MIN && r.buy?.prix && remise(r.buy.prix))
    .sort((a, b) => (remise(b.buy!.prix!) ?? 0) - (remise(a.buy!.prix!) ?? 0) || b.score - a.score)
}

export async function generateMetadata(): Promise<Metadata> {
  const n = (await promos()).length
  return {
    title: { absolute: 'Promos Maxi Zoo du moment : croquettes et pâtées bien notées | Toutou Gourmet' },
    description: 'Les promotions Maxi Zoo du jour, triées par remise, avec seulement les produits notés 70/100 ou plus par notre scanner. Prix et prix au kilo mis à jour chaque nuit.',
    alternates: { canonical: 'https://www.toutou-gourmet.com/promos-maxi-zoo' },
    robots: n >= 5 ? undefined : { index: false, follow: true },
  }
}

export default async function PromosPage() {
  const liste = await promos()
  const date = liste[0]?.buy?.prix?.releve
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-6 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Codes promo', href: '/codes-promo' }, { label: 'Promos Maxi Zoo' }]} />
      <header className="flex flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(1.9rem,5vw,2.6rem)] font-black leading-[1.05] tracking-tight text-ink">Promos Maxi Zoo du moment, seulement les produits bien notés</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">
          {`Chaque nuit, on croise les promotions de Maxi Zoo avec les notes de notre scanner. Seuls les produits notés ${NOTE_MIN}/100 ou plus apparaissent ici, la plus forte remise en premier.`}
        </p>
        <p className="m-0 text-sm text-ink-2">
          {date ? `Prix relevés le ${new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}. ` : ''}
          Les prix peuvent changer chez Maxi Zoo. La note ne dépend que de l&apos;étiquette, jamais de la promotion.
        </p>
      </header>
      {liste.length === 0 ? <p className="m-0 text-base text-ink-2">Aucun produit bien noté n&apos;est en promotion aujourd&apos;hui. Repasse demain : la liste est mise à jour chaque nuit.</p> : null}
      {GROUPES.map((g) => {
        const l = liste.filter((r) => r.noun === g.noun)
        if (!l.length) return null
        return (
          <section key={g.noun} aria-labelledby={`promo-${g.noun}`} className="flex flex-col gap-3">
            <h2 id={`promo-${g.noun}`} className="m-0 font-display text-2xl font-black text-ink">{g.titre}</h2>
            <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
              {l.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
            </ol>
          </section>
        )
      })}
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. Pour comparer sans promotion, vois nos{' '}
        <Link href="/meilleures-croquettes" className="font-semibold text-orange-ink underline underline-offset-2">classements par note</Link>.
      </p>
    </div>
  )
}
