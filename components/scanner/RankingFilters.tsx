import Link from 'next/link'
import type { Band } from '@/lib/scanner/score'
import { BAND_FILTERS } from '@/lib/scanner/seo'

// @cdc lot 6 — filtres des classements (/croquettes, /croquettes/friandises) : formulaire GET,
// sans JavaScript (rendu serveur). `base` : adresse du classement filtré.

const select = 'min-h-12 w-full rounded-control border-2 border-ink bg-paper px-3 text-base text-ink outline-none focus-visible:ring-4 focus-visible:ring-amber'

export function RankingFilters({ brands, brand, band, base, category = '' }: { brands: { slug: string; name: string }[]; brand: string; band: Band | null; base: string; category?: string }) {
  return (
    <form method="get" action={base} aria-label="Filtrer le classement" className="grid grid-cols-2 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
      {category ? <input type="hidden" name="categorie" value={category} /> : null}
      <label className="flex min-w-0 flex-col gap-1.5 text-sm font-semibold text-ink">
        Marque
        <select name="marque" defaultValue={brand} className={select}>
          <option value="">Toutes</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-0 flex-col gap-1.5 text-sm font-semibold text-ink">
        Note
        <select name="note" defaultValue={band ?? ''} className={select}>
          <option value="">Toutes</option>
          {BAND_FILTERS.map((f) => (
            <option key={f.band} value={f.band}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
        <button type="submit" className="min-h-12 rounded-control bg-ink px-5 font-semibold text-cream hover:underline">
          Filtrer
        </button>
        {brand || band ? (
          <Link href={base} className="text-sm text-ink-2 underline underline-offset-2">
            Tout afficher
          </Link>
        ) : null}
      </div>
    </form>
  )
}
