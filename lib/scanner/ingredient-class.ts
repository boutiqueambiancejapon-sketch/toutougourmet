import { animalKind, controversialPreservatives, hasColorant, hasSugar, isByProduct, isCereal, isUnnamedAnimal } from './ingredients'

// @cdc lot 6 — couleur d'un ingrédient sur la fiche imprimable : espèce animale nommée (vert),
// origine animale sans espèce (ambre), céréale (gris), additif controversé ou sucre (rose).
// Mêmes listes que la note (lib/scanner/ingredients.ts). Fonction pure.

export type IngredientClass = 'nommee' | 'non-nommee' | 'cereale' | 'controverse' | 'autre'

export function ingredientClass(name: string): IngredientClass {
  if (controversialPreservatives([name]).length > 0 || hasColorant(name) || hasSugar(name)) return 'controverse'
  const kind = animalKind(name)
  if (kind === 'non-nommee' || isByProduct(name) || isUnnamedAnimal(name)) return 'non-nommee'
  if (kind === 'nommee') return 'nommee'
  if (isCereal(name)) return 'cereale'
  return 'autre'
}

export const INGREDIENT_CLASS_LABELS: Record<Exclude<IngredientClass, 'autre'>, string> = {
  nommee: 'Espèce animale nommée',
  'non-nommee': 'Origine animale sans espèce',
  cereale: 'Céréale',
  controverse: 'Additif controversé ou sucre',
}
