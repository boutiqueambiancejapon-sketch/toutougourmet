import { CONFIDENCE_FIELDS, type ExtractedLabel } from './types'

// @cdc lot 6 — étiquettes fictives (marques inventées) : exemple de la page /scanner et cas des
// tests de la note (scripts/test-scanner-score.ts).

const sure = Object.fromEntries(CONFIDENCE_FIELDS.map((k) => [k, 'haute'])) as ExtractedLabel['confiance']

export const PREMIUM_LABEL: ExtractedLabel = {
  estUneEtiquette: true,
  marque: 'Brindille',
  produit: 'Adulte saumon et poulet',
  ean: '3760000000017',
  espece: 'chien',
  typeAliment: 'sec',
  ingredients: [
    { nom: 'Saumon frais', pourcentage: 30 },
    { nom: 'Poulet déshydraté', pourcentage: 25 },
    { nom: 'Patate douce', pourcentage: null },
    { nom: 'Pois', pourcentage: null },
    { nom: 'Graisse de poulet', pourcentage: 6 },
    { nom: 'Huile de saumon', pourcentage: 2 },
    { nom: 'Pulpe de betterave', pourcentage: null },
    { nom: 'Levure de bière', pourcentage: null },
  ],
  constituants: { proteines: 32, matieresGrasses: 18, cellulose: 3, cendres: 8, humidite: 8, calcium: 1.4, phosphore: 1 },
  additifs: ['Vitamine A 15 000 UI/kg', 'Extraits de romarin', 'Tocophérols'],
  partAnimaleDeclaree: null,
  confiance: sure,
  illisibles: [],
}

export const SUPERMARKET_LABEL: ExtractedLabel = {
  estUneEtiquette: true,
  marque: 'Canivore',
  produit: 'Croquettes au poulet',
  ean: '3760000000024',
  espece: 'chien',
  typeAliment: 'sec',
  ingredients: [
    { nom: 'Céréales (maïs, blé)', pourcentage: null },
    { nom: 'Viandes et sous-produits animaux (dont poulet 4 %)', pourcentage: null },
    { nom: "Dérivés d'origine végétale", pourcentage: null },
    { nom: 'Huiles et graisses', pourcentage: null },
    { nom: 'Sucres', pourcentage: null },
    { nom: 'Substances minérales', pourcentage: null },
  ],
  constituants: { proteines: 18, matieresGrasses: 8, cellulose: 2.5, cendres: 7.5, humidite: null, calcium: null, phosphore: null },
  additifs: ['Colorants', 'Antioxydant : BHA (E320)'],
  partAnimaleDeclaree: null,
  confiance: sure,
  illisibles: [],
}

export const INCOMPLETE_LABEL: ExtractedLabel = {
  estUneEtiquette: true,
  marque: 'Brindille',
  produit: null,
  ean: null,
  espece: 'chien',
  typeAliment: 'sec',
  ingredients: [
    { nom: 'Agneau déshydraté', pourcentage: 28 },
    { nom: 'Riz', pourcentage: null },
    { nom: 'Graisse de volaille', pourcentage: null },
  ],
  constituants: { proteines: null, matieresGrasses: null, cellulose: null, cendres: null, humidite: null, calcium: null, phosphore: null },
  additifs: [],
  partAnimaleDeclaree: null,
  confiance: { ...sure, produit: 'absent', ean: 'absent', constituants: 'absent', additifs: 'absent' },
  illisibles: ['constituants analytiques coupés au bord de la photo'],
}
