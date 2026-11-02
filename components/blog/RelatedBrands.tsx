import Link from 'next/link'
import { brands, brandTone, type Brand } from '@/data/brands'

/** Hash stable d'une chaîne (djb2) : même article, mêmes marques à chaque rendu. */
function hash(seed: string): number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0
  return h
}

/**
 * Marques proposées : toutes celles qui ont une offre disponible (pas de rupture de stock),
 * en rotation selon l'article pour que chaque partenaire apparaisse, puis triées par note.
 */
function pickBrands(seed: string, count: number): Brand[] {
  const pool = brands.filter((b) => !b.stockNote)
  if (pool.length <= count) return pool
  const start = hash(seed) % pool.length
  const picked = Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length])
  return picked.sort((a, b) => b.scores.global - a.scores.global)
}

/**
 * Colonne de droite des articles : 3 marques partenaires + CTA quiz.
 */
export function RelatedBrands({ sticky = true, seed = '' }: { sticky?: boolean; seed?: string } = {}) {
  const top = pickBrands(seed, 3)

  return (
    <aside className={sticky ? 'lg:sticky lg:top-[100px] lg:self-start' : undefined}>
      <p className="m-0 mb-3 font-display text-lg font-black text-ink">Les marques qu&apos;on recommande</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {top.map((b) => {
          const tone = brandTone(b.slug)
          return (
            <li key={b.slug}>
              <Link
                href={`/chien/marque/${b.slug}`}
                className="group flex items-center gap-3 rounded-box border border-line bg-paper p-4 no-underline hover:border-line-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 mb-1 font-display text-sm font-black leading-tight" style={{ color: tone.ink }}>
                    {b.name}
                  </p>
                  <p className="m-0 text-xs leading-snug text-ink-2">{b.tagline}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-ink">{b.scores.global.toFixed(1)}/5</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="m-0 mt-2 text-xs text-ink-2">Liens partenaires sur chaque fiche marque.</p>

      <div className="mt-5 rounded-card bg-ink p-5 text-cream">
        <p className="m-0 mb-2 font-display text-lg font-black leading-tight text-cream">
          Pas sûr(e) du bon choix&nbsp;?
        </p>
        <p className="m-0 mb-4 text-sm leading-relaxed text-cream/75">
          Quelques questions sur ton chien, et on te propose la marque la plus adaptée.
        </p>
        <Link
          href="/quiz"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline"
        >
          Faire le quiz
        </Link>
      </div>
    </aside>
  )
}
