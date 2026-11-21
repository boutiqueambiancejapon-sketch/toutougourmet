import type { Totals, DayPoint } from '@/lib/seo-dash/server/gsc-core'
import type { SiteKpis } from '@/lib/seo-dash/server/site'
import { dayLabel, deltaOf, eur, n0, n1 } from '@/lib/seo-dash/format'
import { Tile } from '../ui/Tile'

// @cdc tableau de bord SEO — Aujourd'hui, 5 tuiles : clics Google, visiteurs, clics partenaires, revenus estimés,
// comptes créés. Quand la période d'avant précède les premiers relevés, on dit « suivi depuis » au lieu d'un écart.

interface Props {
  gsc: { cur: Totals; prev: Totals | null; daily: DayPoint[]; prevDaily: DayPoint[] }
  site: SiteKpis
}

export function TodayTiles({ gsc, site }: Props) {
  const since = site.ranges.partial || !site.prev ? `suivi depuis le ${dayLabel(site.ranges.firstData)}` : null
  const d = (k: 'visitors' | 'clicks' | 'revenue' | 'accounts') => (site.prev ? deltaOf(site.cur[k], site.prev[k]) : null)
  const s = (k: 'visitors' | 'clicks' | 'revenue' | 'accounts') => site.daily.map((x) => x[k])
  const sp = (k: 'visitors' | 'clicks' | 'revenue' | 'accounts') => (site.prev ? site.prevDaily.map((x) => x[k]) : undefined)
  return (
    <div className="sd-grid sd-g5 k2">
      <Tile
        label="Clics Google"
        value={n0(gsc.cur.clicks)}
        delta={gsc.prev ? deltaOf(gsc.cur.clicks, gsc.prev.clicks) : null}
        against={gsc.prev ? `contre ${n0(gsc.prev.clicks)}` : undefined}
        spark={gsc.daily.map((x) => x.clicks)}
        sparkPrev={gsc.prev ? gsc.prevDaily.map((x) => x.clicks) : undefined}
      />
      <Tile label="Visiteurs du site" value={n0(site.cur.visitors)} delta={d('visitors')} against={site.prev ? `contre ${n0(site.prev.visitors)}` : undefined} note={since} spark={s('visitors')} sparkPrev={sp('visitors')} />
      <Tile
        label="Clics vers les partenaires"
        value={n0(site.cur.clicks)}
        delta={d('clicks')}
        against={site.prev ? `contre ${n0(site.prev.clicks)}` : undefined}
        note={`${since ? `${since} · ` : ''}sur ${n0(site.cur.views)} pages vues`}
      />
      <Tile label="Revenus estimés" value={eur(site.cur.revenue)} delta={d('revenue')} note={`${n1(site.cur.clients)} clients estimés`} />
      <Tile label="Comptes créés" value={n0(site.cur.accounts)} delta={d('accounts')} against={site.prev ? `contre ${n0(site.prev.accounts)}` : undefined} note={since} />
    </div>
  )
}
