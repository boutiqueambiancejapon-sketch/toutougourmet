import { normalize } from '../ingredients'
import type { Entree } from './types'

// @cdc scanner — sécurité : passe avant tout barème, même règle pour tous les types.

export interface Securite { zero: { raison: string } | null; plafond: { valeur: number; raison: string } | null; alertes: string[] }

const TOXIQUES: { nom: string; re: RegExp; texte: string }[] = [
  { nom: 'Xylitol', re: /(^|[^a-z0-9])(xylit\w*|xilitol|e[ -]?967|sucre de bouleau|birch sugar|birkenzucker)([^a-z0-9]|$)/, texte: 'toxique pour le chien, même en petite quantité.' },
  { nom: 'Raisin', re: /(^|[^a-z])(raisins?|sultanines?|sultaninen?|grapes?|grapeseed|rosinen?|(?:wein)?trauben?\w*|uvas?|pasas)([^a-z]|$)/, texte: 'peut provoquer une insuffisance rénale chez le chien, sans dose sûre connue.' },
  { nom: 'Chocolat ou cacao', re: /(^|[^a-z])(chocolats?|cacao|cocoa|chocolate|theobromine|schokolad\w*|kakao\w*|cioccolato)([^a-z]|$)/, texte: 'le chien élimine très lentement la théobromine.' },
  { nom: 'Macadamia', re: /(^|[^a-z])macadamia\w*([^a-z]|$)/, texte: 'provoque faiblesse, vomissements et fièvre chez le chien.' },
]
const ALLIUM = /(^|[^a-z])(oignons?|ail|aulx|echalotes?|poireaux?|ciboulette|onions?|garlic|knoblauch\w*|zwiebel\w*|barlauch\w*|schnittlauch|ajo|cebollas?|aglio|cipolla)([^a-z]|$)/
const A_RELIRE = /extraits?|extract|extrakt|estratto|seed|kern|aromes?|aromas?|flavou?r|pepins?|polyphenols?|proanthocyan/

/** Retire « sans chocolat », « sans gluten » : la négation porte sur un mot, pas sur le reste de la liste. */
const sansNegation = (t: string) => t.replace(/\b(sans|without|free from|ohne|sin|senza)\s+(?:(?:ajouts?|traces?)\s+d[e ]\s*)?[a-z-]+(?:\s+(?:ni|ou)\s+[a-z-]+)*/g, ' ')
/** À relire seulement si chaque citation du toxique partage son segment avec un mot d'extrait ou d'arôme. */
const formeARelire = (t: string, re: RegExp) => [...t.matchAll(new RegExp(re.source, 'g'))].every((m) => {
  const i = m.index ?? 0
  const deb = Math.max(...[',', ';', '(', ')', '[', ']'].map((c) => t.lastIndexOf(c, i))) + 1
  const f = t.slice(i + 1).search(/[,;()[\]]/)
  return A_RELIRE.test(t.slice(deb, f < 0 ? t.length : i + 1 + f))
})
/** Le sucre de raisin est du glucose, dans toutes les langues. */
const nettoyer = (brut: string) => sansNegation(normalize(brut)).replace(/sucres? de raisins?|traubenzucker|grape sugar|azucar de uva|zucchero d uva/g, ' ')

export function securite(e: Pick<Entree, 'ingredients' | 'additifs'>): Securite {
  const items = [
    ...e.ingredients.map((i, rang) => ({ t: nettoyer(i.nom), brut: i.nom, rang, pct: i.pourcentage })),
    ...e.additifs.map((a) => ({ t: nettoyer(a), brut: a, rang: 99, pct: null as number | null })),
  ]
  const res: Securite = { zero: null, plafond: null, alertes: [] }
  const baisser = (valeur: number, raison: string) => { if (!res.plafond || valeur < res.plafond.valeur) res.plafond = { valeur, raison } }
  for (const x of TOXIQUES) {
    const trouve = items.filter((i) => x.re.test(i.t))
    if (!trouve.length) continue
    const net = trouve.filter((i) => !formeARelire(i.t, x.re))
    if (net.length) {
      res.zero ??= { raison: `${x.nom} : ne pas donner.` }
      res.alertes.push(`${x.nom} (« ${net[0].brut.slice(0, 60)} ») : ${x.texte} Ne pas donner, et appeler un vétérinaire en cas d'ingestion.`)
    } else {
      baisser(50, `${x.nom} cité sous forme d'extrait ou d'arôme : à relire.`)
      res.alertes.push(`${x.nom} cité sous forme d'extrait ou d'arôme (« ${trouve[0].brut.slice(0, 60)} ») : à relire sur l'emballage.`)
    }
  }
  // Oignon et ail : rang et pourcentage. Parmi les 3 premiers ou à 5 % et plus : note 0. Ailleurs : plafond 45. Seuils : choix éditorial.
  const allium = items.filter((i) => ALLIUM.test(i.t))
  if (allium.length) {
    const fort = allium.find((i) => !formeARelire(i.t, ALLIUM) && (i.rang < 3 || (i.pct !== null && i.pct >= 5)))
    if (fort) {
      res.zero ??= { raison: 'Oignon ou ail en quantité notable : ne pas donner.' }
      res.alertes.push(`Oignon ou ail (« ${fort.brut.slice(0, 60)} ») : abîme les globules rouges du chien, même cuit ou en poudre.`)
    } else {
      baisser(45, 'Oignon ou ail en petite quantité : note plafonnée à 45.')
      res.alertes.push(`Oignon ou ail en fin de liste (« ${allium[0].brut.slice(0, 60)} ») : la toxicité dépend de la dose, à vérifier avec un vétérinaire.`)
    }
  }
  if (items.some((i) => /(^|[^a-z])(houblon|hops?|humulus)([^a-z]|$)/.test(i.t))) res.alertes.push('Houblon : des intoxications sont décrites chez le chien. À vérifier avec un vétérinaire avant de donner.')
  return res
}
