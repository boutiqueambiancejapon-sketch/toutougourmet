import type { Dataset } from './datasets'
import type { RawParams } from '../filters'
import { exploration } from './exploration'
import { indexation } from './indexation'
import { neverCrawled } from './today'
import { param } from './page'
import { liveSummary } from './live'
import { revenueData } from './revenue'
import { publications } from './content'
import { technique } from './technique'

// @cdc tableau de bord SEO — jeux CSV des écrans Exploration, Technique, Revenus, Direct et Contenu.

const robot = (params: RawParams) => (param(params, 'robot') === 'bing' ? 'bing' : 'google')

export const OTHER_DATASETS: Record<string, Dataset> = {
  'liens-casses': {
    file: 'liens-casses',
    header: ['adresse', 'code', 'pages_ou_passages', 'cause', 'exemple_de_page'],
    rows: async (pool) => {
      const d = await technique(pool)
      return [...d.broken.map((b) => [b.path, b.status, b.from, 'lien interne', b.example]), ...d.robot404.map((r) => [r.path, r.status, r.hits, 'robot', null])]
    },
  },
  orphelines: {
    file: 'pages-orphelines',
    header: ['page', 'type'],
    rows: async (pool) => (await technique(pool)).orphans.map((o) => [o.path, o.type]),
  },
  titres: {
    file: 'titres-descriptions',
    header: ['probleme', 'page', 'detail'],
    rows: async (pool) => (await technique(pool)).titles.flatMap((t) => t.pages.map((p) => [t.label, p.path, p.detail])),
  },
  publications: {
    file: 'articles-publies',
    header: ['titre', 'adresse', 'rubrique', 'publie', 'mis_a_jour'],
    rows: async () => publications().map((p) => [p.title, p.path, p.category, p.date, p.updatedAt]),
  },
  partenaires: {
    file: 'clics-partenaires',
    header: ['partenaire', 'clics', 'revenu_estime'],
    rows: async (pool, f) => (await revenueData(pool, f)).brands.map((b) => [b.brand, b.clicks, b.revenue === null ? null : Math.round(b.revenue)]),
  },
  'revenus-pages': {
    file: 'revenus-par-page',
    header: ['page', 'visites', 'clics_partenaires', 'clients_estimes', 'revenu_estime', 'marques'],
    rows: async (pool, f) => (await revenueData(pool, f)).pages.map((p) => [p.page, p.visits, p.clicks, Math.round(p.clients * 100) / 100, Math.round(p.revenue), p.brands.map((b) => `${b.brand} ${b.n}`).join(', ')]),
  },
  sources: {
    file: 'sources-28-jours',
    header: ['source', 'pages_vues', 'part'],
    rows: async (pool) => (await liveSummary(pool)).sources.map((s) => [s.label, s.n, Math.round(s.share * 1000) / 10]),
  },
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
