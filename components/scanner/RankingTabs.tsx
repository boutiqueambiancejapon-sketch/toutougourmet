import Link from 'next/link'
import type { ProductKind } from '@/lib/scanner/score'

// @cdc lot 6 — onglets du classement /croquettes : aliments complets (croquettes, pâtées) et
// friandises. Deux barèmes différents : leurs notes ne se mélangent jamais dans une même liste.
// Liens simples (rendu serveur, sans JavaScript).

const TABS: { kind: ProductKind; label: string; href: string }[] = [
  { kind: 'complete', label: 'Croquettes, pâtées', href: '/croquettes' },
  { kind: 'treat', label: 'Friandises', href: '/croquettes?type=friandises' },
]

export function RankingTabs({ current, counts }: { current: ProductKind; counts: Record<ProductKind, number> }) {
  return (
    <nav aria-label="Type de produit" className="flex gap-2 border-b-2 border-ink">
      {TABS.map((t) => {
        const active = t.kind === current
        return (
          <Link
            key={t.kind}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={`-mb-0.5 inline-flex min-h-11 items-center gap-2 rounded-t-control border-2 px-4 text-[15px] font-semibold no-underline ${active ? 'border-ink border-b-cream bg-cream text-ink' : 'border-transparent text-ink-2 hover:text-ink hover:underline'}`}
          >
            {t.label}
            <span className="text-sm font-normal text-ink-2">{counts[t.kind]}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/** « Comment sont-elles notées ? » sous le classement, selon l'onglet. */
export function RankingMethod({ treat }: { treat: boolean }) {
  return (
    <section aria-labelledby="methode-classement" className="flex flex-col gap-2">
      <h2 id="methode-classement" className="m-0 font-display text-2xl font-black text-ink">
        {treat ? 'Comment les friandises sont-elles notées ?' : 'Comment les croquettes sont-elles notées ?'}
      </h2>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {`Une IA ou la base ouverte Open Pet Food Facts fournit l'étiquette, la rédaction la vérifie, puis le barème calcule la note sur ${treat ? '8 critères propres aux friandises' : '11 critères'}. Le même barème s'applique à toutes les marques, partenaires compris. Il est détaillé, sources comprises, sur la `}
        <Link href={treat ? '/scanner#methode-friandises' : '/scanner#methode'} className="font-semibold text-orange-ink underline underline-offset-2">
          page du scanner
        </Link>
        .
      </p>
    </section>
  )
}
