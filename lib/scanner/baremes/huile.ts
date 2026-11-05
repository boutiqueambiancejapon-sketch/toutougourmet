import { normalize } from '../ingredients'
import { ALERTE_LIMITE_NRC, ALERTE_MORUE, NRC_LIMITE_10KG } from './alertes'
import { extraireEpaDha } from './teneur'
import { fmt, MSG_CONSEIL, pasCompte, Plafond, S, total, vide, type Critere, type Entree, type Resultat } from './types'

// @cdc scanner — barème 4 : huiles, sur 100. Le calcul de ration ne donne jamais de dose à viser.
// Affichage (décision du 2026-11-05) : la note et MSG_CONSEIL, rien d'autre, aucune promesse de soin.

const POISSON_GRAS = /saumon|sardine|anchois|hareng|maquereau|krill|salmon/
const MORUE = /foie|morue|cod liver/
/** Valeurs NRC via Bauer 2011 pour un chien de 10 kg. Servent au calcul, pas à conseiller une dose. */
const NRC_APPORT_10KG = 170

export function noteHuile(e: Entree): Resultat {
  if (e.ingredients.length === 0) return vide('huile', 'La composition manque : pas de note.')
  const compo = normalize(e.ingredients.map((i) => i.nom).join(' '))
  const nomP = normalize(e.produit ?? '')
  const m = normalize(`${e.mentions ?? ''} ${e.tableauBrut ?? ''}`)
  const texte = `${compo} ${nomP} ${m}`
  const add = normalize(e.additifs.join(' '))
  const c: Critere[] = []
  const brut = `${e.produit ?? ''} ${e.ingredients.map((i) => i.nom).join(' ')}`.toLowerCase()
  const morue = MORUE.test(`${compo} ${nomP}`) || /cod liver/.test(brut)
  const poisson = !morue && (POISSON_GRAS.test(compo) || (POISSON_GRAS.test(nomP) && /poisson|huile/.test(compo)))
  const generique = !morue && !poisson && /huile de poisson/.test(compo)
  const algue = /algues?|schizochytrium/.test(`${compo} ${nomP}`)
  // Toute huile sans poisson, krill, algue ni morue est végétale, et le nom du produit compte autant que la composition.
  const vegetale = !poisson && !morue && !generique && !algue && !/poisson|fish|krill|omega.?3/.test(`${compo} ${nomP} ${brut}`)
  c.push({ id: 'source', libelle: 'Espèce et source', max: 15, points: poisson ? 15 : algue ? 12 : morue ? 10 : generique ? 8 : vegetale ? 4 : 2, explication: poisson ? 'Poisson gras nommé.' : algue ? 'Huile d\'algue : du DHA, sans poisson.' : morue ? 'Foie de morue : riche en vitamines A et D.' : generique ? 'Poisson sans espèce.' : vegetale ? 'Huile végétale : pas d\'EPA ni de DHA, le chien convertit peu l\'ALA.' : 'Source peu claire.', source: `${S.FEDIAF} ; ${S.BAUER} ; points : ${S.EDITO}` })

  const alertes: string[] = []
  const t = extraireEpaDha(`${e.tableauBrut ?? ''} ${e.mentions ?? ''}`)
  const cite = /\b(epa|dha)\b|omega.?3/.test(texte)
  const complet = t.epaDhaPct !== null && !t.partiel
  const pts = vegetale ? 0 : complet && t.separe ? 30 : complet ? 22 : t.epaDhaPct !== null ? 14 : t.omega3Pct !== null ? 12 : cite ? 6 : 0
  c.push({ id: 'epa-dha', libelle: 'EPA et DHA chiffrés', max: 30, points: pts, explication: vegetale ? 'Aucun EPA ni DHA à attendre.' : complet && t.separe ? 'EPA et DHA chiffrés séparément.' : complet ? `${fmt(t.epaDhaPct ?? 0)} % d'EPA et DHA annoncés ensemble.` : t.epaDhaPct !== null ? 'Un seul des deux est chiffré.' : t.omega3Pct !== null ? `${fmt(t.omega3Pct)} % d'oméga-3, sans dire la part d'EPA et de DHA.` : cite ? 'Oméga-3 cités sans chiffre.' : 'Rien d\'écrit.', source: S.BAUER })

  // Pas de point de dose sans EPA + DHA.
  if (vegetale || !complet || !e.ration10kgG) c.push(pasCompte('ration-nrc', 'Ration comparée à l\'apport NRC', 15, vegetale ? 'Sans objet pour une huile végétale.' : 'EPA + DHA ou ration manquants : critère sorti du calcul.', S.BAUER))
  else {
    const mg = (e.ration10kgG * (t.epaDhaPct ?? 0) * 1000) / 100
    if (mg > NRC_LIMITE_10KG) alertes.push(ALERTE_LIMITE_NRC)
    const p = mg > NRC_LIMITE_10KG ? 5 : mg >= NRC_APPORT_10KG ? 15 : mg >= NRC_APPORT_10KG / 2 ? 8 : 3
    c.push({ id: 'ration-nrc', libelle: 'Ration comparée à l\'apport NRC', max: 15, points: p, explication: `Pour un chien de 10 kg, la ration écrite apporte environ ${Math.round(mg)} mg d'EPA et DHA par jour, ${mg > NRC_LIMITE_10KG ? 'au-dessus de la limite haute NRC' : mg >= NRC_APPORT_10KG ? 'au moins l\'apport NRC' : 'moins que l\'apport NRC'}. Pas un conseil de dose.`, source: S.BAUER })
  }

  const analyse = /metaux lourds|\bpcb\b|dioxines?|mercure|certificat d analyse|\bifos\b|friend of the sea|\bmsc\b|\basc\b/.test(texte)
  const sauvage = /(saumon|poisson)[^.]{0,40}sauvage|sauvage[^.]{0,40}(saumon|poisson)/.test(texte)
  const origine = sauvage || /norveg|baltique|fjord|atlantique|\bpeches?\b|elevages?/.test(texte)
  c.push({ id: 'purete', libelle: 'Pureté et origine', max: 15, points: vegetale ? (origine ? 5 : 0) + (/presse?e? a froid|biologique/.test(texte) ? 10 : 0) : (analyse ? 10 : 0) + (origine ? 5 : 0), explication: `${analyse ? 'Analyse ou certification citée' : 'Aucune analyse citée'}, origine ${origine ? 'indiquée' : 'non indiquée'}.`, source: S.EDITO })

  const nomme = /tocopherol|vitamine e|romarin|acide ascorbique|e ?30[67]/.test(`${texte} ${add}`)
  const vague = /antioxy/.test(`${texte} ${add}`)
  const indice = /peroxyde|anisidine|totox/.test(texte)
  c.push({ id: 'oxydation', libelle: 'Protection contre le rancissement', max: 15, points: (nomme ? 8 : vague ? 4 : 0) + (indice ? 7 : 0), explication: `Antioxydant ${nomme ? 'nommé' : vague ? 'cité sans nom' : 'non cité'}, indice d'oxydation ${indice ? 'affiché' : 'non affiché'}.`, source: S.EDITO })

  const consigne = /(a )?conserver.{0,40}(frais|lumiere)|consommer dans les|apres ouverture/.test(m)
  c.push({ id: 'conservation', libelle: 'Conservation et emballage', max: 10, points: (consigne ? 5 : 0) + (e.emballage === 'opaque' ? 5 : 0), explication: `${consigne ? 'Consigne écrite' : 'Aucune consigne lue'}, emballage ${e.emballage ?? 'non vu'}.`, source: S.EDITO })

  const pl = new Plafond()
  if (vegetale) pl.baisser(30, 'Huile végétale : ni EPA ni DHA, note plafonnée à 30.')
  else if (!complet && t.omega3Pct === null) pl.baisser(50, 'EPA et DHA non chiffrés : note plafonnée à 50.')
  if (morue) {
    const vitChiffrees = /vitamine a\b[^.a-z]{0,8}\d/.test(texte) && /vitamine d3?\b[^.a-z]{0,8}\d/.test(texte)
    if (!vitChiffrees) pl.baisser(60, 'Foie de morue sans vitamines A et D chiffrées : note plafonnée à 60.')
    alertes.push(ALERTE_MORUE)
  }
  return total('huile', c, { fiabilite: complet && analyse ? 'haute' : complet || t.omega3Pct !== null ? 'moyenne' : 'faible', plafond: pl.v, alertes, message: MSG_CONSEIL }, 50)
}
