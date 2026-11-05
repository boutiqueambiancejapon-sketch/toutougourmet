import { controversialPreservatives, hasColorant, hasSugar, isByProduct, isCereal, normalize } from '../ingredients'
import { hasGlycerin, unnamedPreservative } from '../treat-ingredients'
import { extraireEpaDha } from './teneur'
import { MSG_CONSEIL, pasCompte, Plafond, S, total, vide, type Critere, type Entree, type Resultat } from './types'

// @cdc scanner — barème 3 : compléments, sur 100. La note juge ce qui est écrit, pas l'efficacité.
// Affichage (décision du 2026-11-05) : la note et MSG_CONSEIL, rien d'autre, aucune promesse de soin.

export interface Actif { id: string; libelle: string; re: RegExp }

/** Actifs reconnus : sert seulement à vérifier que leur teneur est écrite. */
export const ACTIFS: Actif[] = [
  { id: 'epa-dha', libelle: 'EPA et DHA', re: /\b(epa|dha)\b|acide eicosapentaenoique|huile de (poisson|saumon)|schizochytrium|krill/ },
  { id: 'moule-verte', libelle: 'Moule aux lèvres vertes', re: /moules? (verte|aux (levres|orles))|levres vertes|orles verts|\bglm\b/ },
  { id: 'sf68', libelle: 'Enterococcus faecium SF68', re: /sf ?68|enterococcus faecium/ },
  { id: 'tryptophane', libelle: 'Tryptophane ou alpha-casozépine', re: /tryptophane|casozepine/ },
  { id: 'collagene', libelle: 'Collagène ou gélatine hydrolysée', re: /collagene|gelatine/ },
  { id: 'glucosamine', libelle: 'Glucosamine et chondroïtine', re: /glucosamine|chondroitine/ },
  { id: 'curcuma', libelle: 'Curcuma', re: /curcum/ },
  { id: 'griffe', libelle: 'Griffe du diable ou boswellia', re: /griffe du diable|boswellia/ },
  { id: 'prebiotiques', libelle: 'Prébiotiques', re: /fructo.?oligo|\bfos\b|\bmos\b|mannan|inuline|psyllium|zeolithe|clinoptilolite/ },
  { id: 'plantes-calmantes', libelle: 'Plantes apaisantes', re: /melisse|passiflore|millepertuis|valeriane|camomille/ },
  { id: 'vitamines', libelle: 'Vitamines, biotine', re: /biotine|vitamines?|multi ?vitamine/ },
]

const PREMIER_NEUTRE = /(^|[^a-z])(sucres?|glycerine|farine de riz|farine d avoine|mais|huile de colza|graisses?|malt|levures?)([^a-z]|$)/
const OPAQUE = /viandes? et sous.produits|sous.produits d origine|huiles et graisses|substances minerales/

export function noteComplement(e: Entree): Resultat {
  const ing = e.ingredients
  if (ing.length === 0) return vide('complement', 'La composition manque : pas de note.')
  const textes = [...ing.map((i) => i.nom), ...e.additifs]
  const compo = normalize(textes.join(' , '))
  const chiffresTexte = `${e.tableauBrut ?? ''} ${e.mentions ?? ''}`
  const c: Critere[] = []

  // Une note ne dépend pas du champ rempli : composition, additifs, tableau et mentions sont lus de la même façon.
  const minuscules = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const segments = [
    ...ing.map((i) => `${i.nom} ${i.pourcentage !== null ? `${i.pourcentage} %` : ''}`),
    ...e.additifs,
    ...chiffresTexte.split(/[;.](?!\d)|,(?!\d)/),
  ].map(minuscules)
  const TENEUR = /\d[\d .,]*(?:\s*[x×*]\s*10\s*\^?\s*\d+|e\d+)?\s*(%|mg|mcg|µg|g\b|ui\b|ufc|cfu)/
  // EPA et DHA : seul l'extracteur compte. « huile de saumon 5 % » dit la dose d'huile, pas celle d'EPA et de DHA.
  const epaDhaTexte = [...e.additifs, chiffresTexte].join(' ; ')
  const chiffre = (a: Actif) => {
    if (a.id !== 'epa-dha') return segments.some((t) => a.re.test(t) && TENEUR.test(t))
    const x = extraireEpaDha(epaDhaTexte)
    return x.epaDhaPct !== null || x.mgParPiece !== null
  }
  const tous = ACTIFS.filter((a) => a.re.test(compo) || a.re.test(minuscules(chiffresTexte)))
  const utiles = tous.filter((a) => a.id !== 'vitamines')
  const presents = utiles.length ? utiles : tous
  const chiffres = presents.filter(chiffre)
  const part = presents.length ? chiffres.length / presents.length : 0
  // Un actif absent de notre liste est une limite du dictionnaire : le critère sort du calcul, le plafond de 60 reste.
  if (presents.length) c.push({ id: 'teneur', libelle: 'Teneur des actifs chiffrée', max: 35, points: Math.round(35 * part), explication: `${chiffres.length} actif(s) chiffré(s) sur ${presents.length} : ${presents.map((a) => a.libelle).join(', ')}.`, source: `${S.REG}, art. 13.1 : une allégation doit pouvoir être vérifiée ; points : ${S.EDITO}` })
  else c.push(pasCompte('teneur', 'Teneur des actifs chiffrée', 35, 'Actif non reconnu.', S.EDITO))
  c.push({ id: 'ration', libelle: 'Ration indiquée', max: 20, points: e.rationLue ? 20 : 0, explication: e.rationLue ? 'Une ration par poids est écrite.' : 'Aucune ration lue.', source: S.EDITO })
  const opaque = OPAQUE.test(normalize(ing.map((i) => i.nom).join(' ')))
  c.push({ id: 'composition', libelle: 'Composition nommée', max: 20, points: opaque ? 5 : 20, explication: opaque ? 'Catégories vagues dans la composition.' : 'Ingrédients nommés.', source: `Directive 82/475/CEE ; points : ${S.EDITO}` })
  const a = e.constituants
  const nb = [a.proteines, a.matieresGrasses, a.cendres, a.cellulose].filter((v) => v !== null).length
  c.push({ id: 'analyse', libelle: 'Analyse affichée', max: 10, points: nb >= 3 ? 10 : nb >= 1 ? 5 : 0, explication: `${nb} constituants sur 4.`, source: `${S.REG} ; points : ${S.EDITO}` })
  const prem = ing[0].nom
  const sucre = textes.find(hasSugar)
  const col = textes.find(hasColorant)
  const neutre = PREMIER_NEUTRE.test(normalize(prem)) || isByProduct(prem) || isCereal(prem)
  const cons = controversialPreservatives(textes)[0] ?? textes.find(unnamedPreservative)
  const gly = textes.find(hasGlycerin)
  c.push({ id: 'recette', libelle: 'Recette sans remplissage', max: 15, points: Math.max(0, 15 - (neutre ? 6 : 0) - (sucre ? 5 : 0) - (col ? 2 : 0) - (cons ? 1 : 0) - (gly ? 1 : 0)), explication: [neutre && `« ${prem.slice(0, 40)} » en tête`, sucre && 'sucre', col && 'colorant', cons && 'conservateur sans nom', gly && 'glycérine'].filter(Boolean).join(', ') || 'Rien à signaler.', source: S.EDITO })
  const pl = new Plafond()
  pl.baisser(90, 'Une étiquette complète ne prouve pas que le produit marche : note plafonnée à 90.')
  if (chiffres.length === 0) pl.baisser(60, 'Aucune teneur d\'actif affichée : note plafonnée à 60.')
  return total('complement', c, {
    fiabilite: chiffres.length && e.rationLue ? 'haute' : chiffres.length || e.rationLue ? 'moyenne' : 'faible',
    plafond: pl.v,
    message: MSG_CONSEIL,
  }, 50)
}
