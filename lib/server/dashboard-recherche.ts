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
  /** Recherche du tableau de bord : paires requête × page qui contiennent le mot ou l'adresse tapés. */
  q: string
  resultats: LigneGsc[]
  /** Recherches de 8 mots ou plus (souvent des assistants d'IA), avec la page montrée par Google. */
  longues: LigneGsc[]
}

const jour = (d: Date) => d.toISOString().slice(0, 10)

const plie = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export async function getRecherche(q = ''): Promise<RechercheData> {
  const cherche = plie(q.trim())
  const garde = (l: LigneGsc) => !cherche || l.keys.some((k) => plie(k).includes(cherche))
  const fin = new Date(Date.now() - 2 * 86_400_000)
  const debut = new Date(fin.getTime() - 27 * 86_400_000)
  const base = { debut: jour(debut), fin: jour(fin) }
  try {
    const [toutes, toutesPages, paires] = await Promise.all([
      analyseGsc(GSC_SITE, base.debut, base.fin, ['query'], 1000),
      analyseGsc(GSC_SITE, base.debut, base.fin, ['page'], 500),
      analyseGsc(GSC_SITE, base.debut, base.fin, ['query', 'page'], 5000),
    ])
    const requetes = toutes.filter(garde)
    const pages = toutesPages.filter(garde)
    const clics = toutesPages.reduce((a, r) => a + r.clicks, 0)
    const impressions = toutesPages.reduce((a, r) => a + r.impressions, 0)
    const position = impressions ? toutesPages.reduce((a, r) => a + r.position * r.impressions, 0) / impressions : null
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
      q: q.trim(),
      resultats: cherche ? paires.filter(garde).sort((a, b) => b.impressions - a.impressions).slice(0, 100) : [],
      longues: paires.filter((l) => l.keys[0].split(/\s+/).length >= 8).filter(garde).sort((a, b) => b.impressions - a.impressions).slice(0, 40),
    }
  } catch (err) {
    console.error('[tableau-de-bord] search console', err instanceof Error ? err.message : err)
    return { ok: false, ...base, clics: 0, impressions: 0, position: null, requetes: [], presque: [], peuCliquees: [], pages: [], q: q.trim(), resultats: [], longues: [] }
  }
}
