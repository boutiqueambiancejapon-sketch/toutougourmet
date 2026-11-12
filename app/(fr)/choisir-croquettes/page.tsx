import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FiltreForm } from '@/components/scanner/filtre/FiltreForm'
import { RankRow } from '@/components/scanner/rankings/RankRow'
import { criteresIgnores, filtreActif, filtrer, lireFiltre } from '@/lib/scanner/filtre'
import { rankedRecipes } from '@/lib/server/rankings'

// @cdc cluster scanner — « Choisir ses croquettes » : filtre multi-critères sur les notes du scanner et les prix
// Maxi Zoo (2026-11-12). La page de base est ouverte à Google ; chaque combinaison filtrée pointe vers elle (canonical)
// et reste hors index, pour ne pas créer des milliers de pages proches.

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }
const MAX = 30

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = lireFiltre(await searchParams)
  return {
    title: { absolute: 'Choisir ses croquettes : filtre par âge, taille et budget' },
    description: 'Filtre les croquettes et pâtées pour chien selon son âge, sa taille, un besoin (stérilisé, digestion, peau, allergies) et ton budget au kilo. Notes de notre scanner et prix Maxi Zoo du jour.',
    alternates: { canonical: 'https://www.toutou-gourmet.com/choisir-croquettes' },
    robots: filtreActif(f) ? { index: false, follow: true } : undefined,
  }
}

export default async function ChoisirCroquettes({ searchParams }: Props) {
  const f = lireFiltre(await searchParams)
  const tous = await rankedRecipes().catch(() => [])
  const res = filtrer(tous, f)
  const ignores = criteresIgnores(f)
  const mot = f.type === 'patee' ? 'pâtée' : 'recette de croquettes'
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-6 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Classement des croquettes', href: '/meilleures-croquettes' }, { label: 'Choisir ses croquettes' }]} />
      <header className="flex flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(1.9rem,5vw,2.6rem)] font-black leading-[1.05] tracking-tight text-ink">Choisir ses croquettes : filtre par âge, taille et budget</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">Indique ton chien et ton budget : on te montre les recettes les mieux notées par notre scanner qui correspondent, avec leur prix au kilo chez Maxi Zoo.</p>
      </header>
      <FiltreForm f={f} />
      <section aria-labelledby="resultats" className="flex flex-col gap-3">
        <h2 id="resultats" className="m-0 font-display text-2xl font-black text-ink">
          {res.length ? `${res.length > MAX ? `Les ${MAX} premières sur ${res.length}` : res.length} ${mot}${res.length > 1 ? 's' : ''} correspondent` : 'Aucune recette ne correspond'}
        </h2>
        {ignores.length ? <p className="m-0 text-sm text-ink-2">{`Pour les pâtées, le critère ${ignores.join(' et ')} n'est pas encore disponible : il n'est pas pris en compte.`}</p> : null}
        {res.length === 0 ? <p className="m-0 text-base text-ink-2">Élargis un critère, par exemple le budget ou le gabarit. Un budget au kilo ne garde que les produits dont on connaît le prix.</p> : null}
        <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">{res.slice(0, MAX).map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}</ol>
        <p className="m-0 text-sm leading-relaxed text-ink-2">
          Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. Le rang ne dépend que de l&apos;étiquette, le prix ne change jamais la note. Prix Maxi Zoo relevés chaque nuit, ils peuvent changer.{' '}
          <Link href="/promo-croquettes-chien" className="font-semibold text-orange-ink underline underline-offset-2">Voir les promos du moment</Link>
        </p>
      </section>
    </div>
  )
}
