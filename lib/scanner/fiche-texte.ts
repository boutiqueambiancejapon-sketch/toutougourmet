import { isCereal } from './ingredients'
import { dryMatterBasis } from './score'
import type { ExtractedLabel } from './types'

// @cdc seo — textes d'une fiche calculés à partir de sa composition : ils changent avec le produit. Fonctions pures.
// Une phrase n'existe que si la donnée existe. Aucune promesse de soin.

const nb = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })

/** H1 d'une fiche indexée. L'année est calculée à l'affichage : elle passe seule à l'année suivante le 1er janvier. */
export const h1Fiche = (nom: string, annee: number): string => `Avis ${nom} ${annee}`

/** Le nom exact et l'année d'abord : « composition » saute si le titre dépasserait 60 signes. */
export function titreFiche(nom: string, note: number | null, annee: number): string {
  const debut = h1Fiche(nom, annee)
  const long = `${debut} : composition et note ${note}/100`
  return long.length <= 60 ? long : `${debut} : note ${note}/100`
}

export interface Place {
  marque: string
  rang: number
  total: number
  note: number
  moyenne: number | null
  nombre: number
  pluriel: string | null
  partAnimale: number | null
}

export function phrasesPlace(p: Place): string[] {
  const out: string[] = []
  if (p.total >= 3) out.push(p.rang === 1 ? `Aucune des ${p.total} recettes ${p.marque} lues ne note mieux.` : `Cette recette arrive ${p.rang}e sur ${p.total} recettes ${p.marque} lues.`)
  if (p.moyenne !== null && p.pluriel && p.nombre >= 10) {
    const d = p.note - p.moyenne
    const base = `la moyenne des ${p.nombre} ${p.pluriel} de notre base (${p.moyenne}/100)`
    out.push(d === 0 ? `Sa note égale ${base}.` : `Sa note est ${Math.abs(d)} point${Math.abs(d) > 1 ? 's' : ''} ${d > 0 ? 'au-dessus' : 'en dessous'} de ${base}.`)
  }
  if (p.partAnimale !== null && p.partAnimale > 0) out.push(`Les ingrédients d'origine animale déclarés pèsent ${nb(p.partAnimale)} % de la recette.`)
  return out
}

function cible(nom: string): string | null {
  const age = /chiot|puppy|junior|starter/i.test(nom) ? 'le chiot' : /senior|mature|ageing|âgé|\b[5-9]\+|\b12\+/i.test(nom) ? 'le chien âgé' : /adult/i.test(nom) ? 'le chien adulte' : null
  const taille = /x-?small/i.test(nom) ? 'de très petite taille' : /\bmini\b|\bsmall\b|petit/i.test(nom) ? 'de petite taille' : /\bmedium\b|moyen/i.test(nom) ? 'de taille moyenne' : /\bgiant\b|géant/i.test(nom) ? 'de très grande taille' : /\bmaxi\b|\blarge\b|grande? /i.test(nom) ? 'de grande taille' : null
  if (!age) return null
  return `D'après son nom, cette recette vise ${age}${taille ? ` ${taille}` : ''}.`
}

export function phrasesChien(nom: string, label: ExtractedLabel): string[] {
  const d = dryMatterBasis(label.constituants, label.typeAliment)
  const out: string[] = []
  const c = cible(nom)
  if (c) out.push(c)
  if (d.fatDm !== null && d.fatDm >= 30) out.push(`Avec ${nb(d.fatDm)} % de matières grasses une fois l'eau retirée, elle est très énergétique : pour un chien en surpoids ou sujet à la pancréatite, demande d'abord à ton vétérinaire.`)
  if (d.carbsDm !== null && d.carbsDm >= 45) out.push(`Environ ${nb(d.carbsDm)} % de glucides une fois l'eau retirée : l'amidon occupe une grande place dans la recette.`)
  if (d.protDm !== null && d.protDm < 18) out.push(`Ses ${nb(d.protDm)} % de protéines une fois l'eau retirée restent sous le minimum de 18 % de la FEDIAF pour un chien adulte.`)
  return out
}

export interface Question {
  q: string
  r: string
}

export function questionsFiche(nom: string, label: ExtractedLabel, note: number | null, magasin: string | null): Question[] {
  const out: Question[] = []
  const first = label.ingredients[0]
  const n = label.ingredients.length
  if (first) out.push({ q: `Quel est le premier ingrédient de ${nom} ?`, r: `« ${first.nom} ». La liste de composition classe les ingrédients du plus lourd au plus léger.` })
  if (n >= 5) {
    const cereales = label.ingredients.filter((i) => isCereal(i.nom)).map((i) => i.nom)
    out.push({ q: `Y a-t-il des céréales dans ${nom} ?`, r: cereales.length ? `Oui, la composition en cite ${cereales.length} : ${cereales.join(', ')}.` : `La composition lue n'en cite aucune parmi ses ${n} ingrédients.` })
  }
  const d = dryMatterBasis(label.constituants, label.typeAliment)
  if (label.constituants.proteines !== null && d.protDm !== null) out.push({ q: `Combien de protéines contient ${nom} ?`, r: `${nb(label.constituants.proteines)} % sur l'étiquette, soit ${nb(d.protDm)} % une fois l'eau retirée.` })
  if (note !== null) out.push({ q: `Que veut dire la note de ${nom} ?`, r: `${note}/100 résume ce que dit l'étiquette, avec notre barème publié. Ce n'est ni un test sur des chiens ni un conseil de vétérinaire.` })
  if (magasin) out.push({ q: `Où acheter ${nom} ?`, r: `Chez ${magasin}, avec le bouton de cette page. C'est un lien partenaire.` })
  return out
}
