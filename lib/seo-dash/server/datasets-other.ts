import type { Dataset } from './datasets'
import type { RawParams } from '../filters'
import { exploration } from './exploration'
import { indexation } from './indexation'
import { neverCrawled } from './today'
import { param } from './page'

// @cdc tableau de bord SEO — jeux CSV des écrans Exploration, Technique, Revenus, Direct et Contenu.

const robot = (params: RawParams) => (param(params, 'robot') === 'bing' ? 'bing' : 'google')

export const OTHER_DATASETS: Record<string, Dataset> = {
  'robots-ia': {
    file: 'robots-ia',
    header: ['entreprise', 'passages'],
    rows: async (pool, f, p) => (await exploration(pool, f, robot(p))).ai.map((a) => [a.label, a.n]),
  },
  'erreurs-robots': {
    file: 'erreurs-robots',
    header: ['adresse', 'code', 'fois', 'derniere'],
    rows: async (pool, f, p) => (await exploration(pool, f, robot(p))).errors.map((e) => [e.path, e.status, e.hits, e.last]),
  },
  'jamais-vues': {
    file: 'jamais-vues-par-google',
    header: ['adresse'],
    rows: async (pool) => (await neverCrawled(pool)).paths.map((x) => [x]),
  },
  delais: {
    file: 'publication-a-google',
    header: ['article', 'adresse', 'publie', 'premier_passage_googlebot', 'premier_affichage', 'clics'],
    rows: async (pool, f, p) => (await exploration(pool, f, robot(p))).delays.map((r) => [r.title, r.path, r.date, r.crawl, r.seen, r.clicks]),
  },
  indexation: {
    file: 'indexation',
    header: ['type', 'pages', 'indexees', 'explorees_non_indexees', 'detectees_non_explorees', 'exclues'],
    rows: async (pool) => (await indexation(pool)).types.map((t) => [t.label, t.total, t.counts.indexee, t.counts.exploree, t.counts.detectee, t.counts.exclue]),
  },
}
