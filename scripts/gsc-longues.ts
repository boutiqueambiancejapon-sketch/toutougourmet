// Questions longues de la Search Console (8 mots ou plus, souvent des assistants d'IA) pour les rédacteurs automatiques
// (demande du propriétaire, 2026-11-11). Sortie : une ligne par question, avec affichages, position et page montrée.
//   tsx scripts/gsc-longues.ts
import { GSC_SITE } from '../lib/server/dashboard-recherche'
import { analyseGsc } from '../lib/server/search-console'

const jour = (d: Date) => d.toISOString().slice(0, 10)
const fin = new Date(Date.now() - 2 * 86_400_000)
const debut = new Date(fin.getTime() - 60 * 86_400_000)
analyseGsc(GSC_SITE, jour(debut), jour(fin), ['query', 'page'], 25000)
  .then((rows) => {
    const longues = rows.filter((r) => r.keys[0].split(/\s+/).length >= 8 && r.impressions >= 2).sort((a, b) => b.impressions - a.impressions).slice(0, 40)
    for (const r of longues) console.log(`${r.impressions}× pos ${r.position.toFixed(0)} · ${r.keys[0]} → ${r.keys[1].replace('https://www.toutou-gourmet.com', '')}`)
  })
  .catch((err: unknown) => { console.error(err instanceof Error ? err.message : err); process.exit(1) })
