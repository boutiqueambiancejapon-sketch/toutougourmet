import { normalize } from '../ingredients'
import type { Entree } from './types'

// @cdc scanner — aliments vétérinaires et maladies graves : jamais de note, à juger avec le vétérinaire.

// Les gammes dont seul le type fait la différence (Hypoallergenic) ne sont pas ici : à trancher par l'IA, champ alimentVeterinaire.
const VETERINAIRE = /\b(renal|renale?s?|renaux|kidney|hepatic|hepatiques?|urinary|urinaires?|gastro.?intestinal\w*|glycobalance|diabet\w*|prescription|veterinary|veterinaires?)\b|\b[acdgikrtwz]\/d\b/
export const estVeterinaire = (e: Pick<Entree, 'marque' | 'produit' | 'alimentVeterinaire'>) =>
  e.alimentVeterinaire === true || VETERINAIRE.test(normalize(`${e.marque ?? ''} ${e.produit ?? ''}`).replace(/veterinary approved|(recommande|conseille)e?s? par les veterinaires/g, ' '))
