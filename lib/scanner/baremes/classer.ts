import { normalize } from '../ingredients'
import type { Entree, Stade, TypeProduit } from './types'

// @cdc scanner — règle de secours sans IA : type, stade et gabarit lus dans le nom.

const REFUS = /kits? de coupe|huile (speciale )?d entretien|huile de coupe|massage|lubrifi|tondeuse|\bmoteur\b|shampo|lotion|lingettes?|collier|spot-on|nettoyant|doigtiers?|\bspray\b|tapis|jouet|\bballe\b|\blaisse\b|harnais|\bcoussins?\b|panier|gamelle|sacs? a dejections|\bkong\b|distributeur|couvercle/
const REFUS_HUILE = /huiles? [^,]*\b(soin|ricin|lavande)\b/
/** Un mot de nourriture empêche le refus, sauf quand le nom désigne un objet qui sert à la nourriture. */
const NOURRITURE = /croquettes?|patees?|nourriture|terrine|friandises?|snacks?|biscuits?|sticks?|bouchees?|complements?/
const OBJET_A_NOURRITURE = /(distributeur|gamelle|jouet|tapis|\bballe\b|\bsacs?\b|pochette|\bkong\b|couvercle|doseur|recipient|contenant)[^,]{0,30}(croquettes?|friandises?|snacks?|patees?|nourriture)/
const MOT_COMPLEMENT = /complements?|supplements?|probiotique|prebiotique|fortiflora|comprimes?|tablettes?|\btabs\b|serum|pate (calmante|vital|multi)|\bpate\b.*(support|intestin)|poudre (pour|de moules)|pellets pour|melange (de vitamines|d herbes)|intesto|adaptil chew|\bflore\b|multi ?vitamine|bonbons? pour|snack (flexi|soft|bright)|calm & chill|tummy & comfort|medica .*snacks?/
/** Noms d'huile en allemand : l'étiquette peut n'avoir que cette langue. */
const OL = /\b(lachs|saumon|fisch|poisson|dorsch|krill|lein|hanf|distel|raps|sonnenblumen|sesam) ?ol\b|lebertran/
const MOT_HUILE = /(^|[^a-z])huiles? (de|d |aux|pour)|salmon oil|fish oil|cod liver|\b\w+ oil\b/
const MOT_FRIANDISE = /friandises?|snacks?|sticks?|biscuits?|dentastix|dentalife|whimzees|brosse a dents|jerky|oreilles?|trachees?|os a macher|a macher|a croquer|bouchees?|bonbons?|recompense|ranchos|schmackos|hygiene dentaire|sprats?|lamelles?|deli bites|calendrier|meaties|trainies|bonies|sandwich|peau de|os de/
const MOT_REPAS = /croquettes?|patees?|nourriture|aliments?|terrine|boites?|barquettes?|sachets?|mousse|repas|menu|adulte?|puppy|chiots?|senior/

/** Refus, huile, complément, friandise, repas. Sans mot de repas, la règle hésite : pas de note. */
export function classer(e: Pick<Entree, 'marque' | 'produit' | 'ingredients' | 'constituants'>): TypeProduit {
  const brut = `${e.marque ?? ''} ${e.produit ?? ''}`.toLowerCase()
  const n = normalize(`${e.marque ?? ''} ${e.produit ?? ''}`)
  const croq = /croquettes?|boites?|nourriture humide/.test(n)
  if (/brosse a dents/.test(n)) return 'friandise'
  if (REFUS_HUILE.test(n) || OBJET_A_NOURRITURE.test(n) || (REFUS.test(n) && !NOURRITURE.test(n))) return 'autre'
  const gras = e.constituants.matieresGrasses
  const huile = MOT_HUILE.test(n) || OL.test(n) || /cod liver|salmon oil|fish oil/.test(brut) || (e.ingredients.length > 0 && e.ingredients.length <= 8 && e.ingredients.every((i) => /huile|\boil\b/.test(normalize(i.nom)) || OL.test(normalize(i.nom))))
  if (huile && !/bonbons?|friandise|filet|deli bites/.test(n) && (gras === null || gras >= 90)) return 'huile'
  if (MOT_COMPLEMENT.test(n) && !croq) return 'complement'
  if (MOT_FRIANDISE.test(n)) return /croquettes?/.test(n) ? 'aliment' : 'friandise'
  if (MOT_REPAS.test(n)) return 'aliment'
  return 'indetermine'
}

export function stadeDe(produit: string | null): Stade {
  const brut = (produit ?? '').toLowerCase()
  const n = normalize(produit ?? '')
  if (/toutes? (les )?(etapes|ages)|all life|tous ages/.test(n)) return 'tous'
  if (/\b(chiots?|puppy|junior|starter|croissance)\b/.test(n)) return 'chiot'
  if (/\b(senior|ageing|age defence|mature|aged)\b/.test(n) || /(^|[^0-9])([5-9]|1[0-9]) ?\+/.test(brut)) return 'senior'
  return 'adulte'
}

export const estGrand = (p: string | null) => /\b(maxi|large|giant|grandes? (taille|race)s?|moyen et grand|labrador|golden|berger allemand|boxer|rottweiler|xl)\b/.test(normalize(p ?? ''))
export const estPetit = (p: string | null) => /\b(mini|small)\b/.test(normalize(p ?? ''))
export const estAllege = (p: string | null) => /\b(light|weight|sterilis\w*|fit & trim|satiety|surpoids|allege\w*)\b/.test(normalize(p ?? ''))
