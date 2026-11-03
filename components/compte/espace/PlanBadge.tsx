import { IconSparkle } from '@/components/icons'

// @cdc compte — pastille de formule dans l'en-tête de l'espace compte.
export function PlanBadge({ premium }: { premium: boolean }) {
  if (premium) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-green px-3 py-1 text-sm font-semibold text-green-ink">
        <IconSparkle className="size-4" />
        Premium
      </span>
    )
  }
  return <span className="inline-flex shrink-0 items-center rounded-pill border border-line bg-cream-2 px-3 py-1 text-sm font-semibold text-ink-2">Gratuit</span>
}
