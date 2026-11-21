import type { DayPoint, Totals } from '@/lib/seo-dash/server/gsc-core'
import { deltaOf, n0, n1, pct } from '@/lib/seo-dash/format'
import { Tile } from '../ui/Tile'

// @cdc tableau de bord SEO — 4 tuiles Search Console : clics, affichages, taux de clic, position moyenne, chacune
// contre la période de comparaison, avec sa petite courbe (comparaison en gris).

interface Props {
  cur: Totals
  prev: Totals | null
  daily: DayPoint[]
  prevDaily: DayPoint[]
  className?: string
}

export function GoogleTiles({ cur, prev, daily, prevDaily, className = 'sd-grid sd-g4 k2' }: Props) {
  const s = (k: 'clicks' | 'impressions' | 'ctr' | 'position', d: DayPoint[]) => d.map((x) => x[k])
  const pd = prev ? prevDaily : undefined
  return (
    <div className={className}>
      <Tile
        label="Clics"
        value={n0(cur.clicks)}
        delta={prev ? deltaOf(cur.clicks, prev.clicks) : null}
        against={prev ? `contre ${n0(prev.clicks)}` : undefined}
        spark={s('clicks', daily)}
        sparkPrev={pd && s('clicks', pd)}
      />
      <Tile
        label="Affichages"
        value={n0(cur.impressions)}
        delta={prev ? deltaOf(cur.impressions, prev.impressions) : null}
        against={prev ? `contre ${n0(prev.impressions)}` : undefined}
        spark={s('impressions', daily)}
        sparkPrev={pd && s('impressions', pd)}
      />
      <Tile
        label="Taux de clic"
        value={pct(cur.ctr)}
        delta={prev ? deltaOf(cur.ctr, prev.ctr, 'rate') : null}
        against={prev ? `contre ${pct(prev.ctr)}` : undefined}
        spark={s('ctr', daily)}
        sparkPrev={pd && s('ctr', pd)}
      />
      <Tile
        label="Position moyenne"
        value={n1(cur.position)}
        delta={prev ? deltaOf(cur.position, prev.position, 'position', false) : null}
        against={prev ? `contre ${n1(prev.position)}` : undefined}
        spark={s('position', daily)}
        sparkPrev={pd && s('position', pd)}
        invert
      />
    </div>
  )
}
