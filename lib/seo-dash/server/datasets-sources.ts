import type { Pool } from 'pg'
import type { CsvValue } from '@/lib/dashboard/csv'
import type { Filters, RawParams } from '../filters'
import { round } from '../format'
import { FAMILIES, FAMILY_LABEL } from '../source'
import type { Dataset } from './datasets'
import { param } from './page'
import { landingsOf, loadVisits, matchKey, otherEngines, per100, perVisit, sourcesData, type SourceRow } from './sources'

// @cdc tableau de bord SEO — jeux CSV de l'écran Sources (même fichier sur les trois sites), lus par les mêmes
// fonctions que l'écran, avec ses filtres.

const HEAD = ['visites', 'visites_periode_avant', 'part_pct', 'pages_par_visite', 'clics_partenaires', 'clics_pour_100_visites', 'inscriptions', 'inscriptions_pour_100_visites']

const metrics = (r: SourceRow, base: number): CsvValue[] => [
  r.visits,
  r.prev,
  base > 0 ? round((r.visits / base) * 100, 1) : null,
  round(perVisit(r) ?? 0),
  r.clicks,
  round(per100(r.clicks, r.visits) ?? 0),
  r.signups,
  round(per100(r.signups, r.visits) ?? 0),
]

async function data(pool: Pool, f: Filters) {
  const l = await loadVisits(pool, f)
  return { l, d: sourcesData(l) }
}

export const SOURCES_DATASETS: Record<string, Dataset> = {
  'sources-canaux': {
    file: 'visites-par-canal',
    header: ['periode', ...FAMILIES.map((x) => x.label)],
    rows: async (pool, f) => {
      const { d } = await data(pool, f)
      return d.buckets.map((b, i) => [b.title, ...d.families.map((x) => x.spark[i] ?? 0)])
    },
  },
  'sources-liste': {
    file: 'sources',
    header: ['canal', 'source', ...HEAD],
    rows: async (pool, f, p: RawParams) => {
      const { d } = await data(pool, f)
      const only = param(p, 'famille')
      return d.families.filter((x) => !only || x.family === only).flatMap((x) => x.rows.map((r) => [FAMILY_LABEL[r.family], r.name, ...metrics(r, d.total.visits)]))
    },
  },
  'sources-moteurs': {
    file: 'moteurs-hors-google',
    header: ['moteur', ...HEAD, 'visites_par_jour_ou_semaine'],
    rows: async (pool, f) => {
      const { d } = await data(pool, f)
      const search = d.families.find((x) => x.family === 'search')?.visits ?? 0
      return otherEngines(d).map((r) => [r.name, ...metrics(r, search), r.spark.join(' ')])
    },
  },
  'sources-arrivees': {
    file: 'pages-arrivee-par-source',
    header: ['page', ...HEAD],
    rows: async (pool, f, p: RawParams) => {
      const match = matchKey(param(p, 's') || 'search')
      if (!match) return []
      const { l } = await data(pool, f)
      const rows = landingsOf(l, match)
      const base = rows.reduce((a, r) => a + r.visits, 0)
      return rows.map((r) => [r.key, ...metrics(r, base)])
    },
  },
  'sources-appareils-pays': {
    file: 'appareils-pays-par-canal',
    header: ['canal', 'type', 'valeur', 'visites'],
    rows: async (pool, f) => {
      const { d } = await data(pool, f)
      return d.families.flatMap((x) => [
        ...Object.entries(x.devices).map(([k, n]): CsvValue[] => [x.label, 'appareil', k, n]),
        ...x.countries.map((c): CsvValue[] => [x.label, 'pays', c.code, c.n]),
      ])
    },
  },
}
