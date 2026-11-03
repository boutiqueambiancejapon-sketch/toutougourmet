// @cdc profil chien — allergies tapées en étiquettes (formulaire du chien, fiche de garde) :
// même nettoyage dans le navigateur et sur le serveur. Limites : 10 étiquettes de 40 caractères.

export const ALLERGIES_MAX = 10
export const ALLERGY_LENGTH = 40

/** Proposées sous le champ, dans cet ordre (les allergènes alimentaires les plus cités chez le chien). */
export const COMMON_ALLERGIES = ['bœuf', 'poulet', 'blé', 'produits laitiers', 'œuf', 'soja', 'agneau', 'poisson', 'maïs'] as const

/** Espaces réduits, première lettre en minuscule sauf sigle (« Bœuf » devient « bœuf », « OGM » reste). */
export function cleanAllergy(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > 1 && t !== t.toUpperCase() ? t.charAt(0).toLowerCase() + t.slice(1) : t
}

/** Liste nettoyée, sans doublon (casse ignorée), dans l'ordre de saisie. */
export function uniqueAllergies(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const a = cleanAllergy(raw)
    const key = a.toLocaleLowerCase('fr')
    if (a === '' || seen.has(key)) continue
    seen.add(key)
    out.push(a)
  }
  return out
}

/** Texte libre de la fiche de garde (« bœuf, poulet ») vers des étiquettes valides pour le profil. */
export function allergiesFromText(s: string): string[] {
  return uniqueAllergies(s.split(/[,;\n]/))
    .filter((a) => a.length <= ALLERGY_LENGTH)
    .slice(0, ALLERGIES_MAX)
}
