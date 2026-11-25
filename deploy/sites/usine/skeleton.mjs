// Usine à sites — squelette d'une destination au format du lot 2 (docs/usine/format-destination.md du socle neko-voyage).
// Renvoie la liste des fichiers à écrire dans la branche usine/<id> du socle : dossier destinations/<id>/ (fiche typée,
// zones, hôtels, activités, itinéraires, parité, thème, images) et routes provisoires *.<id>.tsx (page « en préparation »,
// robots fermés en préproduction, plan du site). Les vrais gabarits d'AJ arrivent avec les agents de collecte (lot 4)
// et le passage de la destination sur les composants partagés (lot 6). Aucune donnée inventée : tout est « à compléter ».

const ROUTES = {
  en: { home: '/', guides: '/guides/', flights: '/flights/', hotels: '/hotels/', activities: '/things-to-do/', about: '/about/', method: '/about/', account: '/account/', signIn: '/sign-in/' },
  fr: { home: '/', guides: '/guides/', flights: '/vols/', hotels: '/hotels/', activities: '/activites/', about: '/a-propos/', method: '/a-propos/', account: '/mon-compte/', signIn: '/connexion/' },
};
const TEXT = {
  en: { soon: 'Coming soon', lead: 'Neko is getting this travel guide ready. The first pages are on their way.', lost: 'Page not found', back: 'Back to the home page', todo: 'To be completed' },
  fr: { soon: 'Site en préparation', lead: 'Neko prépare ce guide de voyage. Les premières pages arrivent bientôt.', lost: 'Page introuvable', back: 'Retour à l’accueil', todo: 'À compléter' },
};
const q = (s) => JSON.stringify(String(s));

/** @param {{id:string,name:string,domain:string,lang:'fr'|'en',locale:string,mirrorLang:string,mirrorLabel:string,currency:string,timezone:string,departures:string[]}} p */
export function skeleton(p, date) {
  const t = TEXT[p.lang];
  const r = ROUTES[p.lang];
  const url = `https://${p.domain}`;
  const destination = `import type { Destination } from '@/lib/dest/format'

// @usine squelette — fiche de ${p.name} créée par l'assistant « Nouveau site » du centre de contrôle le ${date}.
// Tout est à compléter par les agents de collecte (lot 4), avec une source officielle datée pour chaque fait :
// \`npm run dest:check ${p.id}\` refuse la fiche tant que les données des widgets manquent (c'est voulu).
const TODO = ${q(t.todo)}
const D = ${q(date)}

const DEST: Destination = {
  id: ${q(p.id)}, name: ${q(p.name)}, domain: ${q(url)}, lang: ${q(p.lang)}, locale: ${q(p.locale)},
  mirror: { lang: ${q(p.mirrorLang)}, label: ${q(p.mirrorLabel)} },
  currency: ${q(p.currency)}, timezone: ${q(p.timezone)}, tzLabel: TODO,
  partners: { travelpayouts: { subId: ${q(p.id)} }, programs: [] },
  airports: [],
  climate: {
    place: TODO, lat: 0, lon: 0, unit: 'C', rainUnit: 'mm', base: 0, months: [], season: [], legend: [],
    best: { c: 'var(--acc)', lbl: TODO, h3: TODO }, wxc: 'var(--acc)', monthGuide: '{M}', note: TODO,
    src: { t: TODO, u: ${q(url + '/')}, d: D }, names: [], mirror: [], letters: [],
  },
  routes: ${JSON.stringify(r).replace(/"([a-zA-Z]+)":/g, '$1: ').replace(/,/g, ', ').replace(/"/g, "'")},
  book: [['plane', TODO, TODO, ${q(r.flights)}], ['bed', TODO, TODO, ${q(r.hotels)}], ['ticket', TODO, TODO, ${q(r.activities)}]],
  fine: { hotels: [TODO, TODO, '.'], stages: TODO },
  author: { name: 'Mathias', portrait: '/img/portrait-mathias.webp' },
  legal: { operator: 'Cetani&Cie (Mathias Cetani)', address: 'Lindestraat 94, 1785 Merchtem, Belgium', company: 'BE 0683.927.006', country: 'BE', email: ${q(`contact@${p.domain}`)}, law: 'BE' },
  theme: { css: [${q(`destinations/${p.id}/theme.css`)}], tokens: ['--bg', '--acc', '--ink', '--line'], fonts: ['system-ui'] },
  features: { account: false, premium: false, neko: false, carnet: false, culture: false },
  checked: D,
}
export default DEST
`;
  const parity = { _note: "Pages de la destination comparées à la page de référence d'Ambiance Japon de même type (scripts/usine/parity.cjs). null = type de page absent.", accueil: '/', pilier: null, guides: null, vols: null, 'vols-ville': null, hotels: null, activites: null, culture: null, article: null, compte: null, premium: null };
  const usine = { id: p.id, name: p.name, domain: p.domain, lang: p.lang, locale: p.locale, mirror: { lang: p.mirrorLang, label: p.mirrorLabel }, currency: p.currency, timezone: p.timezone, departures: p.departures, created: date, by: 'assistant « Nouveau site » (centre de contrôle, onglet Usine)' };
  const imp = `import DEST from '@/destinations/${p.id}/destination'`;
  const layout = `import type { Metadata, Viewport } from 'next'
${imp}

// @usine squelette — mise en page provisoire de ${p.name} (préproduction). Remplacée par les gabarits d'Ambiance Japon (lot 6).
const STAGING = process.env.STAGING === '1'

export const metadata: Metadata = {
  metadataBase: new URL(DEST.domain),
  title: { default: DEST.name, template: \`%s · \${DEST.name}\` },
  robots: STAGING ? { index: false, follow: false } : { index: true, follow: true },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEST.lang}>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fbf8f3', color: '#1d1b19', lineHeight: 1.6 }}>{children}</body>
    </html>
  )
}
`;
  const page = `${imp}

// @usine squelette — accueil provisoire : prouve que domaine, Caddy, base, secrets et build marchent. Aucune donnée inventée.
export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '72px 24px' }}>
      <h1 style={{ fontSize: 34, lineHeight: 1.15, margin: '0 0 14px' }}>{DEST.name}</h1>
      <p style={{ margin: 0 }}>${t.soon}. ${t.lead}</p>
    </main>
  )
}
`;
  const notFound = `import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '72px 24px' }}>
      <h1 style={{ fontSize: 28, margin: '0 0 14px' }}>${t.lost}</h1>
      <p><Link href="/">${t.back}</Link></p>
    </main>
  )
}
`;
  const robots = `${imp}

// @usine squelette — robots.txt : tout fermé en préproduction (STAGING=1, lu au build) ; ouvert avec le plan du site ensuite.
export const dynamic = 'force-static'

export function GET() {
  const body = process.env.STAGING === '1'
    ? 'User-agent: *\\nDisallow: /\\n'
    : \`User-agent: *\\nAllow: /\\nDisallow: /api/\\nDisallow: /dashboard/\\n\\nSitemap: \${DEST.domain}/sitemap.xml\\n\`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
`;
  const sitemap = `${imp}

// @usine squelette — plan du site : l'accueil seulement, tant que la destination n'a pas de pages.
export const dynamic = 'force-static'

export function GET() {
  const body = \`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n  <url><loc>\${DEST.domain}/</loc><lastmod>\${DEST.checked}</lastmod></url>\\n</urlset>\\n\`
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
`;
  const theme = `/* @usine squelette — jetons de la DA de ${p.name} (mêmes noms que app/styles/neon.css d'AJ), à choisir avec le propriétaire. */
:root {
  --bg: #fbf8f3;
  --acc: #c2412d;
  --ink: #1d1b19;
  --line: #e4ddd2;
}
`;
  const llms = `# ${p.name}\n\n> ${t.soon}.\n`;
  const D = `destinations/${p.id}`;
  return [
    [`${D}/destination.ts`, destination],
    [`${D}/usine.json`, `${JSON.stringify(usine, null, 2)}\n`],
    [`${D}/zones/.gitkeep`, ''],
    [`${D}/hotels.json`, '[]\n'],
    [`${D}/activities.json`, '[]\n'],
    [`${D}/itineraries.json`, '[]\n'],
    [`${D}/parity.json`, `${JSON.stringify(parity, null, 2)}\n`],
    [`${D}/theme.css`, theme],
    [`${D}/content/guides/.gitkeep`, ''],
    [`${D}/public/img/.gitkeep`, ''],
    [`${D}/public/llms.txt`, llms],
    [`app/layout.${p.id}.tsx`, layout],
    [`app/page.${p.id}.tsx`, page],
    [`app/not-found.${p.id}.tsx`, notFound],
    [`app/robots.txt/route.${p.id}.ts`, robots],
    [`app/sitemap.xml/route.${p.id}.ts`, sitemap],
  ];
}
