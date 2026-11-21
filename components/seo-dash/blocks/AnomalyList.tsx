import Link from 'next/link'
import type { Anomaly } from '@/lib/seo-dash/server/anomalies'
import { StatusIcon } from '../shell/Icons'
import { Card, Empty } from '../ui/Card'

// @cdc tableau de bord SEO — « À surveiller » : chaque ligne porte une forme d'état (jamais la couleur seule) et un lien.

export function AnomalyList({ items }: { items: Anomaly[] }) {
  return (
    <Card title="À surveiller" desc="Écarts inhabituels repérés cette semaine">
      {items.length ? (
        <ul className="sd-list">
          {items.map((a) => (
            <li key={a.text}>
              <StatusIcon status={a.status} />
              <div>
                {a.text}
                <div className="m">
                  {a.meta} ·{' '}
                  <Link className="sd-lk" href={a.href}>
                    {a.hrefLabel}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Rien d’inhabituel cette semaine.</Empty>
      )}
    </Card>
  )
}
