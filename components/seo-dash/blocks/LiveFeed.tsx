'use client'

import { useEffect, useState } from 'react'
import type { LiveData } from '@/lib/server/dashboard-live'
import { countryName } from '@/lib/dashboard/country'

// @cdc tableau de bord SEO — fil « En direct », rafraîchi toutes les 10 s (en pause quand l'onglet est caché), même
// source de données que l'ancienne vue (/tableau-de-bord/direct). Chaque ligne : heure, page, appareil, pays, source.

const REFRESH_MS = 10_000
const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
const DEVICE: Record<string, string> = { mobile: 'mobile', desktop: 'ordinateur', tablet: 'tablette' }
const KIND: Record<string, string> = { ai_training: 'entraînement', ai_search: 'moteur IA', ai_user: 'lecture demandée' }
const DOT: Record<string, string> = { google: 'var(--sd-s2)', search: 'var(--sd-s2)', ai: 'var(--sd-s4)', social: 'var(--sd-s3)', email: 'var(--sd-s3)', direct: 'var(--sd-prev)', other: 'var(--sd-prev)', internal: 'var(--sd-line-2)' }

export function LiveFeed() {
  const [data, setData] = useState<LiveData | null>(null)
  const [failed, setFailed] = useState(false)
  const [bots, setBots] = useState(false)
  useEffect(() => {
    let timer: number | undefined
    let stopped = false
    const load = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const res = await fetch('/tableau-de-bord/direct', { cache: 'no-store' })
          if (res.status === 401) window.location.assign('/tableau-de-bord/connexion')
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
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [])
  const pages = (data?.feed ?? []).filter((e) => e.name === 'Pageview' || e.name === 'Affiliate Click')
  return (
    <section className="sd-card">
      <div className="sd-hd">
        <div>
          <h2>En direct</h2>
          <p>Chaque ligne : heure, page, appareil, pays et d’où vient la personne · mis à jour toutes les 10 s</p>
        </div>
        <div className="sd-seg" role="group" aria-label="Personnes ou robots">
          <button type="button" aria-pressed={!bots} onClick={() => setBots(false)}>Personnes</button>
          <button type="button" aria-pressed={bots} onClick={() => setBots(true)}>Robots</button>
        </div>
      </div>
      {failed ? <p className="sd-note warn">Connexion perdue, nouvel essai dans 10 secondes.</p> : null}
      {!data ? <p className="sd-empty">Chargement…</p> : null}
      <ul className="sd-live">
        {bots
          ? data?.bots.map((b, i) => (
              <li key={`${b.ts}-${i}`}>
                <span className="sd-muted">{time.format(new Date(b.ts))}</span>
                <span className="u">
                  {b.path}
                  <span className="m">{KIND[b.kind] ?? b.kind}</span>
                </span>
                <span className="sd-src">{b.label}</span>
              </li>
            ))
          : pages.map((e, i) => (
              <li key={`${e.ts}-${i}`}>
                <span className="sd-muted">{time.format(new Date(e.ts))}</span>
                <span className="u">
                  {e.name === 'Affiliate Click' ? `Clic partenaire ${e.detail ?? ''} · ` : ''}
                  {e.page}
                  <span className="m">
                    {[e.device ? (DEVICE[e.device] ?? e.device) : null, e.country ? countryName(e.country) : null].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="sd-src">
                  <i style={{ background: DOT[e.source.channel] ?? 'var(--sd-prev)' }} />
                  {e.source.label}
                </span>
              </li>
            ))}
      </ul>
      {data && !bots && !pages.length ? <p className="sd-empty">Personne sur le site ces dernières minutes.</p> : null}
    </section>
  )
}
