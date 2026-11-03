import type { PageType } from '@/lib/page-type'
import type { ConversionRow, Goal } from '@/lib/server/dashboard-conversions'

// @cdc tableau de bord — phrase « À retenir » de l'accueil, calculée sur les conversions par type
// de page. Seuils bas mais réels : sous eux, une phrase qui le dit, jamais un chiffre inventé.

const NOUN: Record<PageType, { np: string; plural: boolean }> = {
  aliments: { np: 'les pages aliments', plural: true },
  urgences: { np: 'les pages urgences', plural: true },
  sante: { np: 'les pages santé', plural: true },
  'nutrition-marques': { np: 'les pages nutrition et marques', plural: true },
  races: { np: 'les pages races', plural: true },
  recettes: { np: 'les recettes', plural: true },
  outils: { np: 'les outils', plural: true },
  quiz: { np: 'le quiz', plural: false },
  scanner: { np: 'le scanner', plural: false },
  accueil: { np: 'la page d’accueil', plural: false },
  compte: { np: 'l’espace compte', plural: false },
  autre: { np: 'les autres pages', plural: true },
}

const GOAL_WORDS: Record<Goal, [string, string]> = {
  email: ['e-mail', 'e-mails'],
  clic: ['clic partenaire', 'clics partenaires'],
  compte: ['compte', 'comptes'],
}

/** Ordre de priorité : les e-mails d'abord (objectif du site), puis les clics, puis les comptes. */
const ORDER: Goal[] = ['email', 'clic', 'compte']
const MIN_GOALS = 3
const MIN_VIEWS = 100

const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })
const nf = new Intl.NumberFormat('fr-FR')

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function top(rows: ConversionRow[], value: (r: ConversionRow) => number): { row: ConversionRow; n: number; second: number } | null {
  const sorted = [...rows].sort((a, b) => value(b) - value(a))
  if (!sorted[0]) return null
  return { row: sorted[0], n: value(sorted[0]), second: sorted[1] ? value(sorted[1]) : 0 }
}

export function insightOf(rows: ConversionRow[]): string {
  const views = rows.reduce((s, r) => s + r.views, 0)
  for (const goal of ORDER) {
    const total = rows.reduce((s, r) => s + r.goals[goal], 0)
    const best = top(rows, (r) => r.goals[goal])
    if (total < MIN_GOALS || !best || best.n < 2 || best.n === best.second) continue
    const noun = NOUN[best.row.type]
    const verb = noun.plural ? 'apportent' : 'apporte'
    const share = views > 0 && best.row.views > 0 ? `, pour ${pct.format(best.row.views / views)} des pages vues` : ''
    return `${capitalize(noun.np)} ${verb} ${nf.format(best.n)} des ${nf.format(total)} ${GOAL_WORDS[goal][1]}${share}.`
  }
  const busiest = top(rows, (r) => r.views)
  if (views >= MIN_VIEWS && busiest) {
    const noun = NOUN[busiest.row.type]
    const verb = noun.plural ? 'font' : 'fait'
    return `${capitalize(noun.np)} ${verb} ${pct.format(busiest.n / views)} des pages vues. Trop peu d’e-mails, de comptes et de clics pour savoir quelles pages en rapportent.`
  }
  return 'Trop peu de visites sur la période pour en tirer une tendance.'
}
