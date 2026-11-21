import Link from 'next/link'
import { SITE } from '@/lib/seo-dash/config'
import { COMPARE_LABEL, DEVICE_LABEL, filterQuery, PERIOD_LABEL, prevPeriodLabel, type CompareKey, type DeviceKey, type Filters, type PeriodKey } from '@/lib/seo-dash/filters'

// @cdc tableau de bord SEO — une rangée de filtres au-dessus de tout ce qu'elle règle (période d'abord). Menus en
// <details> : de simples liens, sans JavaScript, l'adresse garde l'état et se partage.

interface Props {
  filters: Filters
  path: string
  /** Paramètres propres à la page (ex. ?u= d'une fiche détail), gardés quand on change un filtre. */
  keep?: Record<string, string>
  /** « Google : données jusqu'au 19 nov. » */
  fresh?: string
  /** Filtres sans effet sur la page (ex. Direct) : masqués. */
  hide?: ('compare' | 'pages' | 'device')[]
}

function Menu<K extends string>({ label, value, options, href, current }: { label: string; value: string; options: [K, string][]; href: (k: K) => string; current: K }) {
  return (
    <details className="sd-sel">
      <summary>
        <span>{label}</span> <b>{value}</b>
      </summary>
      <nav className="sd-menu" aria-label={label}>
        {options.map(([k, text]) => (
          <Link key={k} href={href(k)} aria-current={k === current ? 'true' : undefined} scroll={false}>
            {text}
          </Link>
        ))}
      </nav>
    </details>
  )
}

export function FilterBar({ filters, path, keep = {}, fresh, hide = [] }: Props) {
  const go = (change: Partial<Filters>) => `${path}${filterQuery(filters, change, keep)}`
  const periods = Object.entries(PERIOD_LABEL) as [PeriodKey, string][]
  const compares: [CompareKey, string][] = [
    ['avant', prevPeriodLabel(filters.period)],
    ['annee', 'l’an dernier'],
    ['aucune', 'rien'],
  ]
  const types: [string, string][] = [['toutes', 'Toutes'], ...SITE.pageTypes.map((t): [string, string] => [t.key, t.plural])]
  const devices = Object.entries(DEVICE_LABEL) as [DeviceKey, string][]
  const compareValue = filters.compare === 'avant' ? prevPeriodLabel(filters.period) : COMPARE_LABEL[filters.compare]
  return (
    <div className="sd-filters" role="group" aria-label="Filtres de la page">
      <Menu label="Période" value={PERIOD_LABEL[filters.period]} options={periods} current={filters.period} href={(k) => go({ period: k, days: 0 })} />
      {hide.includes('compare') ? null : <Menu label="Comparer à" value={compareValue} options={compares} current={filters.compare} href={(k) => go({ compare: k })} />}
      {hide.includes('pages') ? null : (
        <Menu label="Pages" value={types.find(([k]) => k === filters.pages)?.[1] ?? 'Toutes'} options={types} current={filters.pages} href={(k) => go({ pages: k })} />
      )}
      {hide.includes('device') ? null : <Menu label="Appareil" value={DEVICE_LABEL[filters.device]} options={devices} current={filters.device} href={(k) => go({ device: k })} />}
      {fresh ? <span className="sd-fresh">{fresh}</span> : null}
    </div>
  )
}
