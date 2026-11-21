import type { Dataset } from './datasets'
import { round } from '../format'
import { param } from './page'
import { gscAgg } from './gsc-core'
import { googleData } from './google'
import { gscRanges } from './range'

// @cdc tableau de bord SEO — jeux CSV de l'écran Google et des fiches détail (mêmes calculs que l'écran, sans coupe).

const deltaHeader = ['cle', 'clics', 'clics_avant', 'ecart', 'affichages', 'affichages_avant', 'position', 'position_avant']

export const GOOGLE_DATASETS: Record<string, Dataset> = {
  'requetes-ecarts': {
    file: 'requetes-gagnees-perdues',
    header: deltaHeader,
    rows: async (pool, f) => {
      const d = await googleData(pool, f)
      return [...d.queries.up, ...d.queries.down].map((r) => [r.key, r.clicks, r.prevClicks, r.diff, r.impressions, r.prevImpressions, round(r.position), round(r.prevPosition)])
    },
  },
  'pages-ecarts': {
    file: 'pages-hausse-baisse',
    header: deltaHeader,
    rows: async (pool, f) => {
      const d = await googleData(pool, f)
      return [...d.pages.up, ...d.pages.down].map((r) => [r.key, r.clicks, r.prevClicks, r.diff, r.impressions, r.prevImpressions, round(r.position), round(r.prevPosition)])
    },
  },
  'a-portee': {
    file: 'requetes-a-portee-de-main',
    header: ['requete', 'position', 'affichages', 'clics', 'clics_possibles_a_5pct'],
    rows: async (pool, f) => (await googleData(pool, f)).striking.rows.map((r) => [r.key, round(r.position), r.impressions, r.clicks, r.gain]),
  },
  'taux-de-clic': {
    file: 'taux-de-clic-sous-attendu',
    header: ['page', 'position', 'affichages', 'clics', 'taux', 'taux_attendu', 'clics_manques'],
    rows: async (pool, f) => (await googleData(pool, f)).lowCtr.map((r) => [r.key, round(r.position), r.impressions, r.clicks, round(r.ctr, 4), r.expected, r.missed]),
  },
  concurrence: {
    file: 'pages-en-concurrence',
    header: ['requete', 'page', 'position', 'affichages', 'clics'],
    rows: async (pool, f) => (await googleData(pool, f)).cannibals.rows.flatMap((c) => c.pages.map((p) => [c.query, p.key, round(p.position), p.impressions, p.clicks])),
  },
  essoufflement: {
    file: 'pages-qui-s-essoufflent',
    header: ['page', 'premier_mois', 'dernier_mois', 'ecart_pct', ...Array.from({ length: 13 }, (_, i) => `semaine_${i + 1}`)],
    rows: async (pool, f) => (await googleData(pool, f)).decays.map((d) => [d.page, d.first, d.last, d.pct, ...d.weeks]),
  },
  'page-requetes': {
    file: 'requetes-d-une-page',
    header: ['requete', 'position', 'affichages', 'clics', 'taux'],
    rows: async (pool, f, params) => {
      const r = await gscRanges(pool, f)
      return (await gscAgg(pool, f, r.cur, 'query', { page: param(params, 'u') })).map((q) => [q.key, round(q.position), q.impressions, q.clicks, round(q.ctr, 4)])
    },
  },
  'requete-pages': {
    file: 'pages-d-une-requete',
    header: ['page', 'position', 'affichages', 'clics', 'taux'],
    rows: async (pool, f, params) => {
      const r = await gscRanges(pool, f)
      return (await gscAgg(pool, f, r.cur, 'page', { query: param(params, 'q') })).map((q) => [q.key, round(q.position), q.impressions, q.clicks, round(q.ctr, 4)])
    },
  },
}
