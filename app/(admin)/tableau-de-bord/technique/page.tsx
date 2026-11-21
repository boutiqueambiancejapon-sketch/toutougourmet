import { n0 } from '@/lib/seo-dash/format'
import { csvHref, hrefOf } from '@/lib/seo-dash/nav'
import { openSeoPage, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { technique } from '@/lib/seo-dash/server/technique'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Tile } from '@/components/seo-dash/ui/Tile'
import { Pending } from '@/components/seo-dash/ui/Card'
import { VitalsCard } from '@/components/seo-dash/blocks/VitalsCard'
import { BrokenCard, OrphansCard, TitlesCard } from '@/components/seo-dash/blocks/TechTables'

// @cdc tableau de bord SEO — Technique : vitesse, liens et balises, ce qui freine Google sans qu'on le voie.

export const dynamic = 'force-dynamic'

export default async function TechniquePage(props: SeoPageProps) {
  const { filters: f, query } = await openSeoPage(props)
  const res = await readBlock('technique', null, (pool) => technique(pool))
  const d = res.value
  const passed = d ? d.vitals.groups.filter((g) => Object.values(g.metrics).every((s) => s && s.good >= 0.75)).length : 0
  const issues = d ? new Set(d.titles.flatMap((t) => t.pages.map((p) => p.path))).size : 0
  return (
    <SeoShell current="technique" title="Technique" sub="Vitesse, liens et balises : ce qui freine Google sans qu’on le voie" filters={f} path={hrefOf('technique')} hide={['compare', 'pages', 'device']}>
      {d ? (
        <>
          <div className="sd-grid sd-g4 k2">
            <Tile label="Core Web Vitals réussis" value={d.vitals.groups.length ? <>{passed} <small>/ {d.vitals.groups.length} groupes</small></> : '—'} note={d.vitals.groups.length ? 'mesures de nos visiteurs mobiles' : <Pending>collecte en cours</Pending>} />
            <Tile label="Liens cassés" value={n0(d.broken.length + d.robot404.length)} note={`${n0(d.broken.length)} liens internes · ${n0(d.robot404.length)} adresses vues par les robots`} />
            <Tile label="Pages orphelines" value={d.audited ? n0(d.orphans.length) : '—'} note={d.audited ? 'aucun lien interne vers elles' : <Pending>audit de nuit à venir</Pending>} />
            <Tile label="Titres et descriptions" value={d.audited ? n0(issues) : '—'} note={d.audited ? `à revoir sur ${n0(d.audited)} pages` : <Pending>audit de nuit à venir</Pending>} />
          </div>
          <div className="sd-gap">
            <VitalsCard groups={d.vitals.groups} samples={d.vitals.samples} crux={d.crux} />
          </div>
          <div className="sd-grid sd-g2 sd-gap">
            <BrokenCard d={d} csv={csvHref('liens-casses', query)} />
            <OrphansCard d={d} query={query} csv={csvHref('orphelines', query)} />
          </div>
          <div className="sd-gap">
            <TitlesCard d={d} csv={csvHref('titres', query)} />
          </div>
        </>
      ) : (
        <p className="sd-note warn">Lecture impossible pour l’instant.</p>
      )}
    </SeoShell>
  )
}
