// @cdc tableau de bord SEO — « Les 5 actions du jour » : calcul déterministe, sans IA. Chaque signal devient une
// action chiffrée en clics par mois en jeu ; les 5 plus grosses sortent, une seule par page ou requête, et une
// action marquée « faite » se tait 30 jours (sa clé est stable d'un jour à l'autre). Deux actions au plus du même genre.

export interface Action {
  key: string
  title: string
  text: string
  why: string
  href: string
  hrefLabel: string
  /** Clics par mois en jeu (estimation), sert au classement. */
  score: number
}

export interface Signals {
  days: number
  decays: { page: string; first: number; last: number; ctr: number; position: number }[]
  lowCtr: { key: string; position: number; ctr: number; expected: number; missed: number }[]
  striking: { key: string; position: number; impressions: number; clicks: number; gain: number }[]
  strikingTotal: number
  cannibals: { query: string; impressions: number; pages: { key: string; position: number }[] }[]
  cannibalTotal: number
  neverCrawled: { total: number; sitemap: number; topGroup: string; topCount: number }
  errors404: { path: string; hits: number }[]
  errors5xx: { path: string; hits: number }[]
}

export interface Links {
  page: (path: string) => string
  query: (q: string) => string
  google: string
  exploration: string
  technique: string
}

const fr = (n: number, d = 0) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n)
const pctTxt = (r: number) => `${fr(r * 100, 1)} %`
const shortPath = (p: string) => p.split('/').filter(Boolean).pop() ?? p

export function scoreActions(s: Signals, links: Links, done: Set<string>, limit = 5): Action[] {
  const perMonth = 30 / Math.max(1, s.days)
  const out: Action[] = []
  for (const d of s.decays.slice(0, 5)) {
    const lost = (d.first - d.last) * 1
    out.push({
      key: `decay:${d.page}`,
      title: `Relancer la page « ${shortPath(d.page)} »`,
      text: `Elle a perdu ${fr(Math.round(((d.first - d.last) / Math.max(1, d.first)) * 100))} % de ses clics en 3 mois (${fr(d.first)} → ${fr(d.last)} par mois)${d.ctr ? `, taux de clic ${pctTxt(d.ctr)} en position ${fr(d.position, 1)}` : ''}.`,
      why: `Pourquoi : environ ${fr(lost)} clics perdus par mois. Mettre à jour le contenu, vérifier le titre et les pages qui la concurrencent.`,
      href: links.page(d.page),
      hrefLabel: 'Voir la page',
      score: lost,
    })
  }
  for (const c of s.lowCtr.slice(0, 5)) {
    out.push({
      key: `ctr:${c.key}`,
      title: `Revoir le titre de « ${shortPath(c.key)} »`,
      text: `Taux de clic de ${pctTxt(c.ctr)} en position ${fr(c.position, 1)}, quand on attend environ ${pctTxt(c.expected)}.`,
      why: `Environ ${fr(Math.round(c.missed * perMonth))} clics manqués par mois : un titre et une description plus clairs suffisent souvent.`,
      href: links.page(c.key),
      hrefLabel: 'Voir la page',
      score: c.missed * perMonth,
    })
  }
  const top = s.striking[0]
  if (top) {
    out.push({
      key: `striking:${top.key}`,
      title: `Renforcer la réponse « ${top.key} »`,
      text: `${fr(top.impressions)} affichages dans Google, position ${fr(top.position, 1)}, ${fr(top.clicks)} clic${top.clicks > 1 ? 's' : ''}. Une section claire en haut de page peut suffire à passer en première page.`,
      why: `${fr(s.strikingTotal)} requêtes sont dans le même cas (positions 5 à 20).`,
      href: links.query(top.key),
      hrefLabel: 'Voir la requête',
      score: top.gain * perMonth,
    })
  }
  const can = s.cannibals[0]
  if (can && can.pages.length >= 2) {
    const [a, b] = can.pages
    out.push({
      key: `cannibal:${can.query}`,
      title: `Deux pages se disputent « ${can.query} »`,
      text: `${a.key} (position ${fr(a.position, 1)}) et ${b.key} (position ${fr(b.position, 1)}) visent la même recherche. Un lien clair de l’une vers l’autre, ou un sujet mieux séparé, aide Google à choisir.`,
      why: `${fr(s.cannibalTotal)} recherches touchent plusieurs pages.`,
      href: links.query(can.query),
      hrefLabel: 'Voir',
      score: can.impressions * 0.02 * perMonth,
    })
  }
  if (s.neverCrawled.total > 0) {
    out.push({
      key: 'never-crawled',
      title: `${fr(s.neverCrawled.total)} pages du plan du site jamais visitées par Google`,
      text: `Sur ${fr(s.neverCrawled.sitemap)} adresses du plan du site, ${fr(s.neverCrawled.total)} n’ont reçu aucune visite de Googlebot, surtout ${s.neverCrawled.topGroup} (${fr(s.neverCrawled.topCount)}).`,
      why: 'Des liens internes depuis les pages qui marchent, puis IndexNow.',
      href: links.exploration,
      hrefLabel: 'Voir',
      score: s.neverCrawled.total * 0.05,
    })
  }
  const errs = [...s.errors5xx, ...s.errors404].filter((e) => e.hits >= 3).slice(0, 3)
  if (errs.length) {
    const hits = errs.reduce((a, e) => a + e.hits, 0)
    out.push({
      key: `errors:${errs.map((e) => e.path).join('|')}`,
      title: `Corriger ${errs.length > 1 ? `${fr(errs.length)} adresses introuvables` : 'une adresse introuvable'} pour Google`,
      text: `Googlebot reçoit une erreur sur ${errs.map((e) => `${e.path} (${fr(e.hits)} fois)`).join(', ')}.`,
      why: 'Petit correctif, effet immédiat sur les erreurs d’exploration.',
      href: links.technique,
      hrefLabel: 'Voir',
      score: hits * 0.5 * perMonth,
    })
  }
  // Une seule action par page ou requête, deux au plus du même genre : la liste reste variée.
  const seen = new Set<string>()
  const perKind = new Map<string, number>()
  return out
    .filter((a) => !done.has(a.key))
    .sort((a, b) => b.score - a.score)
    .filter((a) => {
      const [kind, ...rest] = a.key.split(':')
      const target = rest.join(':') || a.key
      if (seen.has(target) || (perKind.get(kind) ?? 0) >= 2) return false
      seen.add(target)
      perKind.set(kind, (perKind.get(kind) ?? 0) + 1)
      return true
    })
    .slice(0, limit)
}
