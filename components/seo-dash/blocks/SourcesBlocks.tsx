import Link from 'next/link'
import { countryName } from '@/lib/dashboard/country'
import { n0, pct0 } from '@/lib/seo-dash/format'
import { hrefOf } from '@/lib/seo-dash/nav'
import { DEVICE_KINDS, type Bucket, type FamilyRow } from '@/lib/seo-dash/server/sources'
import { Bars } from '../charts/Bars'
import { Legend } from '../charts/parts'
import { Card } from '../ui/Card'
import './sources.css'

// @cdc tableau de bord SEO — Sources : visites par famille dans le temps (colonnes empilées, ordre et couleurs fixes),
// appareils et pays par famille (barre à 100 % + texte), onglets Direct / Sources.

export function DirectTabs({ current, query }: { current: 'en-direct' | 'sources'; query: string }) {
  return (
    <nav className="sd-tabs" aria-label="Direct et sources">
      <Link href={hrefOf('en-direct', query)} aria-current={current === 'en-direct' ? 'page' : undefined}>
        En ce moment
      </Link>
      <Link href={hrefOf('sources', query)} aria-current={current === 'sources' ? 'page' : undefined}>
        Sources
      </Link>
    </nav>
  )
}

export function ChannelsCard({ families, buckets, step, csv }: { families: FamilyRow[]; buckets: Bucket[]; step: string; csv: string }) {
  const shown = families.filter((f) => f.visits > 0)
  return (
    <Card title="Visites par canal" desc={`Par ${step} · navigation interne exclue`} csv={csv}>
      <Bars
        labels={buckets.map((b) => b.label)}
        titles={buckets.map((b) => b.title)}
        series={(shown.length ? shown : families).map((f) => ({ key: f.family, label: f.label, color: f.color, values: f.spark }))}
        height={220}
        label={`Visites par canal et par ${step}`}
      />
    </Card>
  )
}

const share = (n: number, total: number) => (total > 0 ? n / total : 0)

export function SplitCard({ families, csv }: { families: FamilyRow[]; csv: string }) {
  const rows = families.filter((f) => f.visits > 0)
  return (
    <Card title="Appareils et pays par canal" desc="Appareil et pays de la première page de chaque visite" csv={csv}>
      <Legend items={DEVICE_KINDS.map((d) => ({ label: d.label, color: d.color, shape: 'box' }))} />
      <div className="sd-tw sd-split">
        <table>
          <thead>
            <tr>
              <th>Canal</th>
              <th className="num">Visites</th>
              <th>Appareils</th>
              <th>Pays principaux</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.family}>
                <td>
                  <span className="sd-fam">
                    <i style={{ background: f.color }} aria-hidden="true" />
                    {f.label}
                  </span>
                </td>
                <td className="num">{n0(f.visits)}</td>
                <td>
                  <div className="sd-stack" role="img" aria-label={DEVICE_KINDS.map((d) => `${d.label} ${pct0(share(f.devices[d.key], f.visits))}`).join(', ')}>
                    {DEVICE_KINDS.map((d) => (f.devices[d.key] ? <i key={d.key} style={{ width: `${share(f.devices[d.key], f.visits) * 100}%`, background: d.color }} /> : null))}
                  </div>
                  <span className="sd-small">
                    {DEVICE_KINDS.filter((d) => f.devices[d.key])
                      .map((d) => `${d.label} ${pct0(share(f.devices[d.key], f.visits))}`)
                      .join(' · ')}
                  </span>
                </td>
                <td className="sd-small">
                  {f.countries
                    .slice(0, 3)
                    .map((c) => `${c.code === '??' ? 'Inconnu' : countryName(c.code).split(' · ').pop()} ${pct0(share(c.n, f.visits))}`)
                    .join(' · ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/** Choix de la source dont on montre les pages d'arrivée (lien, rendu serveur). */
export function SourceChips({ items, current, hrefFor }: { items: { key: string; label: string }[]; current: string; hrefFor: (key: string) => string }) {
  return (
    <nav className="sd-chips" aria-label="Choisir une source">
      {items.map((i) => (
        <Link key={i.key} href={hrefFor(i.key)} aria-current={i.key === current ? 'true' : undefined} scroll={false}>
          {i.label}
        </Link>
      ))}
    </nav>
  )
}
