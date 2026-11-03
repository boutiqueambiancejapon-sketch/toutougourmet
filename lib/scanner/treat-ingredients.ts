import { animalKind, isCereal, normalize } from './ingredients'
import type { TreatAlert, TreatAlertId } from './score'

// @cdc lot 6 — reconnaissance propre au barème friandise (lib/scanner/score-treat.ts) : sel,
// glycérine, farine en tête, arômes artificiels, conservateurs cités sans nom, et ingrédients
// dangereux pour le chien. Listes en français normalisé (minuscules, sans accents), quelques mots
// anglais. Le reste (sucres, colorants, espèces animales) vient de lib/scanner/ingredients.ts.
// Règles et sources : docs/v2/scanner-score.md, section « Barème friandise ».

const words = (list: string[]) => new RegExp(`(^|[^a-z])(${list.join('|')})([^a-z]|$)`)

/** Sel ajouté. « Sels minéraux » (minéraux) ne compte pas. */
const SALT = /(^|[^a-z])(sel|sel marin|sel de mer|chlorure de sodium|salt)([^a-z]|$)/
export const hasSalt = (name: string) => {
  const n = normalize(name)
  return SALT.test(n.replace(/sels? mineraux|sel(s)? de (calcium|zinc|potassium|magnesium)/g, ''))
}

const GLYCERIN = words(['glycerine', 'glycerol', 'glycerin', 'e ?422'])
export const hasGlycerin = (name: string) => GLYCERIN.test(normalize(name))

const ARTIFICIAL_FLAVOR = /(aromes?|aromatisants?) (artificiels?|de synthese|synthetiques?)|artificial flavou?rs?/
export const hasArtificialFlavor = (name: string) => ARTIFICIAL_FLAVOR.test(normalize(name))

/** Céréale, farine, amidon ou fécule d'origine végétale (« farine de poisson » est animale). */
const FLOUR = words(['farines?', 'flour', 'amidons?', 'fecules?', 'starch'])
export const isCerealOrFlour = (name: string) => isCereal(name) || (FLOUR.test(normalize(name)) && animalKind(name) === null)

/**
 * Conservateur ou antioxygène cité sans nom : « conservateurs », « antioxygènes autorisés CE »,
 * « conservateur naturel ». Un nom ou un code E derrière (« conservateur : sorbate de potassium »)
 * suffit à le nommer.
 */
const FILLER = /\b(autorises?|par|la|le|l|de|des|d|ce|cee|ue|u e|c e|naturels?|naturelles?|origine|et|technologiques?)\b/g
export function unnamedPreservative(text: string): boolean {
  const n = normalize(text)
  const m = n.match(/^(additifs? )?(technologiques? )?(conservateurs?|antioxygenes?|antioxydants?)(.*)$/)
  if (!m) return false
  const rest = m[4].replace(FILLER, ' ').replace(/[^a-z0-9]+/g, ' ').trim()
  return rest === ''
}

const ALERTS: { id: TreatAlertId; label: string; re: RegExp; text: string }[] = [
  {
    id: 'xylitol',
    label: 'Xylitol',
    re: /(^|[^a-z0-9])(xylitol|e ?967|sucre de bouleau|birch sugar)([^a-z0-9]|$)/,
    text: 'Toxique pour le chien, même en petite quantité : il fait chuter la glycémie et peut atteindre le foie. Ne pas donner ; en cas d\'ingestion, appeler un vétérinaire.',
  },
  {
    id: 'raisin',
    label: 'Raisin',
    re: words(['raisins?', 'sultanines?', 'grapes?']),
    text: 'Le raisin, frais ou sec, peut provoquer une insuffisance rénale chez le chien, sans dose sûre connue. Ne pas donner.',
  },
  {
    id: 'chocolat',
    label: 'Chocolat ou cacao',
    re: words(['chocolats?', 'cacao', 'cocoa', 'chocolate']),
    text: 'Le cacao contient de la théobromine, que le chien élimine très lentement : vomissements, troubles du rythme cardiaque. Ne pas donner.',
  },
  {
    id: 'oignon-ail',
    label: 'Oignon ou ail',
    re: words(['oignons?', 'ail', 'aulx', 'echalotes?', 'poireaux?', 'ciboulette', 'onions?', 'garlic']),
    text: 'L\'oignon, l\'ail et leurs cousins abîment les globules rouges du chien (anémie), même cuits ou en poudre.',
  },
  {
    id: 'rawhide',
    label: 'Peau de buffle ou cuir',
    re: /(^|[^a-z])(peaux? de (buffles?|boeufs?|vaches?|bovins?)|cuir|rawhide)([^a-z]|$)/,
    text: 'Un morceau avalé peut bloquer l\'œsophage ou l\'intestin. À donner sous surveillance, et à retirer quand il devient assez petit pour être avalé.',
  },
  {
    id: 'os-cuits',
    label: 'Os cuit ou fumé',
    re: /(^|[^a-z])(os (cuits?|fumes?)|os de jambon|cooked bones?|smoked bones?)([^a-z]|$)/,
    text: 'Un os cuit ou fumé se brise en éclats coupants : blessure de la bouche, de l\'intestin ou occlusion. À surveiller de près.',
  },
]

/** Ingrédients dangereux repérés dans la composition et les additifs (une alerte par type). */
export function treatAlerts(texts: string[]): TreatAlert[] {
  const out: TreatAlert[] = []
  for (const a of ALERTS) {
    // Extrait ou huile de pépins de raisin : pas le fruit, pas d'alerte.
    const found = texts.find((t) => a.re.test(normalize(t).replace(/pepins? de raisins?|grape ?seeds?/g, '')))
    if (found) out.push({ id: a.id, label: a.label, found, text: a.text })
  }
  return out
}
