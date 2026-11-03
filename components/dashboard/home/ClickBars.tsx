import { bucketLabel } from '@/lib/dashboard/buckets'
import type { ClickBucket } from '@/lib/server/dashboard-home'

// @cdc tableau de bord — mini-histogramme des clics partenaires, rendu serveur. Une teinte, le
// seau en cours en orange. Le détail se lit au survol (title) et en texte pour les lecteurs d'écran.

export function ClickBars({ buckets, hourly }: { buckets: ClickBucket[]; hourly: boolean }) {
  if (buckets.length === 0) return null
  const max = Math.max(1, ...buckets.map((b) => b.n))
  const summary = buckets.map((b) => `${bucketLabel(b.bucket, hourly)} : ${b.n}`).join(', ')
  return (
    <figure className="m-0">
      <div className="flex h-10 items-end gap-0.5" aria-hidden="true">
        {buckets.map((b, i) => (
          <span
            key={b.bucket}
            title={`${bucketLabel(b.bucket, hourly)} : ${b.n}`}
            className={`min-w-0 flex-1 rounded-t-sm ${i === buckets.length - 1 ? 'bg-orange' : b.n > 0 ? 'bg-amber' : 'bg-line'}`}
            style={{ height: `${Math.max((b.n / max) * 100, 6)}%` }}
          />
        ))}
      </div>
      <figcaption className="mt-1 flex justify-between text-xs tabular-nums text-ink-2">
        <span aria-hidden="true">{bucketLabel(buckets[0].bucket, hourly)}</span>
        <span className="sr-only">{`Clics ${hourly ? 'par heure' : 'par jour'} : ${summary}.`}</span>
        <span aria-hidden="true">{bucketLabel(buckets[buckets.length - 1].bucket, hourly)}</span>
      </figcaption>
    </figure>
  )
}
