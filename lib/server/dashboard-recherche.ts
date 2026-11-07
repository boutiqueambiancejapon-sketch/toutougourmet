import { analyseGsc, type LigneGsc } from './search-console'

// @cdc tableau de bord — Recherche Google (Search Console, 28 jours qui finissent 2 jours avant aujourd'hui : Google
// publie ses chiffres avec retard). Opportunités : requêtes juste après la première page, et requêtes bien placées
// mais peu cliquées (titre ou description à revoir).

export const GSC_SITE = process.env.GSC_SITE || 'sc-domain:toutou-gourmet.com'

export interface RechercheData {
  ok: boolean
  debut: string
  fin: string
  clics: number
  impressions: number
  position: number | null
  requetes: LigneGsc[]
  presque: LigneGsc[]
  peuCliquees: LigneGsc[]
  pages: LigneGsc[]
}

const jour = (d: Date) => d.toISOString().slice(0, 10)

export async function getRecherche(): Promise<RechercheData> {
  const fin = new Date(Date.now() - 2 * 86_400_000)
  const debut = new Date(fin.getTime() - 27 * 86_400_000)
  const base = { debut: jour(debut), fin: jour(fin) }
  try {
    const [requetes, pages] = await Promise.all([analyseGsc(GSC_SITE, base.debut, base.fin, ['query'], 1000), analyseGsc(GSC_SITE, base.debut, base.fin, ['page'], 500)])
    const clics = pages.reduce((a, r) => a + r.clicks, 0)
    const impressions = pages.reduce((a, r) => a + r.impressions, 0)
    const position = impressions ? pages.reduce((a, r) => a + r.position * r.impressions, 0) / impressions : null
    return {
      ok: true,
      ...base,
      clics,
      impressions,
      position,
      requetes: [...requetes].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 25),
      presque: requetes.filter((r) => r.position > 7.5 && r.position <= 20 && r.impressions >= 20).sort((a, b) => b.impressions - a.impressions).slice(0, 25),
      peuCliquees: requetes.filter((r) => r.position <= 7.5 && r.impressions >= 50 && r.ctr < 0.02).sort((a, b) => b.impressions - a.impressions).slice(0, 15),
      pages: [...pages].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 20),
    }
  } catch (err) {
    console.error('[tableau-de-bord] search console', err instanceof Error ? err.message : err)
    return { ok: false, ...base, clics: 0, impressions: 0, position: null, requetes: [], presque: [], peuCliquees: [], pages: [] }
  }
}
