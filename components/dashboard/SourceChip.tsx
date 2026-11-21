import type { Source, SourceChannel } from '@/lib/dashboard/source'

// @cdc tableau de bord — pastille de provenance d'une ligne du fil « En direct ».

const TONE: Record<SourceChannel, string> = {
  google: 'bg-green-bg text-green-ink',
  search: 'bg-green-bg text-green-ink',
  ai: 'bg-blue-bg text-blue-ink',
  social: 'bg-rose-bg text-rose-ink',
  email: 'bg-amber-bg text-amber-ink',
  other: 'bg-paper text-ink ring-1 ring-line',
  internal: 'bg-line text-ink-2',
  direct: 'bg-line text-ink-2',
}

export function SourceChip({ source }: { source: Source }) {
  const internal = source.channel === 'internal'
  return (
    <span className="inline-flex max-w-full items-baseline gap-1 align-baseline">
      <span className={`whitespace-nowrap rounded-full px-1.5 py-px text-xs font-semibold ${TONE[source.channel]}`}>
        {internal ? 'Navigation interne' : source.label}
      </span>
      {internal && source.from ? <span className="min-w-0 [overflow-wrap:anywhere] text-ink-2">depuis {source.from}</span> : null}
    </span>
  )
}
