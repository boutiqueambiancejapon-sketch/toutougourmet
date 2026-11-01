import Link from 'next/link'
import type { FoodVerdict } from '@/lib/food-verdicts'

// @cdc seo-geo §6.4 — aliments classés par verdict (danger / modération / oui), chacun vers son guide.
// Utilisé par les pages race et les pages piliers aliments.
const GROUPS: { verdict: FoodVerdict['verdict']; title: string; tone: string; mark: string }[] = [
  { verdict: 'danger', title: 'Dangereux', tone: 'bg-rose-bg', mark: '✕' },
  { verdict: 'moderation', title: 'Avec modération', tone: 'bg-amber-bg', mark: '!' },
  { verdict: 'oui', title: 'Autorisés', tone: 'bg-green-bg', mark: '✓' },
]

export function VerdictBoard({ foods, max = 18 }: { foods: FoodVerdict[]; max?: number }) {
  return (
    <div className="v2 grid grid-cols-1 gap-3 md:grid-cols-3">
      {GROUPS.map((g) => {
        const items = foods.filter((f) => f.verdict === g.verdict).slice(0, max)
        if (items.length === 0) return null
        return (
          <div key={g.verdict} className={`flex flex-col gap-2 rounded-box p-4 ${g.tone}`}>
            <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-ink">
              <span aria-hidden="true">{g.mark} </span>
              {g.title} ({items.length})
            </h3>
            <ul role="list" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {items.map((f) => (
                <li key={f.href}>
                  <Link href={f.href} className="inline-block rounded-pill bg-paper px-3 py-1 text-sm text-ink no-underline hover:underline">
                    {f.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
