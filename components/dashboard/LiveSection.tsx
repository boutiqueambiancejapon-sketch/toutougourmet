'use client'

import { useEffect, useState } from 'react'
import type { LiveData } from '@/lib/server/dashboard-live'
import { Panel, SectionTitle } from './Panel'
import { countryName } from '@/lib/dashboard/country'
import { Bots, Feed, MiniList, MinuteBars } from './LiveParts'

// @cdc tableau de bord — vue « En direct » : rafraîchie toutes les 10 s, en pause quand
// l'onglet est caché. Données : /tableau-de-bord/direct (protégé comme la page).
const REFRESH_MS = 10_000

export function LiveSection() {
  const [data, setData] = useState<LiveData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let timer: number | undefined
    let stopped = false
    const load = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const res = await fetch('/tableau-de-bord/direct', { cache: 'no-store' })
          if (!res.ok) throw new Error(String(res.status))
          if (!stopped) {
            setData((await res.json()) as LiveData)
            setFailed(false)
          }
        } catch {
          if (!stopped) setFailed(true)
        }
      }
      if (!stopped) timer = window.setTimeout(load, REFRESH_MS)
    }
    void load()
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(timer)
        void load()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      stopped = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <>
      <SectionTitle id="direct" title="En direct" intro="Rafraîchi toutes les 10 secondes. Pages vues envoyées par le site, robots lus dans les journaux du serveur chaque minute." />
      {failed && <p role="status" className="mt-3 text-sm text-rose-ink">Connexion perdue, nouvel essai dans 10 secondes.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="Visiteurs ces 5 dernières minutes" hint="Une personne qui ouvre 5 pages compte pour 1">
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-strong opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-3 rounded-full bg-green-strong" />
            </span>
            <span className="font-display text-5xl font-black tabular-nums text-ink">{data ? data.visitors5 : '…'}</span>
          </p>
          <div className="mt-4">{data ? <MinuteBars values={data.visitorsPerMinute} /> : null}</div>
        </Panel>
        <Panel title="Pages vues ces 5 dernières minutes">
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-strong opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-3 rounded-full bg-green-strong" />
            </span>
            <span className="font-display text-5xl font-black tabular-nums text-ink">{data ? data.views5 : '…'}</span>
          </p>
          <div className="mt-4">{data ? <MinuteBars values={data.perMinute} /> : null}</div>
        </Panel>
        <Panel title="Pages ouvertes en ce moment" hint="5 dernières minutes">
          {data ? <MiniList rows={data.pages} empty="Personne sur le site ces 5 dernières minutes." /> : null}
          {data && data.refs.length ? (
            <div className="mt-4 border-t border-line pt-3">
              <p className="mb-2 text-sm font-semibold text-ink">Arrivés depuis (30 min)</p>
              <MiniList rows={data.refs} empty="" />
            </div>
          ) : null}
        </Panel>
        <Panel title="Pays en ce moment" hint="Pages vues des 5 dernières minutes" wide>
          {data ? <MiniList rows={data.countries ?? []} format={countryName} empty="Personne sur le site ces 5 dernières minutes." /> : null}
        </Panel>
        <Panel title="Fil d'activité" hint="Les 25 dernières actions">
          {data ? <Feed items={data.feed} /> : null}
        </Panel>
        <Panel title="Robots d'IA récents" hint="30 dernières minutes">
          {data ? <Bots items={data.bots} /> : null}
        </Panel>
      </div>
    </>
  )
}
