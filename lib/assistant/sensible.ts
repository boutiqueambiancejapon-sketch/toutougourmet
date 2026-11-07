import type { Gravite } from './urgence'

// @cdc assistant — garde-fou (décision du propriétaire du 2026-11-07) : maladie, médicament, gestation, fin de vie
// ou signe d'urgence. Milo ne répond pas sur le fond et renvoie vers le vétérinaire, sans appel à l'IA.

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const URGENCE = /convuls|ne respire (plus|pas)|respire (mal|difficilement)|etouff|inconscient|s'?est effondre|ne se leve plus|paralys|vomit du sang|sang dans (ses|les) (selles|vomi)|empoisonn|intoxiqu|ventre (gonfle|dur)|torsion|raticide|antigel|coup de chaleur|\b(a|as|ont) (mange|avale|croque|chipe|vole).{0,20}(raisins?|xylitol)\b/
const SENSIBLE = /maladie|malade|insuffisance|diabet|cancer|tumeur|lymphome|chimio|epilep|leishman|cushing|addison|pancreatite|hepat|cirrhose|cardiaque|cardiopathie|calculs? (renaux|urinaires)|cristaux|infection|allergie severe|medicament|antibiotique|anti-?inflammatoire|cortisone|corticoide|posologie|\bdose\b|paracetamol|ibuprofene|aspirine|traitement|ordonnance|operation|chirurgie|sterilisation recente|gestante|enceinte|mise bas|allaite|euthanas|fin de vie|mourir|va mourir/

export function sujetSensible(question: string): Exclude<Gravite, 'aucune'> | null {
  const q = fold(question)
  if (URGENCE.test(q)) return 'urgence'
  if (SENSIBLE.test(q)) return 'veterinaire'
  return null
}

export const REPONSE_SENSIBLE: Record<Exclude<Gravite, 'aucune'>, string> = {
  urgence: "Ça ressemble à une urgence : appelle tout de suite ton vétérinaire ou un centre antipoison, sans attendre. Je suis un Shiba qui parle gamelle, pas un vétérinaire, et là chaque minute passée à m'écrire est une minute de perdue.",
  veterinaire: "Là, c'est à ton vétérinaire de répondre : maladie, médicament, gestation ou traitement, il connaît le dossier de ton chien et moi non. Je préfère ne pas te donner un conseil qui pourrait lui faire du tort. Si un de nos articles parle du sujet, je te le mets en dessous pour préparer ta question.",
}
