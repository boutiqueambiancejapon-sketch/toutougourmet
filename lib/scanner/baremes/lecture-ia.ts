import { LABEL_INSTRUCTIONS, LABEL_JSON_SCHEMA, type JsonSchema } from '../label-schema'
import { DOG_SIZES, LIFE_STAGES, PACKAGINGS, PRODUCT_TYPES } from '../types'
import { BAREMES_ACTIFS } from './config'

// @cdc scanner — prompt et schéma des nouveaux barèmes : l'ancien, plus les champs à lire. L'IA lit,
// le calcul reste dans le code. Tant que BAREMES_ACTIFS est faux, labelPrompt() rend l'ancien, intact.

const NOUVEAUX_CHAMPS: Record<string, JsonSchema> = {
  typeProduit: { type: 'string', enum: PRODUCT_TYPES, description: 'Type du produit, selon les règles de la consigne' },
  stade: { type: ['string', 'null'], enum: LIFE_STAGES, description: 'Stade de vie annoncé (tous = tous les âges), sinon null' },
  gabarit: { type: ['string', 'null'], enum: DOG_SIZES, description: 'Gabarit annoncé (mini ou small = petit, maxi ou large = grand), sinon null' },
  alimentVeterinaire: { type: 'boolean', description: 'true si aliment vétérinaire ou présenté pour une maladie (reins, foie, voies urinaires, diabète, cœur, cancer, épilepsie). Une promesse de confort (digestion, articulations, pelage) ne suffit pas' },
  tableauBrut: { type: ['string', 'null'], description: 'Constituants et teneurs (EPA, DHA, vitamines, actifs, UFC) recopiés tels quels, unités comprises, sinon null' },
  rationLue: { type: 'boolean', description: 'true si une ration ou une dose par jour est écrite' },
  ration10kgG: { type: ['number', 'null'], description: 'Quantité écrite pour un chien de 10 kg, en g ou en ml par jour, sans calcul ; si la ration est donnée par tranches de poids, celle qui contient 10 kg. Sinon null' },
  mentions: { type: ['string', 'null'], description: 'Promesse, origine, analyses, conservation, recopiées. 500 caractères au plus, jamais de menu de site' },
  emballage: { type: ['string', 'null'], enum: PACKAGINGS, description: 'Flacon ou sachet vu sur la photo, sinon null' },
}

export const LABEL_JSON_SCHEMA_V2: JsonSchema = {
  ...LABEL_JSON_SCHEMA,
  properties: { ...LABEL_JSON_SCHEMA.properties, ...NOUVEAUX_CHAMPS },
  required: [...(LABEL_JSON_SCHEMA.required ?? []), 'typeProduit', 'alimentVeterinaire', 'rationLue'],
}

export const LABEL_INSTRUCTIONS_V2 = `${LABEL_INSTRUCTIONS}
- Un produit pour chiens et chats compte comme un produit pour chien.
Pour typeProduit, réponds à ces questions dans l'ordre et arrête-toi à la première réponse :
1. Ça ne se mange pas (huile de coupe, de massage, shampoing, jouet, accessoire) : autre.
2. Ce n'est pas pour le chien : autre, avec l'animal dans espece.
3. Plus de 90 % de gras, ou uniquement des huiles : huile.
4. Un actif pour un besoin (articulations, digestion, stress, peau), une dose par jour, un comprimé, une gélule, une poudre, un sérum ou une pâte : complement.
5. « Aliment complémentaire », récompense, snack ou produit à mâcher : friandise.
6. « Aliment complet », croquettes ou pâtée : aliment.
7. Pas de réponse sûre : indetermine.`

export interface LabelPrompt {
  system: string
  schema: JsonSchema
}

export const PROMPT_ANCIEN: LabelPrompt = { system: LABEL_INSTRUCTIONS, schema: LABEL_JSON_SCHEMA }
export const PROMPT_V2: LabelPrompt = { system: LABEL_INSTRUCTIONS_V2, schema: LABEL_JSON_SCHEMA_V2 }

export const labelPrompt = (): LabelPrompt => (BAREMES_ACTIFS ? PROMPT_V2 : PROMPT_ANCIEN)
