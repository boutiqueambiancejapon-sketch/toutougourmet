import { findAllergens } from '@/lib/allergen-match'
import type { ActivityLevel, AgeGroup } from '@/lib/calculators'

// @cdc profil chien — « Vérifier pour mon chien » : compare ce que dit l'étiquette au profil du chien. Trois réponses,
// avec leurs raisons. Pas de note, pas de diagnostic : un chien malade passe par son vétérinaire. Fonction pure.

export type Statut = 'convient' | 'verifier' | 'eviter'

export interface ChienProfil {
  id: string
  name: string
  age: AgeGroup | null
  weightKg: number | null
  activity: ActivityLevel | null
  sterilized: boolean | null
  allergies: string[]
}

export interface ProduitProfil {
  nom: string
  friandise: boolean
  ingredients: string[]
  protDm: number | null
  fatDm: number | null
  alertes: string[]
  veterinaire: boolean
}

export interface Verification {
  statut: Statut
  raisons: string[]
  /** Informations absentes du profil, qui rendraient la réponse plus précise. */
  manque: string[]
}

const PROTEINES_MIN: Record<AgeGroup, number> = { chiot: 25, adulte: 18, senior: 21 }
const nb = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })

export function verifierPourChien(p: ProduitProfil, c: ChienProfil): Verification {
  const eviter: string[] = []
  const verifier: string[] = []
  for (const h of findAllergens(c.allergies, p.ingredients)) {
    if (h.possible) verifier.push(`« ${h.ingredient} » peut contenir un aliment noté dans ses allergies (${h.allergy}).`)
    else eviter.push(`Contient « ${h.ingredient} », noté dans ses allergies.`)
  }
  verifier.push(...p.alertes)
  if (p.veterinaire) verifier.push('Aliment vétérinaire : à donner seulement sur avis de ton vétérinaire.')

  if (!p.friandise) {
    const pourChiot = /chiot|puppy|junior|starter/i.test(p.nom)
    if (c.age === 'chiot' && !pourChiot) verifier.push(`${c.name} est encore un chiot, et le nom de cette recette ne le mentionne pas : vérifie sur le sac qu'elle convient à la croissance.`)
    if (c.age && c.age !== 'chiot' && pourChiot) verifier.push(`Recette pour chiot, alors que ${c.name} a passé cet âge.`)
    const min = c.age ? PROTEINES_MIN[c.age] : null
    if (min !== null && p.protDm !== null && p.protDm < min) verifier.push(`${nb(p.protDm)} % de protéines une fois l'eau retirée, sous le repère de ${min} % pour son âge.`)
    if (c.weightKg !== null) {
      if (/\b(x-?small|mini|small)\b/i.test(p.nom) && c.weightKg > 15) verifier.push(`Recette pensée pour les petits chiens, et ${c.name} pèse ${nb(c.weightKg)} kg.`)
      if (/\b(maxi|large|giant)\b|grande? (race|taille)/i.test(p.nom) && c.weightKg < 15 && c.age !== 'chiot') verifier.push(`Recette pensée pour les grands chiens, et ${c.name} pèse ${nb(c.weightKg)} kg.`)
    }
    if (p.fatDm !== null && p.fatDm >= 30 && (c.activity === 'sedentaire' || c.sterilized === true)) {
      verifier.push(`Recette très énergétique pour un chien ${c.activity === 'sedentaire' ? 'peu actif' : 'stérilisé'} : surveille sa ration et son poids.`)
    }
  }

  const manque = [c.age ? null : 'sa date de naissance', c.weightKg === null ? 'son poids' : null].filter((x): x is string => x !== null)
  return { statut: eviter.length ? 'eviter' : verifier.length ? 'verifier' : 'convient', raisons: [...eviter, ...verifier], manque }
}
