import Link from 'next/link'
import { MiloAvatar } from '@/components/assistant/MiloAvatar'
import { TOOLS } from '@/components/outils/tool-list'
import { capByBrand, displayBrand, displayName } from '@/lib/scanner/rankings'
import { rankedRecipes, type RankedRecipe } from '@/lib/server/rankings'

// @cdc 04-pages — page 404 utile (demande du propriétaire, 2026-11-12) : « Oups », les outils, Milo, et les produits
// les mieux notés du moment avec le lien vers leur fiche. Partagée par les deux 404 du site (route inconnue et notFound()).

const OUTILS = ['scanner', 'ration', 'quiz', 'bien-nourri'] as const
const GROUPES: { noun: RankedRecipe['noun']; titre: string; n: number }[] = [
  { noun: 'croquettes', titre: 'Croquettes', n: 3 },
  { noun: 'patee', titre: 'Pâtées', n: 2 },
  { noun: 'friandise', titre: 'Friandises', n: 2 },
]
const LIEN = 'font-semibold text-orange-ink underline underline-offset-2'

export async function NotFoundFr() {
  const toutes = await rankedRecipes().catch(() => [])
  const tops = GROUPES.map((g) => ({ ...g, liste: capByBrand(toutes.filter((r) => r.noun === g.noun).sort((a, b) => b.score - a.score), 1).slice(0, g.n) })).filter((g) => g.liste.length)
  const outils = OUTILS.map((s) => TOOLS.find((t) => t.slug === s)).filter((t): t is (typeof TOOLS)[number] => Boolean(t))
  return (
    <div className="v2 mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 pt-8 pb-16 md:px-8 md:pt-12">
      <header className="flex flex-col gap-3">
        <p className="m-0 text-sm font-semibold uppercase tracking-wide text-orange-ink">Erreur 404</p>
        <h1 className="m-0 font-display text-[clamp(1.9rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">Oups, cette page s&apos;est perdue en promenade.</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">L&apos;adresse a peut-être changé ou contient une faute de frappe. Tant que tu es là, voici ce qui peut t&apos;aider.</p>
        <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-base">
          <Link href="/" className={LIEN}>Accueil</Link>
          <Link href="/chien" className={LIEN}>Tous les guides</Link>
          <Link href="/promo-croquettes-chien" className={LIEN}>Promo croquettes</Link>
        </p>
      </header>

      <section aria-labelledby="nf-outils" className="flex flex-col gap-3">
        <h2 id="nf-outils" className="m-0 font-display text-2xl font-black text-ink">Essaie nos outils</h2>
        <ul role="list" className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {outils.map((t) => (
            <li key={t.slug}>
              <Link href={t.href} className="flex h-full items-start gap-3 rounded-card border border-line bg-paper p-4 text-ink no-underline hover:border-line-2">
                <t.Icon className="mt-0.5 size-6 shrink-0 text-orange-ink" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-sm text-ink-2">{t.question}</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="sm:col-span-2">
            <Link href="/assistant" className="flex items-center gap-3 rounded-card border-2 border-ink bg-cream-2 p-4 text-ink no-underline hover:underline">
              <MiloAvatar size={40} />
              <span className="flex flex-col">
                <span className="font-semibold">Pose ta question à Milo</span>
                <span className="text-sm text-ink-2">Croquettes, ration, aliment : notre Shiba répond avec nos articles.</span>
              </span>
            </Link>
          </li>
        </ul>
      </section>

      {tops.length ? (
        <section aria-labelledby="nf-tops" className="flex flex-col gap-3">
          <h2 id="nf-tops" className="m-0 font-display text-2xl font-black text-ink">Les mieux notés en ce moment</h2>
          {tops.map((g) => (
            <div key={g.noun} className="flex flex-col gap-2">
              <h3 className="m-0 text-base font-bold text-ink">{g.titre}</h3>
              <ol role="list" className="m-0 flex list-none flex-col gap-2 p-0">
                {g.liste.map((r) => (
                  <li key={r.key} className="flex items-center justify-between gap-3 rounded-box border border-line bg-paper px-3 py-2.5">
                    <Link href={r.href} className="min-w-0 font-semibold text-ink underline underline-offset-2 [overflow-wrap:anywhere]">{`${displayBrand(r.brand)} ${displayName(r.name)}`}</Link>
                    <span className="shrink-0 rounded-pill bg-green-bg px-2.5 py-0.5 text-sm font-bold text-green-ink">{`${r.score}/100`}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <p className="m-0 text-sm text-ink-2">Notes calculées sur l&apos;étiquette par notre scanner. <Link href="/meilleures-croquettes" className={LIEN}>Voir tous les classements</Link></p>
        </section>
      ) : null}
    </div>
  )
}
